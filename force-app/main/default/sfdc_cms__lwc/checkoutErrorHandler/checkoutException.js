import { generateErrorDetail } from './errorLabeler';
export function exceptionToNotification(errorRequest) {
  const result = {
    groupId: errorRequest.groupId
  };
  if (errorRequest.exception) {
    result.type = errorRequest.type;
    result.detail = generateErrorDetail(errorRequest.exception);
    if (!!errorRequest.exception && typeof errorRequest.exception === 'object') {
      const e = errorRequest.exception;
      if (e.message && e.message !== result.detail) {
        result.code = e.message;
      } else if (e.name) {
        result.code = e.name;
      }
    }
  }
  return result;
}