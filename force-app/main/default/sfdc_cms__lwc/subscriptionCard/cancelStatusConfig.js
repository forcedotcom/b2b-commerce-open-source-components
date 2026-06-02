import { cancelStatusInProgressText, cancelStatusFailedMainText, cancelStatusFailedSupportText, cancelStatusSuccessMainText, cancelStatusSuccessSupportText } from './labels';
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
    supportText: cancelStatusFailedSupportText
  },
  [SUBSCRIPTION_CANCEL_OPERATION_STATUSES.SUCCESS]: {
    iconPath: undefined,
    mainText: cancelStatusSuccessMainText,
    supportText: cancelStatusSuccessSupportText
  }
};