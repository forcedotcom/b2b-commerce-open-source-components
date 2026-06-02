import { api, LightningElement } from 'lwc';
import { getTermDetailsPillText } from './labelTextGenerator';
import { SELLING_MODEL_TYPES } from './labelsMapConfig';
export default class SubscriptionTermDetailsPill extends LightningElement {
  static renderMode = 'light';
  @api
  sellingModelType;
  @api
  subscriptionTerm;
  @api
  pricingTerm;
  @api
  pricingTermUnit;
  @api
  get termDetailsPillLabel() {
    if (!this.sellingModelType || !this.pricingTermUnit || !this.pricingTerm) {
      return undefined;
    }
    if (this.sellingModelType === SELLING_MODEL_TYPES.TERM_DEFINED && !this.subscriptionTerm) {
      return undefined;
    }
    return getTermDetailsPillText(this.sellingModelType, this.pricingTerm, this.pricingTermUnit, this.subscriptionTerm);
  }
}