import { api } from 'lwc';
import LightningToast from 'lightning/toast';
import { CUSTOM_ICON_TOAST_VARIANTS, TOAST_VARIANT_ICON_MAPPING } from './constants';
export default class CommonToast extends LightningToast {
  @api
  variant = 'info';
  get isCustomVariant() {
    return CUSTOM_ICON_TOAST_VARIANTS.includes(this.variant);
  }
  get getIconName() {
    return `${TOAST_VARIANT_ICON_MAPPING[this.variant]}`;
  }
  get getIconAltText() {
    return this.variant;
  }
  static show(config, source) {
    const toastConfig = {
      ...config,
      mode: 'dismissible'
    };
    super.show(toastConfig, source);
  }
}