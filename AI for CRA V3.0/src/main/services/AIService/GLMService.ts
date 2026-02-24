/**
 * GLM-4 AI Service - Main AI integration service
 * Uses native HTTPS calls with JWT token generation (no external SDK needed)
 */

import * as https from 'https';
import * as http from 'http';
import * as crypto from 'crypto';
import {
  Result,
  ok,
  err,
  createError,
  ErrorCategory,
  ErrorSeverity,
  CriteriaSet,
  InclusionCriteria,
  ExclusionCriteria,
  VisitSchedule,
  Procedure,
  Assessment,
  MedicationRecord,
} from '@shared/types/core';
import {
  formatPrompt,
  truncateContent,
  SYSTEM_PROMPT,
  CRITERIA_EXTRACTION_PROMPT,
  VISIT_SCHEDULE_EXTRACTION_PROMPT,
  MEDICATION_RECOGNITION_PROMPT,
  SUBJECT_NUMBER_EXTRACTION_PROMPT,
  SUBJECT_VISIT_DATES_PROMPT,
  SUBJECT_VISIT_ITEMS_PROMPT,
} from './prompts';

// ============================================================================
// Types
// ============================================================================

export interface GLMConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  timeout?: number;
  maxRetries?: number;
  maxRequestsPerMinute?: number;
  proxy?: string;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface APIResponse {
  choices: Array<{
    message?: {
      content?: string;
    };
  }>;
}

// ============================================================================
// JWT Token Generation (matches ZhipuAI official implementation)
// ============================================================================

/**
 * Generate JWT token for ZhipuAI API authentication
 */
