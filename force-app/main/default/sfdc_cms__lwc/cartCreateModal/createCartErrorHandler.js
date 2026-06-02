import LABELS from './labels';
function getErrorMsg(errorCode, message) {
  let errorMsg;
  switch (errorCode) {
    case 'INVALID_API_INPUT':
      errorMsg = message;
      break;
    case 'INVALID_INPUT':
      errorMsg = message;
      break;
    case 'INVALID_OPERATION':
      errorMsg = message;
      break;
    default:
      errorMsg = undefined;
      break;
  }
  return errorMsg || LABELS.createCartApiFailureMessage;
}
export function getCreateCartToastMsg(exception) {
  if (typeof exception === 'object' && exception !== null) {
    const errorResponse = exception;
    if (errorResponse.errors?.[0]) {
      return getErrorMsg(errorResponse.errors[0].type, errorResponse.errors[0].message);
    }
    if (errorResponse.error?.[0]) {
      return getErrorMsg(errorResponse.error[0].errorCode, errorResponse.error[0].message);
    }
  }
  return LABELS.createCartApiFailureMessage;
}