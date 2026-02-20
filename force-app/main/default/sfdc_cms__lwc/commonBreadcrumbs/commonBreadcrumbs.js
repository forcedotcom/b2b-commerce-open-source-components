import { api, LightningElement, wire } from 'lwc';
import { generateUrl, NavigationContext } from 'lightning/navigation';
import homelabel from '@salesforce/label/site.commonBreadcrumbs.homelabel';
import { BreadcrumbsAdapter } from 'commerce/breadcrumbsApi';
const MAX_DEPTH = 5;
const HOME_PAGE = {
  label: homelabel,
  pageReference: {
    type: 'comm__namedPage',
    attributes: {
      name: 'Home'
    }
  }
};
export default class CommonBreadcrumbs extends LightningElement {
  static renderMode = 'light';
  _breadcrumbs = [];
  @api
  showHomeLink = false;
  @api
  showLastItemAsLink = false;
  @api
  hideOnMobile = false;
  @api
  maxDepthOnMobile;
  @api
  textSize;
  @api
  textColor;
  @api
  linkColor;
  @api
  linkHoverColor;
  @api
  divider;
  @api
  dividerColor;
  @wire(NavigationContext)
  navContext;
  @wire(BreadcrumbsAdapter)
  wiredCommonBreadcrumbs(breadcrumbs) {
    this._breadcrumbs = Array.isArray(breadcrumbs) ? breadcrumbs : [];
  }
  get containerClass() {
    return this.hideOnMobile ? 'hide-s' : 'show-s';
  }
  get normalizedMaxDepthOnMobile() {
    const additionalDepth = this.showHomeLink ? 1 : 0;
    const maxDepth = Math.min(this._breadcrumbs.length, MAX_DEPTH) + additionalDepth;
    const numericMaxDepthMobile = Number(this.maxDepthOnMobile);
    const normalizedMaxDepthMobile = typeof this.maxDepthOnMobile === 'string' && this.maxDepthOnMobile.trim().length > 0 && Number.isInteger(numericMaxDepthMobile) ? numericMaxDepthMobile : maxDepth;
    return Math.max(0, Math.min(maxDepth, normalizedMaxDepthMobile));
  }
  get normalizedDivider() {
    switch (this.divider) {
      case 'slash':
        return '/';
      default:
        return '>';
    }
  }
  get normalizedBreadcrumbs() {
    const breadcrumbs = this.showHomeLink ? [HOME_PAGE, ...this._breadcrumbs] : this._breadcrumbs;
    return breadcrumbs.slice(0, MAX_DEPTH + (this.showHomeLink ? 1 : 0)).map(breadcrumb => ({
      ...breadcrumb,
      url: this.navContext && breadcrumb.pageReference ? generateUrl(this.navContext, breadcrumb.pageReference) : ''
    }));
  }
}