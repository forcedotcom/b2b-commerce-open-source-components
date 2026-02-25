export const mappedStyles = {
  'border-bottom-color': 'border-bottom-color',
  'text-decoration': 'text-decoration',
  'text-transform': 'text-transform',
  'font-style': 'font-style',
  'font-weight': 'font-weight',
  'background-color': 'background-color',
  width: 'width',
  background: (styles, state) => {
    return state.isHovering ? styles['background-hover'] : styles.background;
  },
  color: (styles, state) => {
    return state.isHovering ? styles['text-hover-color'] : styles['text-color'];
  },
  'border-left': (styles, state) => {
    return state.isActive ? styles['border-left-active'] : styles['border-left-inactive'];
  }
};
export const NAVIGATE_EVENT = 'navigatetopage';
export const DEFAULT_ITEM_LIMIT = 500;