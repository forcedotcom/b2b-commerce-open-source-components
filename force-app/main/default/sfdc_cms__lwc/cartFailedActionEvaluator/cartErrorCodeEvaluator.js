const emptyObject = Object.create(null);
export default function getErrorMessage(errorCode, labels) {
  const errorLabels = labels || emptyObject;
  switch (errorCode) {
    case 'WEBSTORE_NOT_FOUND':
      return errorLabels.webstoreNotFound;
    case 'EFFECTIVE_ACCOUNT_NOT_FOUND':
      return errorLabels.effectiveAccountNotFound;
    case 'API_DISABLED_FOR_ORG':
      return errorLabels.gateDisabled;
    case 'INVALID_API_INPUT':
      return errorLabels.invalidInput;
    case 'MAX_LIMIT_EXCEEDED':
    case 'COUPON_REDEMPTION_LIMIT_EXCEEDED':
      return errorLabels.maximumLimitExceeded;
    case 'CART_ITEM_LIMIT_EXCEEDED_FOR_COUPONS':
      return errorLabels.maximumCartItemLimitExceeded;
    case 'LIMIT_EXCEEDED':
      return errorLabels.limitExceeded;
    case 'TOO_MANY_RECORDS':
      return errorLabels.tooManyRecords;
    case 'INSUFFICIENT_ACCESS':
      return errorLabels.insufficientAccess;
    case 'ITEM_NOT_FOUND':
      return errorLabels.itemNotFound;
    case 'MISSING_RECORD':
      return errorLabels.missingRecord;
    case 'INVALID_BATCH_SIZE':
      return errorLabels.invalidBatchSize;
    case 'ALREADY_APPLIED':
      return errorLabels.alreadyApplied;
    case 'BLOCKED_EXCLUSIVE':
      return errorLabels.blockedExclusive;
    case 'UNQUALIFIED_CART':
      return errorLabels.unqualifiedCart;
    default:
      return errorLabels.defaultErrorMessage;
  }
}