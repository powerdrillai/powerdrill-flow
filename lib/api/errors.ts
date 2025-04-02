/**
 * PowerdrillApiError - Handles errors from the Powerdrill API
 * https://docs.powerdrill.ai/api-reference/error-codes
 */

// Define error types
export enum ErrorType {
  AUTHENTICATION_ERROR = "authentication_error",
  INVALID_REQUEST_ERROR = "invalid_request_error",
  INTERNAL_SERVER_ERROR = "internal_server_error",
  IDEMPOTENCY_ERROR = "idempotency_error",
  RATE_LIMIT_ERROR = "rate_limit_error",
  PERMISSION_ERROR = "permission_error",
}

export enum ClientErrorCode {
  INVALID_PARAMETERS = 300001,
  NO_PERMISSIONS = 300002,
  RESOURCE_NOT_FOUND = 300003,
  INVALID_FILE_EXTENSION = 300004,
  EMPTY_FILE = 300005,
  INSUFFICIENT_STORAGE = 300006,
  FAILED_UPLOAD = 300007,
  PRESIGNED_URL_ERROR = 300008,
  SESSION_LIMIT_REACHED = 300009,
  DATASOURCE_CREATION_FAILED = 300011,
  JOB_EXECUTION_ERROR = 210020,
  JOB_QUOTA_EXCEEDED = 210021,
  QUESTION_TOO_LONG = 210022,
  FILES_NOT_READY = 210023,
  TEXT_TOO_LONG_FOR_TTS = 210024,
  TOO_MANY_FILES = 210025,
  INVALID_ANALYSIS = 210026,
}

export enum ServerErrorCode {
  INTERNAL_SERVER_ERROR = 9999,
  RATE_LIMIT_REACHED = 201,
  EXPIRED_CREDENTIALS = 1002,
  INSUFFICIENT_AUTHENTICATION = 1003,
  BAD_CREDENTIALS = 1004,
}

// HTTP Code mapping
const HTTP_STATUS_CODES: Record<number, number> = {
  [ClientErrorCode.INVALID_PARAMETERS]: 400,
  [ClientErrorCode.NO_PERMISSIONS]: 200,
  [ClientErrorCode.RESOURCE_NOT_FOUND]: 200,
  [ClientErrorCode.INVALID_FILE_EXTENSION]: 200,
  [ClientErrorCode.EMPTY_FILE]: 200,
  [ClientErrorCode.INSUFFICIENT_STORAGE]: 200,
  [ClientErrorCode.FAILED_UPLOAD]: 200,
  [ClientErrorCode.PRESIGNED_URL_ERROR]: 200,
  [ClientErrorCode.SESSION_LIMIT_REACHED]: 200,
  [ClientErrorCode.DATASOURCE_CREATION_FAILED]: 200,
  [ClientErrorCode.JOB_EXECUTION_ERROR]: 400,
  [ClientErrorCode.JOB_QUOTA_EXCEEDED]: 400,
  [ClientErrorCode.QUESTION_TOO_LONG]: 400,
  [ClientErrorCode.FILES_NOT_READY]: 400,
  [ClientErrorCode.TEXT_TOO_LONG_FOR_TTS]: 400,
  [ClientErrorCode.TOO_MANY_FILES]: 400,
  [ClientErrorCode.INVALID_ANALYSIS]: 400,
  [ServerErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ServerErrorCode.RATE_LIMIT_REACHED]: 429,
  [ServerErrorCode.EXPIRED_CREDENTIALS]: 403,
  [ServerErrorCode.INSUFFICIENT_AUTHENTICATION]: 403,
  [ServerErrorCode.BAD_CREDENTIALS]: 403,
};

// Error message mapping
export const ERROR_MESSAGES: Record<number, string> = {
  [ClientErrorCode.INVALID_PARAMETERS]: "Invalid parameters",
  [ClientErrorCode.NO_PERMISSIONS]: "No permissions",
  [ClientErrorCode.RESOURCE_NOT_FOUND]: "Resource not found",
  [ClientErrorCode.INVALID_FILE_EXTENSION]: "Invalid file extension",
  [ClientErrorCode.EMPTY_FILE]: "File is empty",
  [ClientErrorCode.INSUFFICIENT_STORAGE]: "Insufficient storage",
  [ClientErrorCode.FAILED_UPLOAD]: "File upload failed",
  [ClientErrorCode.PRESIGNED_URL_ERROR]: "Error generating presigned URL",
  [ClientErrorCode.SESSION_LIMIT_REACHED]: "Session limit reached",
  [ClientErrorCode.DATASOURCE_CREATION_FAILED]: "Data source creation failed",
  [ClientErrorCode.JOB_EXECUTION_ERROR]:
    "Error during job execution, please retry",
  [ClientErrorCode.JOB_QUOTA_EXCEEDED]: "Job quota exceeded",
  [ClientErrorCode.QUESTION_TOO_LONG]: "Question is too long",
  [ClientErrorCode.FILES_NOT_READY]: "Selected files are not all ready",
  [ClientErrorCode.TEXT_TOO_LONG_FOR_TTS]:
    "Text too long for TTS service, limit is 5000 characters",
  [ClientErrorCode.TOO_MANY_FILES]: "Too many files selected in query",
  [ClientErrorCode.INVALID_ANALYSIS]: "Invalid analysis",
  [ServerErrorCode.INTERNAL_SERVER_ERROR]: "Internal server error",
  [ServerErrorCode.RATE_LIMIT_REACHED]: "Rate limit reached",
  [ServerErrorCode.EXPIRED_CREDENTIALS]: "Credentials expired",
  [ServerErrorCode.INSUFFICIENT_AUTHENTICATION]: "Insufficient authentication",
  [ServerErrorCode.BAD_CREDENTIALS]: "Invalid credentials",
};

