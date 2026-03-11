import { SessionContextAdapter } from 'commerce/contextApi';
import { LightningElement, wire } from 'lwc';

/**
 * @slot announcement
 * @slot header
 * @slot footer
 * @slot navigation
 * @slot
 */
export default class ThemelayoutMyaccount extends LightningElement {
  static renderMode = 'light';
  _isLoggedIn = false;
  @wire(SessionContextAdapter)
  updateSessionContext({
    data
  }) {
    this._isLoggedIn = data?.isLoggedIn || false;
  }
  get _loggedInContentCss() {
    return this._isLoggedIn ? 'content' : 'content full-width';
  }
}