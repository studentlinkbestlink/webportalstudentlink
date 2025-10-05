export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

export interface AppError {
  message: string
  type: ErrorType
  statusCode?: number
  details?: Record<string, any>
}

export class ErrorHandler {
  static parseError(error: any): AppError {
    if (error instanceof Error && 'type' in error) {
      return error as AppError
    }

    const errorString = error?.toString()?.toLowerCase() || ''

    // Network errors
    if (errorString.includes('network') || 
        errorString.includes('fetch') ||
        errorString.includes('connection')) {
      return {
        message: 'No internet connection. Please check your network and try again.',
        type: ErrorType.NETWORK,
      }
    }

    // Authentication errors
    if (errorString.includes('authentication') || 
        errorString.includes('unauthorized') ||
        errorString.includes('token') ||
        errorString.includes('401')) {
      return {
        message: 'Your session has expired. Please login again.',
        type: ErrorType.AUTHENTICATION,
        statusCode: 401,
      }
    }

    // Validation errors
    if (errorString.includes('validation') || 
        errorString.includes('422') ||
        errorString.includes('invalid')) {
      return {
        message: 'Please check your input and try again.',
        type: ErrorType.VALIDATION,
        statusCode: 422,
      }
    }

    // Server errors
    if (errorString.includes('500') || 
        errorString.includes('server error') ||
        errorString.includes('internal server')) {
      return {
        message: 'Server error. Please try again later.',
        type: ErrorType.SERVER,
        statusCode: 500,
      }
    }

    // Default error
    return {
      message: error?.message || error?.toString() || 'An unexpected error occurred',
      type: ErrorType.UNKNOWN,
    }
  }

  static showError(error: any, toast?: (message: string) => void): void {
    const appError = this.parseError(error)
    
    console.error('Application Error:', appError)
    
    if (toast) {
      toast(appError.message)
    } else {
      // Fallback to alert for critical errors
      if (appError.type === ErrorType.AUTHENTICATION) {
        alert(appError.message)
        // Redirect to login
        window.location.href = '/login'
      } else {
        alert(appError.message)
      }
    }
  }

  static showSuccess(message: string, toast?: (message: string) => void): void {
    if (toast) {
      toast(message)
    } else {
      console.log('Success:', message)
    }
  }

  static showInfo(message: string, toast?: (message: string) => void): void {
    if (toast) {
      toast(message)
    } else {
      console.info('Info:', message)
    }
  }
}
