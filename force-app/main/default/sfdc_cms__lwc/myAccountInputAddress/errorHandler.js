import { defaultErrorMessage, insufficientAccess, invalidApiInput, opInvalidInPreviewMode } from './errorLabels';
function isPlatformError(error) {
  return !!error && typeof error === 'object' && 'errorCode' in error && 'message' in error;
}
function isPlatformErrorList(errors) {
  return !!errors && Array.isArray(errors) && isPlatformError(errors[0]);
}
function isExceptionWithError(exception) {
  return !!exception && typeof exception === 'object' && 'error' in exception;
}
function convertErrorMessage(errorCode, message) {
  switch (errorCode) {
    case 'INVALID_API_INPUT':
      return message || invalidApiInput;
    case 'ILLEGAL_QUERY_PARAMETER_VALUE':
      return invalidApiInput;
    case 'INSUFFICIENT_ACCESS_OR_READONLY':
    case 'INSUFFICIENT_ACCESS':
    case 'ITEM_NOT_FOUND':
    case 'INVALID_FIELD':
      return insufficientAccess;
    default:
      return defaultErrorMessage;
  }
}
export function getErrorInfo(exception = '', isPreviewMode = false) {
  if (isPreviewMode) {
    return opInvalidInPreviewMode;
  }
  if (typeof exception === 'string' && exception) {
    return exception;
  } else if (isExceptionWithError(exception) && isPlatformErrorList(exception.error) && exception.error?.length) {
    return convertErrorMessage(exception.error[0].errorCode, exception.error[0].message);
  }
  return defaultErrorMessage;
}