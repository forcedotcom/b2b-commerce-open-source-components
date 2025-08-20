import getErrorMessage from './cartErrorCodeEvaluator';
export function getErrorInfo(errorCode, errorLabels) {
  const localizedErrorLabels = errorLabels;
  return {
    code: errorCode,
    message: getErrorMessage(errorCode, localizedErrorLabels)
  };
}