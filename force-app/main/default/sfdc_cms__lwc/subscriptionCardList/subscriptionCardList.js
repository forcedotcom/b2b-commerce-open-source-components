import { api, wire, LightningElement } from 'lwc';
import { AppContextAdapter } from 'commerce/contextApi';
import { quantityPrefixText, taxLabel, warningAction, warningDescription } from './labels';
import { getSPMDeleteWarningTitleForMultipleSubscription, getSPMDeleteWarningTitleForSingleSubscription } from './labelTextGenerator';
const LABELS = {
  quantityPrefixText,
  taxLabel,
  warningAction,
  warningDescription
};
export default class SubscriptionCardList extends LightningElement {
  static renderMode = 'light';
  _items = [];
  _rlmSubscriptionEnabled = false;
  @api
  set items(value) {
    this._items = value;
  }
  get items() {
    return this._items;
  }
  @wire(AppContextAdapter)
  updateAppContext({
    data
  }) {
    this._rlmSubscriptionEnabled = Boolean(data?.subscriptionConfig.rlmSubscriptionEnabled);
  }
  get _getWarningTitle() {
    return this.warningTitle(this._items.length);
  }
  get _labels() {
    return LABELS;
  }
  warningTitle(subscriptionCount) {
    return subscriptionCount === 1 ? getSPMDeleteWarningTitleForSingleSubscription(this._paymentMethodName) : getSPMDeleteWarningTitleForMultipleSubscription(this._paymentMethodName, subscriptionCount);
  }
  get _paymentMethodName() {
    return this._items.at(0)?.billing?.savedPaymentMethod?.name || '';
  }
}