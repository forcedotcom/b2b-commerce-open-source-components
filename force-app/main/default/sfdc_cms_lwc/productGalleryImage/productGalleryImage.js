import { api, LightningElement } from 'lwc';
import { resolve } from 'experience/resourceResolver';
import { createImageDataMap } from 'experience/picture';
export default class GalleryImage extends LightningElement {
  static renderMode = 'light';
  imageSizes = {
    mobile: 200,
    tablet: 400,
    desktop: 400
  };
  @api
  selectable = false;
  @api
  url;
  @api
  alternativeText;
  @api
  loading;
  @api
  setAriaLabelledByOnFigureElement(idValue) {
    this.figureElement?.setAttribute('aria-labelledby', idValue);
  }
  @api
  setRoleOnFigureElement(roleValue) {
    !this.figureElement?.hasAttribute('role') && this.figureElement?.setAttribute('role', roleValue);
  }
  get figureElement() {
    return this.querySelector('figure');
  }
  get images() {
    return createImageDataMap(this.resolvedUrl, this.imageSizes);
  }
  get resolvedUrl() {
    return this.url ? resolve(this.url) : '';
  }
  handleImageClicked() {
    this.dispatchEvent(new CustomEvent('selected'));
  }
}