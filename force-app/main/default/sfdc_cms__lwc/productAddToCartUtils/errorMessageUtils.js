import { defaultErrorMessage, insufficientAccess, invalidBatchSize, limitExceeded, maximumLimitExceeded, missingRecord, externalServiceException } from './productAddToCartErrorLabels';
export let AddToCartErrorType = function (AddToCartErrorType) {
  AddToCartErrorType["INSUFFICIENT_ACCESS"] = "INSUFFICIENT_ACCESS";
  AddToCartErrorType["MAX_LIMIT_EXCEEDED"] = "MAX_LIMIT_EXCEEDED";
  AddToCartErrorType["LIMIT_EXCEEDED"] = "LIMIT_EXCEEDED";
  AddToCartErrorType["MISSING_RECORD"] = "MISSING_RECORD";
  AddToCartErrorType["INVALID_BATCH_SIZE"] = "INVALID_BATCH_SIZE";
  AddToCartErrorType["EXTERNAL_SERVICE_EXCEPTION"] = "EXTERNAL_SERVICE_EXCEPTION";
  return AddToCartErrorType;
}({});
const errorMessageToLabelMap = new Map([[AddToCartErrorType.INSUFFICIENT_ACCESS, insufficientAccess], [AddToCartErrorType.MAX_LIMIT_EXCEEDED, maximumLimitExceeded], [AddToCartErrorType.LIMIT_EXCEEDED, limitExceeded], [AddToCartErrorType.MISSING_RECORD, missingRecord], [AddToCartErrorType.INVALID_BATCH_SIZE, invalidBatchSize], [AddToCartErrorType.EXTERNAL_SERVICE_EXCEPTION, externalServiceException]]);
export function getErrorMessage(errorCode, errorMessage) {
  return errorMessageToLabelMap.get(errorCode) || errorMessage || defaultErrorMessage;
}