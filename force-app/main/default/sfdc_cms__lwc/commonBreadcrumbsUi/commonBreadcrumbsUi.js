import { api, LightningElement } from 'lwc';
import { generateStyleProperties, generateTextHeadingSizeClass } from 'experience/styling';
import componentNameLabel from '@salesforce/label/site.commonBreadcrumbsUi.component_name';
import sanitizeValue from 'site/commonRichtextsanitizerUtils';
export default class CommonBreadcrumbsUi extends LightningElement {
  static renderMode = 'light';
  @api
  breadcrumbs;
  @api
  showLastItemAsLink = false;
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
  get hasBreadcrumbs() {
    return Boolean(this.breadcrumbs?.length);
  }
  get normalizedBreadcrumbs() {
    const maxDepth = this.breadcrumbs?.length;
    const maxDepthMobile = typeof this.maxDepthOnMobile === 'number' ? this.maxDepthOnMobile : maxDepth;
    const normalizedMaxDepthMobile = Math.max(0, Math.min(maxDepth, maxDepthMobile));
    const differsOnMobile = maxDepth !== normalizedMaxDepthMobile;
    return this.breadcrumbs.map((breadcrumb, index) => {
      const isLastOnMobile = differsOnMobile && index === normalizedMaxDepthMobile - 1;
      let sanitizedLabel = breadcrumb.label;
      if (!import.meta.env.SSR && this.htmlProductNameGate) {
        sanitizedLabel = sanitizeValue(sanitizedLabel);
      }
      return {
        ...breadcrumb,
        label: sanitizedLabel,
        isLast: isLastOnMobile,
        classes: ['l', ...(index < normalizedMaxDepthMobile ? ['s'] : []), ...(isLastOnMobile ? ['last'] : []), ...(isLastOnMobile && !this.showLastItemAsLink ? ['text'] : [])]
      };
    });
  }
  get componentNameLabel() {
    return componentNameLabel;
  }
  get computedTextSizeClass() {
    return ['breadcrumb-list', generateTextHeadingSizeClass(this.textSize)];
  }
  _htmlProductNameGate = false;
  @api
  set htmlProductNameGate(value) {
    this._htmlProductNameGate = value;
  }
  get htmlProductNameGate() {
    return this._htmlProductNameGate;
  }
  get customStyles() {
    return generateStyleProperties({
      '--com-c-breadcrumb-link-color': this.linkColor || 'initial',
      '--com-c-breadcrumb-link-hover-color': this.linkHoverColor || 'initial',
      '--com-c-breadcrumb-text-color': this.textColor || 'initial',
      '--com-c-breadcrumb-divider-color': this.dividerColor || 'initial',
      '--com-c-breadcrumb-divider': `'${this.divider || ''}'`
    });
  }
}