import { LightningElement, api } from 'lwc';
/**
 * @slot content
 */
export default class CommonContainerSticky extends LightningElement {
  static renderMode = 'light';
  @api
  stickyType = 'bottomMobile';
  observer;
  isStickyBottom = true;
  connectedCallback() {
    if (!import.meta.env.SSR) {
      const options = {
        root: null,
        threshold: 0.0
      };
      this.observer = new IntersectionObserver(this.handleIntersect.bind(this), options);
    }
  }
  renderedCallback() {
    const targetElement = this.refs?.stickyContainer;
    this.observer?.unobserve(targetElement);
    this.observer?.observe(targetElement);
  }
  disconnectedCallback() {
    this.observer?.disconnect();
    this.observer = undefined;
  }
  handleIntersect(entries) {
    entries.forEach(entry => {
      const elementIsInViewport = entry.isIntersecting;
      const elementIsAboveViewport = entry.target.getBoundingClientRect().bottom < 0;
      if (!elementIsInViewport && !elementIsAboveViewport) {
        this.isStickyBottom = true;
      } else {
        this.isStickyBottom = false;
      }
    });
  }
  get containerClasses() {
    if (this.stickyType === 'columnContentDesktop') {
      return 'reduced-height';
    }
    return undefined;
  }
  get contentClasses() {
    if (this.stickyType === 'columnContentDesktop') {
      return 'content-column';
    } else if (this.stickyType === 'bottomMobile' && this.isStickyBottom) {
      return 'content-bottom';
    }
    return undefined;
  }
}