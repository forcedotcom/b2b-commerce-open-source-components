import { renewalStatusInProgressText, renewalStatusFailedMainText, renewalStatusSuccessMainText, renewalSuccessBannerMainText } from './labels';
export const SUBSCRIPTION_RENEWAL_OPERATION_STATUSES = {
  FAILED: 'Failed',
  IN_PROGRESS: 'InProgress',
  SUCCESS: 'Success'
};
export const RENEWAL_STATUS_DISPLAY_DETAILS = {
  [SUBSCRIPTION_RENEWAL_OPERATION_STATUSES.IN_PROGRESS]: {
    iconPath: 'assets/icons/subscriptions-status.svg#in-progress',
    mainText: renewalStatusInProgressText,
    supportText: undefined
  },
  [SUBSCRIPTION_RENEWAL_OPERATION_STATUSES.FAILED]: {
    iconPath: 'assets/icons/subscriptions-status.svg#failed',
    mainText: renewalStatusFailedMainText,
    supportText: undefined
  },
  [SUBSCRIPTION_RENEWAL_OPERATION_STATUSES.SUCCESS]: {
    iconPath: 'assets/icons/subscriptions-status.svg#success',
    mainText: renewalStatusSuccessMainText,
    supportText: undefined
  }
};
export const SUBSCRIPTION_BANNER_RENEWAL_DISPLAY_DETAILS = {
  iconPath: 'assets/icons/info-filled.svg#info-filled',
  mainText: renewalSuccessBannerMainText
};