function generateToken(apiKey: string): string {
  // API Key format: id.secret
  const parts = apiKey.split('.');
  if (parts.length !== 2) {
    throw new Error('无效的API密钥格式');
  }

  const [id, secret] = parts;
  const now = Date.now();

  // JWT header
  const header = { alg: 'HS256', sign_type: 'SIGN' };

  // JWT payload
  const payload = {
    api_key: id,
    exp: now + 3600000, // Expires in 1 hour
    timestamp: now,
  };

  // Base64URL encode (without padding)
  const base64UrlEncode = (str: string) => {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  // Create signature
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signatureInput)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// ============================================================================
// Rate Limiter
// ============================================================================

class RateLimiter {
  private requests: number[] = [];
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Remove old requests outside the window
    this.requests = this.requests.filter((time) => time > windowStart);

    // If at limit, wait
    if (this.requests.length >= this.config.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = oldestRequest + this.config.windowMs - now;
      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    // Record this request
    this.requests.push(Date.now());
  }

  reset(): void {
    this.requests = [];
  }
}

// ============================================================================
// GLM Service
// ============================================================================

export class GLMService {
  private config: Required<GLMConfig>;
  private rateLimiter: RateLimiter;
  private baseURL: string;
  private initialized: boolean = false;

  constructor(config: GLMConfig) {
    this.config = {
      apiKey: config.apiKey,
      model: config.model || 'glm-4',
      temperature: config.temperature || 0.3,
      topP: config.topP || 0.7,
      maxTokens: config.maxTokens || 10000, // Increased to handle large visit schedules
      timeout: config.timeout || 120000, // 120 seconds - increased for large requests
      maxRetries: config.maxRetries || 3,
      maxRequestsPerMinute: config.maxRequestsPerMinute || 60,
      proxy: config.proxy || '',
    };

    this.baseURL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    this.rateLimiter = new RateLimiter({
      maxRequests: this.config.maxRequestsPerMinute,
      windowMs: 60000, // 1 minute
    });
  }

  /**
   * Initialize the GLM service
   */
  initialize(): Result<void> {
    if (!this.config.apiKey) {
      return err(
        createError(
          'AI_NO_API_KEY',
          ErrorCategory.DOMAIN,
          ErrorSeverity.CRITICAL,
          '请先设置GLM-4 API密钥',
          'API key is not configured',
          { source: 'GLMService' }
        )
      );
    }

    this.initialized = true;
    return ok(undefined);
  }

  /**
   * Check if an error is retryable based on its type/message
   */
  private isRetryableError(error: Error): boolean {
    const errorMessage = error.message;
    const errorCode = (error as any).code;

    // Retry on network errors
    const retryableCodes = ['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'EPIPE', 'EAI_AGAIN'];
    if (errorCode && retryableCodes.includes(errorCode)) {
      return true;
    }

    // Retry on specific error messages
    const retryablePatterns = [
      /socket hang up/i,
      /timeout/i,
      /network/i,
      /fetch failed/i,
      /5\d\d/, // 5xx server errors
    ];

    return retryablePatterns.some(pattern => pattern.test(errorMessage));
  }

  /**
   * Call GLM API with retry logic
   */
  private async callWithRetry<T>(
    fn: () => Promise<T>,
    context: string
  ): Promise<Result<T>> {
    if (!this.initialized) {
      return err(
        createError(
          'AI_NOT_INITIALIZED',
          ErrorCategory.DOMAIN,
          ErrorSeverity.CRITICAL,
          'AI服务未初始化',
          'GLM service is not initialized',
          { source: 'GLMService' }
        )
      );
    }

    await this.rateLimiter.waitForSlot();

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        console.log(`[GLM API] Attempt ${attempt + 1}/${this.config.maxRetries} for ${context}`);
        const result = await fn();
        return ok(result);
      } catch (error) {
        lastError = error as Error;
        const errorCode = (error as any).code;

        console.error(`[GLM API] Attempt ${attempt + 1} failed:`, {
          message: lastError.message,
          code: errorCode,
          context
        });

        // Don't retry on authentication errors (401) or permission errors (403)
        if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
          return err(
            createError(
              'AI_AUTH_FAILED',
              ErrorCategory.NETWORK,
              ErrorSeverity.CRITICAL,
              'API密钥无效或权限不足，请检查设置',
              error.message,
              { attempt, context }
            )
          );
        }

        // Don't retry on bad request (400) - indicates client error
        if (error instanceof Error && error.message.includes('400')) {
          return err(
            createError(
              'AI_BAD_REQUEST',
              ErrorCategory.DOMAIN,
              ErrorSeverity.CRITICAL,
              '请求格式错误',
              error.message,
              { attempt, context }
            )
          );
        }

        // Check if error is retryable
        if (!this.isRetryableError(lastError)) {
          console.error('[GLM API] Non-retryable error encountered:', lastError.message);
          return err(
            createError(
              'AI_REQUEST_FAILED',
              ErrorCategory.NETWORK,
              ErrorSeverity.CRITICAL,
              'AI请求失败，请检查网络连接',
              lastError.message,
              { attempts: attempt + 1, context }
            )
          );
        }

        // Wait before retry (exponential backoff with jitter)
        if (attempt < this.config.maxRetries - 1) {
          const baseDelay = 1000 * Math.pow(2, attempt);
          const jitter = Math.random() * 500; // Add 0-500ms jitter
          const delay = baseDelay + jitter;
          console.log(`[GLM API] Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // All retries exhausted
    const errorCode = (lastError as any)?.code;
    const errorMessage = lastError?.message || 'Unknown error';

    // Provide user-friendly error messages based on error code
    let userMessage = 'AI请求失败，请检查网络连接';
    if (errorCode === 'ECONNRESET') {
      userMessage = 'API连接被服务器中断，可能是服务器繁忙或请求过大，请稍后重试';
    } else if (errorCode === 'ETIMEDOUT') {
      userMessage = 'API请求超时，请检查网络连接或稍后重试';
    } else if (errorCode === 'ENOTFOUND') {
      userMessage = '无法连接到API服务器，请检查网络设置';
    }

    return err(
      createError(
        'AI_REQUEST_FAILED',
        ErrorCategory.NETWORK,
        ErrorSeverity.CRITICAL,
        userMessage,
        errorMessage,
        { attempts: this.config.maxRetries, context, errorCode }
      )
    );
  }

  /**
   * Call GLM API using native HTTPS
   */
  private async callAPI(messages: Array<{ role: string; content: string }>): Promise<string> {
    // Validate API key
    if (!this.config.apiKey || this.config.apiKey.trim().length === 0) {
      throw new Error('API 密钥未设置');
    }

    // Validate API key format (should be id.secret format)
    if (!this.config.apiKey.includes('.')) {
      throw new Error('API 密钥格式无效');
    }

    // Generate JWT token
    const token = generateToken(this.config.apiKey);

    // Prepare request body
    const requestBody = {
      model: this.config.model,
      messages,
      temperature: this.config.temperature,
      top_p: this.config.topP,
      max_tokens: this.config.maxTokens,
    };

    console.log('[GLM API] Sending request to:', this.baseURL);
    console.log('[GLM API] Request body size:', JSON.stringify(requestBody).length, 'bytes');

    // Make HTTPS request
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseURL);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: this.config.timeout,
      };

      const req = https.request(options, (res) => {
        let data = '';

        console.log('[GLM API] Response status:', res.statusCode);

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            console.log('[GLM API] Response size:', data.length, 'bytes');

            if (res.statusCode !== 200) {
              console.error('[GLM API] Error response:', data);
              throw new Error(`API returned status ${res.statusCode}: ${data}`);
            }

            const response: APIResponse = JSON.parse(data);
            const content = response.choices[0]?.message?.content;

            if (!content) {
              throw new Error('Empty response content from API');
            }

            console.log('[GLM API] Success, content length:', content.length);
            resolve(content);
          } catch (error) {
            console.error('[GLM API] Parse error:', error);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error('[GLM API] Request error:', error);
        reject(new Error(`Network error: ${error.message}`));
      });

      req.on('timeout', () => {
        console.error('[GLM API] Request timeout after', this.config.timeout, 'ms');
        req.destroy();
        reject(new Error(`Request timeout after ${this.config.timeout}ms`));
      });

      req.write(JSON.stringify(requestBody));
      req.end();
    });
  }

  /**
   * Attempt to fix incomplete/truncated JSON
   */
  private fixIncompleteJSON(jsonStr: string): string {
    let fixed = jsonStr;

    // 1. Remove trailing commas before brackets/braces
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

    // 2. Fix incomplete strings (if string is not closed)
    // Count quotes - if odd, we have an unclosed string
    const quotes = (fixed.match(/"/g) || []).length;
    const insideString = quotes % 2 !== 0;

    if (insideString) {
      // Find the last quote and close the string
      const lastQuoteIndex = fixed.lastIndexOf('"');
      if (lastQuoteIndex !== -1) {
        // Remove everything after the last quote starting position
        // and close the string properly
        const beforeLastQuote = fixed.substring(0, lastQuoteIndex);
        // Check if we're inside a property name or value
        const lastKeyStart = beforeLastQuote.lastIndexOf('"');
        if (lastKeyStart !== -1 && lastKeyStart < lastQuoteIndex) {
          // We have an unclosed string, close it
          fixed = fixed.substring(0, lastQuoteIndex + 1) + '"';
        }
      }
    }

    // 3. Fix incomplete objects/arrays (remove incomplete trailing items)
    // If we end with an incomplete property, remove it
    fixed = fixed.replace(/,\s*"[^"]*:\s*[^,}\]]*$/, '');

    // 4. Count brackets and close them
    const openBraces = (fixed.match(/\{/g) || []).length;
    const closeBraces = (fixed.match(/\}/g) || []).length;
    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/\]/g) || []).length;

    // Close missing brackets first (innermost)
    const missingBrackets = openBrackets - closeBrackets;
    for (let i = 0; i < missingBrackets; i++) {
      fixed += ']';
    }

    // Close missing braces (outermost)
    const missingBraces = openBraces - closeBraces;
    for (let i = 0; i < missingBraces; i++) {
      fixed += '}';
    }

    return fixed;
  }

  /**
   * Parse JSON response from AI
   */
  private parseJSONResponse<T>(response: string): Result<T> {
    console.log('[parseJSONResponse] Response length:', response.length);
    console.log('[parseJSONResponse] Response preview (first 500 chars):', response.substring(0, 500));

    let jsonStr = response;

    // Extract from ```json blocks
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      console.log('[parseJSONResponse] Found ```json block');
      jsonStr = jsonMatch[1];
    } else {
      // Extract from ``` blocks
      const codeMatch = response.match(/```\s*([\s\S]*?)\s*```/);
      if (codeMatch) {
        console.log('[parseJSONResponse] Found ``` block');
        jsonStr = codeMatch[1];
      } else {
        // Find JSON object in the response
        const objectMatch = response.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          console.log('[parseJSONResponse] Found JSON object');
          jsonStr = objectMatch[0];
        }
      }
    }

    console.log('[parseJSONResponse] JSON length before fix:', jsonStr.length);

    // First attempt: try parsing as-is
    try {
      const parsed = JSON.parse(jsonStr);
      console.log('[parseJSONResponse] Successfully parsed, keys:', Object.keys(parsed));
      return ok(parsed as T);
    } catch (error) {
      console.warn('[parseJSONResponse] Initial parse failed, attempting to fix incomplete JSON...');
      console.warn('[parseJSONResponse] Error:', (error as Error).message);
    }

    // Second attempt: try fixing incomplete JSON
    try {
      const fixed = this.fixIncompleteJSON(jsonStr);
      console.log('[parseJSONResponse] Fixed JSON length:', fixed.length);
      console.log('[parseJSONResponse] Added chars:', fixed.length - jsonStr.length);
      const parsed = JSON.parse(fixed);
      console.log('[parseJSONResponse] Successfully parsed after fix, keys:', Object.keys(parsed));
      return ok(parsed as T);
    } catch (error) {
      console.error('[parseJSONResponse] Parse error after fix:', error);
      // Show more context around the error position
      const errorMsg = (error as Error).message;
      const match = errorMsg.match(/position (\d+)/);
      if (match) {
        const pos = parseInt(match[1]);
        const start = Math.max(0, pos - 200);
        const end = Math.min(jsonStr.length, pos + 200);
        console.error('[parseJSONResponse] Error context:', jsonStr.substring(start, end));
      } else {
        console.error('[parseJSONResponse] Error response (first 1000 chars):', response.substring(0, 1000));
      }

      return err(
        createError(
          'AI_PARSE_FAILED',
          ErrorCategory.DOMAIN,
          ErrorSeverity.CRITICAL,
          'AI响应解析失败，返回的JSON格式不完整或有错误',
          errorMsg,
          { response: response.substring(0, 1000) }
        )
      );
    }
  }

  // ==========================================================================
  // Worksheet 1: Criteria Extraction
  // ==========================================================================

  /**
   * Extract inclusion and exclusion criteria from protocol
   */
  async extractCriteria(protocolContent: string): Promise<Result<CriteriaSet>> {
    const truncatedContent = truncateContent(protocolContent);
    const prompt = formatPrompt(CRITERIA_EXTRACTION_PROMPT, { content: truncatedContent });

    const responseResult = await this.callWithRetry(async () => {
      return await this.callAPI([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ]);
    }, 'extractCriteria');

    if (responseResult.success === false) {
      return err(responseResult.error);
    }

    const parseResult = this.parseJSONResponse<{
      inclusionCriteria: Array<{ number: string; description: string; category?: string }>;
      exclusionCriteria: Array<{ number: string; description: string; category?: string }>;
    }>(responseResult.data);

    if (parseResult.success === false) {
      return err(parseResult.error);
    }

    const data = parseResult.data;

    // Transform to proper types
    const inclusionCriteria: InclusionCriteria[] = (data.inclusionCriteria || []).map((item, index) => ({
      id: `inc-${Date.now()}-${index}`,
      number: item.number,
      description: item.description,
      category: item.category,
      _aiExtracted: true,
    }));

    const exclusionCriteria: ExclusionCriteria[] = (data.exclusionCriteria || []).map((item, index) => ({
      id: `exc-${Date.now()}-${index}`,
      number: item.number,
      description: item.description,
      category: item.category,
      _aiExtracted: true,
    }));

    return ok({
      inclusionCriteria,
      exclusionCriteria,
    });
  }

  // ==========================================================================
  // Worksheet 2: Visit Schedule Extraction
  // ==========================================================================

  /**
   * Extract visit schedule from protocol
   */
  async extractVisitSchedule(protocolContent: string): Promise<Result<VisitSchedule[]>> {
    console.log('[extractVisitSchedule] Starting extraction...');
    const truncatedContent = truncateContent(protocolContent);
    const prompt = formatPrompt(VISIT_SCHEDULE_EXTRACTION_PROMPT, { content: truncatedContent });

    const responseResult = await this.callWithRetry(async () => {
      return await this.callAPI([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ]);
    }, 'extractVisitSchedule');

    console.log('[extractVisitSchedule] Response result:', responseResult.success);

    if (responseResult.success === false) {
      console.error('[extractVisitSchedule] API request failed:', responseResult.error);
      return err(responseResult.error);
    }

    console.log('[extractVisitSchedule] Starting JSON parse...');
    const parseResult = this.parseJSONResponse<{
      visitSchedule: Array<{
        visitNumber: string;
        visitName: string;
        windowStart: string;
        windowEnd: string;
        procedures: Array<{ name: string; category: string; timing: string; required?: boolean }>;
        assessments: Array<{ name: string; type: string; timing: string; required?: boolean }>;
      }>;
    }>(responseResult.data);

    if (parseResult.success === false) {
      console.error('[extractVisitSchedule] Parse failed:', parseResult.error);
      return err(parseResult.error);
    }

    const data = parseResult.data;
    console.log('[extractVisitSchedule] Parsed data, visitSchedule count:', data.visitSchedule?.length || 0);

    // Transform to proper types
    const visitSchedule: VisitSchedule[] = (data.visitSchedule || []).map((item, index) => ({
      id: `visit-${Date.now()}-${index}`,
      visitNumber: item.visitNumber,
      visitName: item.visitName,
      windowStart: item.windowStart,
      windowEnd: item.windowEnd,
      procedures: (item.procedures || []).map((p, i) => ({
        id: `proc-${Date.now()}-${index}-${i}`,
        name: p.name,
        category: p.category as 'screening' | 'treatment' | 'follow-up',
        timing: p.timing,
        required: p.required ?? true,
      })),
      assessments: (item.assessments || []).map((a, i) => ({
        id: `assess-${Date.now()}-${index}-${i}`,
        name: a.name,
        type: a.type as 'vital' | 'lab' | 'ecg' | 'imaging' | 'questionnaire',
        timing: a.timing,
        required: a.required ?? true,
      })),
      _aiExtracted: true,
    }));

    console.log('[extractVisitSchedule] Successfully transformed', visitSchedule.length, 'visits');
    return ok(visitSchedule);
  }

  // ==========================================================================
  // Worksheet 3: Medication Recognition
  // ==========================================================================

  /**
   * Recognize medications from subject records
   */
  async recognizeMedications(subjectContent: string): Promise<Result<MedicationRecord[]>> {
    const truncatedContent = truncateContent(subjectContent);
    const prompt = formatPrompt(MEDICATION_RECOGNITION_PROMPT, { content: truncatedContent });

    const responseResult = await this.callWithRetry(async () => {
      return await this.callAPI([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ]);
    }, 'recognizeMedications');

    if (responseResult.success === false) {
      return err(responseResult.error);
    }

    const parseResult = this.parseJSONResponse<{
      medications: Array<{
        medicationName: string;
        dosage: string;
        frequency: string;
        route: string;
        startDate: string;
        endDate?: string;
        indication: string;
        confidence: string;
      }>;
    }>(responseResult.data);

    if (parseResult.success === false) {
      return err(parseResult.error);
    }

    const data = parseResult.data;

    // Transform to proper types
    const medications: MedicationRecord[] = (data.medications || []).map((item, index) => ({
      id: `med-${Date.now()}-${index}`,
      medicationName: item.medicationName,
      dosage: item.dosage,
      frequency: item.frequency,
      route: item.route,
      startDate: new Date(item.startDate),
      endDate: item.endDate ? new Date(item.endDate) : undefined,
      indication: item.indication,
      _aiRecognized: true,
      _confidence: item.confidence as 'high' | 'medium' | 'low',
    }));

    return ok(medications);
  }

  // ==========================================================================
  // Subject Data Extraction Methods
  // ==========================================================================

  /**
   * Extract subject number from medical records
   */
  async extractSubjectNumber(subjectContent: string): Promise<Result<string>> {
    const truncatedContent = truncateContent(subjectContent, 2000);
    const prompt = formatPrompt(SUBJECT_NUMBER_EXTRACTION_PROMPT, { content: truncatedContent });

    const responseResult = await this.callWithRetry(async () => {
      return await this.callAPI([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ]);
    }, 'extractSubjectNumber');

    if (responseResult.success === false) {
      return err(responseResult.error);
    }

    const parseResult = this.parseJSONResponse<{ subjectNumber: string }>(responseResult.data);

    if (parseResult.success === false) {
      return err(parseResult.error);
    }

    return ok(parseResult.data.subjectNumber || '');
  }

  /**
   * Extract subject visit dates from medical records
   */
  async extractSubjectVisitDates(
    subjectContent: string,
    visitScheduleSummary: string
  ): Promise<Result<Array<{ visitScheduleId: string; actualVisitDate?: string; status: string; notes?: string }>>> {
    const truncatedContent = truncateContent(subjectContent);
    const prompt = formatPrompt(SUBJECT_VISIT_DATES_PROMPT, {
      content: truncatedContent,
      visitScheduleSummary,
    });

    const responseResult = await this.callWithRetry(async () => {
      return await this.callAPI([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ]);
    }, 'extractSubjectVisitDates');

    if (responseResult.success === false) {
      return err(responseResult.error);
    }

    const parseResult = this.parseJSONResponse<{
      visits: Array<{
        visitScheduleId: string;
        actualVisitDate?: string;
        status: string;
        notes?: string;
      }>;
    }>(responseResult.data);

    if (parseResult.success === false) {
      return err(parseResult.error);
    }

    return ok(parseResult.data.visits || []);
  }

  /**
   * Extract subject visit item dates from medical records
   */
  async extractSubjectVisitItems(
    subjectContent: string,
    visitItemsSummary: string
  ): Promise<Result<Array<{ visitScheduleId: string; itemName: string; itemType: string; actualDate?: string; status: string; notes?: string }>>> {
    const truncatedContent = truncateContent(subjectContent);
    const prompt = formatPrompt(SUBJECT_VISIT_ITEMS_PROMPT, {
      content: truncatedContent,
      visitItemsSummary,
    });

    const responseResult = await this.callWithRetry(async () => {
      return await this.callAPI([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ]);
    }, 'extractSubjectVisitItems');

    if (responseResult.success === false) {
      return err(responseResult.error);
    }

    const parseResult = this.parseJSONResponse<{
      items: Array<{
        visitScheduleId: string;
        itemName: string;
        itemType: string;
        actualDate?: string;
        status: string;
        notes?: string;
      }>;
    }>(responseResult.data);

    if (parseResult.success === false) {
      return err(parseResult.error);
    }

    return ok(parseResult.data.items || []);
  }

  /**
   * Update API key
   */
  updateApiKey(apiKey: string): Result<void> {
    this.config.apiKey = apiKey;
    this.initialized = false;
    return this.initialize();
  }

  /**
   * Test API connection with a simple request
   */
  async testConnection(): Promise<Result<{ success: boolean; message: string }>> {
    try {
      console.log('[GLM API] Testing connection...');
      const responseResult = await this.callWithRetry(async () => {
        return await this.callAPI([
          { role: 'system', content: '你是一个测试助手。' },
          { role: 'user', content: '请回复"连接成功"' },
        ]);
      }, 'testConnection');

      if (responseResult.success === false) {
        return err(responseResult.error);
      }

      console.log('[GLM API] Connection test successful');
      return ok({
        success: true,
        message: 'API连接成功',
      });
    } catch (error) {
      console.error('[GLM API] Connection test failed:', error);
      return err(
        createError(
          'CONNECTION_TEST_FAILED',
          ErrorCategory.NETWORK,
          ErrorSeverity.CRITICAL,
          'API连接测试失败，请检查网络和API密钥',
          error instanceof Error ? error.message : 'Unknown error'
        )
      );
    }
  }

  /**
   * Reset rate limiter
   */
  resetRateLimiter(): void {
    this.rateLimiter.reset();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let glmServiceInstance: GLMService | null = null;

export const createGLMService = (config: GLMConfig): GLMService => {
  if (!glmServiceInstance) {
    glmServiceInstance = new GLMService(config);
  }
  return glmServiceInstance;
};

export const getGLMService = (): GLMService | null => glmServiceInstance;