interface PowerdrillErrorParams {
  code: number;
  message?: string;
  type?: ErrorType;
  details?: string | Record<string, unknown>;
  httpStatus?: number;
}

export class PowerdrillApiError extends Error {
  code: number;
  type: ErrorType;
  details?: string | Record<string, unknown>;
  httpStatus: number;

  constructor({
    code,
    message,
    type,
    details,
    httpStatus,
  }: PowerdrillErrorParams) {
    // Use provided message or look up default message based on error code
    const errorMessage = message || ERROR_MESSAGES[code] || "Unknown error";
    super(errorMessage);

    this.name = "PowerdrillApiError";
    this.code = code;

    this.type = type || this.determineErrorType(code);

    this.details = details;

    this.httpStatus = httpStatus || HTTP_STATUS_CODES[code] || 500;
  }

  private determineErrorType(code: number): ErrorType {
    if (code === ServerErrorCode.RATE_LIMIT_REACHED) {
      return ErrorType.RATE_LIMIT_ERROR;
    }
    if (
      [
        ServerErrorCode.EXPIRED_CREDENTIALS,
        ServerErrorCode.INSUFFICIENT_AUTHENTICATION,
        ServerErrorCode.BAD_CREDENTIALS,
      ].includes(code)
    ) {
      return ErrorType.AUTHENTICATION_ERROR;
    }
    if (code === ClientErrorCode.NO_PERMISSIONS) {
      return ErrorType.PERMISSION_ERROR;
    }
    if (code === ServerErrorCode.INTERNAL_SERVER_ERROR) {
      return ErrorType.INTERNAL_SERVER_ERROR;
    }

    return ErrorType.INVALID_REQUEST_ERROR;
  }

  /**
   * Create a PowerdrillApiError from an API response
   */
  static fromApiResponse(
    responseData: Record<string, unknown>
  ): PowerdrillApiError {
    const { code, message, type, details } = responseData as {
      code?: number;
      message?: string;
      type?: ErrorType;
      details?: string | Record<string, unknown>;
    };
    return new PowerdrillApiError({
      code:
        typeof code === "number" ? code : ServerErrorCode.INTERNAL_SERVER_ERROR,
      message: typeof message === "string" ? message : undefined,
      type: type as ErrorType | undefined,
      details,
    });
  }

  /**
   * Get a formatted error message
   */
  getFormattedMessage(): string {
    let formattedMessage = `[${this.code}] ${this.message}`;

    // Add details if present
    if (this.details) {
      if (typeof this.details === "string") {
        formattedMessage += `: ${this.details}`;
      } else {
        formattedMessage += `: ${JSON.stringify(this.details)}`;
      }
    }

    return formattedMessage;
  }
}

/**
/**
 * Create appropriate error object based on error information
 */
export function createApiError(errorData: unknown): PowerdrillApiError {
  if (errorData instanceof PowerdrillApiError) {
    return errorData;
  }

  // Handle error format created when using fetch API
  const fetchLikeError = errorData as {
    response?: { data?: Record<string, unknown>; status?: number };
  };
  if (fetchLikeError.response?.data) {
    const error = PowerdrillApiError.fromApiResponse(
      fetchLikeError.response.data
    );
    // Use HTTP status code if available
    if (fetchLikeError.response.status) {
      error.httpStatus = fetchLikeError.response.status;
    }
    return error;
  }

  // If it's a direct error data object
  const errorWithCode = errorData as { code?: number; message?: string };
  if (errorWithCode.code) {
    return PowerdrillApiError.fromApiResponse(
      errorWithCode as Record<string, unknown>
    );
  }

  // If it's a TypeError or other network error
  if (errorData instanceof TypeError) {
    return new PowerdrillApiError({
      code: ServerErrorCode.INTERNAL_SERVER_ERROR,
      message: "Network request failed",
      details: errorData.message,
    });
  }

  // Default error
  return new PowerdrillApiError({
    code: ServerErrorCode.INTERNAL_SERVER_ERROR,
    message: errorWithCode.message || "Unknown error",
  });
}
