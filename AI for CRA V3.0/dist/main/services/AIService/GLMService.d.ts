/**
 * GLM-4 AI Service - Main AI integration service
 * Uses native HTTPS calls with JWT token generation (no external SDK needed)
 */
import { Result, CriteriaSet, VisitSchedule, MedicationRecord } from '@shared/types/core';
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
export declare class GLMService {
    private config;
    private rateLimiter;
    private baseURL;
    private initialized;
    constructor(config: GLMConfig);
    /**
     * Initialize the GLM service
     */
    initialize(): Result<void>;
    /**
     * Check if an error is retryable based on its type/message
     */
    private isRetryableError;
    /**
     * Call GLM API with retry logic
     */
    private callWithRetry;
    /**
     * Call GLM API using native HTTPS
     */
    private callAPI;
    /**
     * Attempt to fix incomplete/truncated JSON
     */
    private fixIncompleteJSON;
    /**
     * Parse JSON response from AI
     */
    private parseJSONResponse;
    /**
     * Extract inclusion and exclusion criteria from protocol
     */
    extractCriteria(protocolContent: string): Promise<Result<CriteriaSet>>;
    /**
     * Extract visit schedule from protocol
     */
    extractVisitSchedule(protocolContent: string): Promise<Result<VisitSchedule[]>>;
    /**
     * Recognize medications from subject records
     */
    recognizeMedications(subjectContent: string): Promise<Result<MedicationRecord[]>>;
    /**
     * Extract subject number from medical records
     */
    extractSubjectNumber(subjectContent: string): Promise<Result<string>>;
    /**
     * Extract subject visit dates from medical records
     */
    extractSubjectVisitDates(subjectContent: string, visitScheduleSummary: string): Promise<Result<Array<{
        visitScheduleId: string;
        actualVisitDate?: string;
        status: string;
        notes?: string;
    }>>>;
    /**
     * Extract subject visit item dates from medical records
     */
    extractSubjectVisitItems(subjectContent: string, visitItemsSummary: string): Promise<Result<Array<{
        visitScheduleId: string;
        itemName: string;
        itemType: string;
        actualDate?: string;
        status: string;
        notes?: string;
    }>>>;
    /**
     * Update API key
     */
    updateApiKey(apiKey: string): Result<void>;
    /**
     * Test API connection with a simple request
     */
    testConnection(): Promise<Result<{
        success: boolean;
        message: string;
    }>>;
    /**
     * Reset rate limiter
     */
    resetRateLimiter(): void;
}
export declare const createGLMService: (config: GLMConfig) => GLMService;
export declare const getGLMService: () => GLMService | null;
//# sourceMappingURL=GLMService.d.ts.map