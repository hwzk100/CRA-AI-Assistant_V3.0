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
      maxTokens: config.maxTokens || 4096,
      timeout: config.timeout || 60000, // Increased to 60 seconds
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
        const result = await fn();
        return ok(result);
      } catch (error) {
        lastError = error as Error;

        // Don't retry on authentication errors
        if (error instanceof Error && error.message.includes('401')) {
          return err(
            createError(
              'AI_AUTH_FAILED',
              ErrorCategory.NETWORK,
              ErrorSeverity.CRITICAL,
              'API密钥无效，请检查设置',
              error.message,
              { attempt, context }
            )
          );
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.config.maxRetries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, attempt))
          );
        }
      }
    }

    return err(
      createError(
        'AI_REQUEST_FAILED',
        ErrorCategory.NETWORK,
        ErrorSeverity.CRITICAL,
        'AI请求失败，请检查网络连接',
        lastError?.message || 'Unknown error',
        { attempts: this.config.maxRetries, context }
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
   * Parse JSON response from AI
   */
  private parseJSONResponse<T>(response: string): Result<T> {
    try {
      // Try to extract JSON from markdown code blocks
      let jsonStr = response;

      // Extract from ```json blocks
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      // Extract from ``` blocks
      const codeMatch = response.match(/```\s*([\s\S]*?)\s*```/);
      if (codeMatch) {
        jsonStr = codeMatch[1];
      }

      // Find JSON object in the response
      const objectMatch = response.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonStr = objectMatch[0];
      }

      const parsed = JSON.parse(jsonStr);
      return ok(parsed as T);
    } catch (error) {
      return err(
        createError(
          'AI_PARSE_FAILED',
          ErrorCategory.DOMAIN,
          ErrorSeverity.CRITICAL,
          'AI响应解析失败',
          error instanceof Error ? error.message : 'Failed to parse JSON',
          { response: response.substring(0, 500) }
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
    const truncatedContent = truncateContent(protocolContent, 8000);
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
    const truncatedContent = truncateContent(protocolContent, 8000);
    const prompt = formatPrompt(VISIT_SCHEDULE_EXTRACTION_PROMPT, { content: truncatedContent });

    const responseResult = await this.callWithRetry(async () => {
      return await this.callAPI([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ]);
    }, 'extractVisitSchedule');

    if (responseResult.success === false) {
      return err(responseResult.error);
    }

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
      return err(parseResult.error);
    }

    const data = parseResult.data;

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

    return ok(visitSchedule);
  }

  // ==========================================================================
  // Worksheet 3: Medication Recognition
  // ==========================================================================

  /**
   * Recognize medications from subject records
   */
  async recognizeMedications(subjectContent: string): Promise<Result<MedicationRecord[]>> {
    const truncatedContent = truncateContent(subjectContent, 8000);
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
