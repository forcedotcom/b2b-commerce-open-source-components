import { subscriptionAmendQtyIncreaseInProgress, subscriptionAmendQtyDecreaseInProgress, subscriptionAmendQtyIncreaseSuccessful, subscriptionAmendQtyDecreaseSuccessful, subscriptionAmendQtyIncreaseFailed, subscriptionAmendQtyDecreaseFailed, subscriptionCancelInProgress, subscriptionCancelSuccessful, subscriptionCancelFailed, subscriptionRenewInProgress, subscriptionRenewSuccessful, subscriptionRenewFailed, subscriptionQtyAmendFrom, subscriptionQtyAmendTo, subscriptionRenewFrom, subscriptionRenewTo } from './labels';
export const SUBSCRIPTION_ACTIONS = {
  AMEND: 'Amend',
  RENEW: 'Renew',
  CANCEL: 'Cancel'
};
export const SUBSCRIPTION_ACTION_OPERATION_STATUSES = {
  IN_PROGRESS: 'InProgress',
  SUCCESS: 'Success',
  FAILED: 'Failed'
};
export const SUBSCRIPTION_ACTION_ICON_PATH = {
  [SUBSCRIPTION_ACTION_OPERATION_STATUSES.IN_PROGRESS]: 'assets/icons/subscriptions-status.svg#in-progress',
  [SUBSCRIPTION_ACTION_OPERATION_STATUSES.SUCCESS]: 'assets/icons/subscriptions-status.svg#success',
  [SUBSCRIPTION_ACTION_OPERATION_STATUSES.FAILED]: 'assets/icons/subscriptions-status.svg#failed'
};
export const SUBSCRIPTION_ACTION_FROM_TO_LABELS = {
  [SUBSCRIPTION_ACTIONS.AMEND]: {
    from: subscriptionQtyAmendFrom,
    to: subscriptionQtyAmendTo
  },
  [SUBSCRIPTION_ACTIONS.RENEW]: {
    from: subscriptionRenewFrom,
    to: subscriptionRenewTo
  }
};
export const SUBSCRIPTION_ACTION_HISTORY_DISPLAY_DETAILS = {
  [SUBSCRIPTION_ACTIONS.AMEND]: {
    [SUBSCRIPTION_ACTION_OPERATION_STATUSES.IN_PROGRESS]: {
      mainTextPositive: subscriptionAmendQtyIncreaseInProgress,
      mainTextNegative: subscriptionAmendQtyDecreaseInProgress
    },
    [SUBSCRIPTION_ACTION_OPERATION_STATUSES.SUCCESS]: {
      mainTextPositive: subscriptionAmendQtyIncreaseSuccessful,
      mainTextNegative: subscriptionAmendQtyDecreaseSuccessful
    },
    [SUBSCRIPTION_ACTION_OPERATION_STATUSES.FAILED]: {
      mainTextPositive: subscriptionAmendQtyIncreaseFailed,
      mainTextNegative: subscriptionAmendQtyDecreaseFailed
    }
  },
  [SUBSCRIPTION_ACTIONS.RENEW]: {
    [SUBSCRIPTION_ACTION_OPERATION_STATUSES.IN_PROGRESS]: {
      mainText: subscriptionRenewInProgress
    },
    [SUBSCRIPTION_ACTION_OPERATION_STATUSES.SUCCESS]: {
      mainText: subscriptionRenewSuccessful
    },
    [SUBSCRIPTION_ACTION_OPERATION_STATUSES.FAILED]: {
      mainText: subscriptionRenewFailed
    }
  },
  [SUBSCRIPTION_ACTIONS.CANCEL]: {
    [SUBSCRIPTION_ACTION_OPERATION_STATUSES.IN_PROGRESS]: {
      mainText: subscriptionCancelInProgress
    },
    [SUBSCRIPTION_ACTION_OPERATION_STATUSES.SUCCESS]: {
      mainText: subscriptionCancelSuccessful
    },
    [SUBSCRIPTION_ACTION_OPERATION_STATUSES.FAILED]: {
      mainText: subscriptionCancelFailed
    }
  }
};