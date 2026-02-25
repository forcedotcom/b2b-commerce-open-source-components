export const mappedStyles = {
  'text-shadow': 'text-shadow',
  background: 'background',
  'background-color': 'background-color',
  'text-decoration': 'text-decoration',
  'text-transform': 'text-transform',
  'font-style': 'font-style',
  'font-weight': 'font-weight',
  color: (styles, state) => {
    return state.isHovering ? styles['text-hover-color'] : styles['text-color'];
  },
  'border-bottom': (styles, state) => {
    return state.isActive ? styles['border-bottom-active'] : styles['border-bottom-inactive'];
  }
};
export const NAVIGATE_EVENT = 'navigatetopage';
export const SHOW_APP_LAUNCHER = 'showapplauncher';
export const DEFAULT_ALIGNMENT = 'left';
export const MAX_DISPLAYABLE_ITEMS = 20;