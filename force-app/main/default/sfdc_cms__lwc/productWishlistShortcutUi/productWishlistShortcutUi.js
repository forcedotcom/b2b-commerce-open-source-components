import { api, LightningElement } from 'lwc';
import BasePath from '@salesforce/community/basePath';
import assistiveText from '@salesforce/label/site.productWishlistShortcutUi.wishlistPageAssistiveText';
import { getIconPath } from 'experience/iconUtils';
export default class ProductWishlistShortcutUi extends LightningElement {
  static renderMode = 'light';
  @api
  iconType;
  @api
  iconUrl;
  @api
  isOutlined = false;
  get iconTypeHref() {
    switch (this.iconType) {
      case 'plus':
        return this.isOutlined ? `${BasePath}/assets/icons/add.svg#add` : getIconPath('utility:add');
      case 'save':
        return this.isOutlined ? `${BasePath}/assets/icons/bookmark-outline.svg#bookmark-outline` : getIconPath('utility:bookmark');
      default:
        return this.isOutlined ? `${BasePath}/assets/icons/heart-outline.svg#heart-outline` : `${BasePath}/assets/icons/heart-filled.svg#heart-filled`;
    }
  }
  get iconAssistiveText() {
    return assistiveText;
  }
  handleIconClick(event) {
    event.preventDefault();
    this.dispatchEvent(new CustomEvent('wishlisticonclick', {
      bubbles: true,
      cancelable: true,
      composed: true
    }));
  }
}