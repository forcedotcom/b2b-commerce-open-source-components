import { LightningElement, api } from 'lwc';
import { PLACEHOLDER_DATA_URI } from './commonVideoUtils';
export default class CommonVideo extends LightningElement {
  static renderMode = 'light';
  @api
  alternativeText;
  @api
  videoPlaceholderAltText;
  @api
  url;
  @api
  autoplay = false;
  @api
  loop = false;
  @api
  mute = false;
  @api
  controls = false;
  get placeholder() {
    return PLACEHOLDER_DATA_URI;
  }
}