import { amendmentStatusInProgressText, amendmentStatusFailedMainText, amendmentStatusSuccessMainText, positiveAmendmentSuccessBannerMainText, negativeAmendmentSuccessBannerMainText } from './labels';
export const SUBSCRIPTION_AMENDMENT_OPERATION_STATUSES = {
  FAILED: 'Failed',
  IN_PROGRESS: 'InProgress',
  SUCCESS: 'Success'
};
export const SUBSCRIPTION_AMENDMENT_TYPE = {
  POSITIVE_AMENDMENT: 'Positive',
  NEGATIVE_AMENDMENT: 'Negative'
};
export const AMENDMENT_STATUS_DISPLAY_DETAILS = {
  [SUBSCRIPTION_AMENDMENT_OPERATION_STATUSES.IN_PROGRESS]: {
    iconPath: 'assets/icons/subscriptions-status.svg#in-progress',
    mainText: amendmentStatusInProgressText,
    supportText: undefined
  },
  [SUBSCRIPTION_AMENDMENT_OPERATION_STATUSES.FAILED]: {
    iconPath: 'assets/icons/subscriptions-status.svg#failed',
    mainText: amendmentStatusFailedMainText,
    supportText: undefined
  },
  [SUBSCRIPTION_AMENDMENT_OPERATION_STATUSES.SUCCESS]: {
    iconPath: 'assets/icons/subscriptions-status.svg#success',
    mainText: amendmentStatusSuccessMainText,
    supportText: undefined
  }
};
export const SUBSCRIPTION_BANNER_AMENDMENT_DISPLAY_DETAILS = {
  [SUBSCRIPTION_AMENDMENT_TYPE.POSITIVE_AMENDMENT]: {
    iconPath: 'assets/icons/info-filled.svg#info-filled',
    mainText: positiveAmendmentSuccessBannerMainText
  },
  [SUBSCRIPTION_AMENDMENT_TYPE.NEGATIVE_AMENDMENT]: {
    iconPath: 'assets/icons/info-filled.svg#info-filled',
    mainText: negativeAmendmentSuccessBannerMainText
  }
};