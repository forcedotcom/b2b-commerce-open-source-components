import { cancelStatusInProgressText, cancelStatusFailedMainText, cancelSuccessBannerMainText } from './labels';
export const SUBSCRIPTION_CANCEL_OPERATION_STATUSES = {
  FAILED: 'Failed',
  IN_PROGRESS: 'InProgress',
  SUCCESS: 'Success'
};
export const CANCEL_STATUS_DISPLAY_DETAILS = {
  [SUBSCRIPTION_CANCEL_OPERATION_STATUSES.IN_PROGRESS]: {
    iconPath: 'assets/icons/subscriptions-status.svg#in-progress',
    mainText: cancelStatusInProgressText,
    supportText: undefined
  },
  [SUBSCRIPTION_CANCEL_OPERATION_STATUSES.FAILED]: {
    iconPath: 'assets/icons/subscriptions-status.svg#failed',
    mainText: cancelStatusFailedMainText,
    supportText: undefined
  },
  [SUBSCRIPTION_CANCEL_OPERATION_STATUSES.SUCCESS]: {
    iconPath: undefined,
    mainText: undefined,
    supportText: undefined
  }
};
export const SUBSCRIPTION_BANNER_CANCEL_DISPLAY_DETAILS = {
  iconPath: 'assets/icons/info-filled.svg#info-filled',
  mainText: cancelSuccessBannerMainText
};