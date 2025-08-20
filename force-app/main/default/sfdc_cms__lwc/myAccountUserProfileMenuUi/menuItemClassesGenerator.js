export function cssClassesForMenuItem(hasFocus, hasBorder) {
  const classes = ['slds-text-color_default', 'slds-truncate'];
  if (hasBorder) {
    classes.push('slds-border_bottom');
  }
  if (hasFocus) {
    classes.push('menu-item_hover', 'menu-item-bg-hover-color', 'profile-menu-item_hover');
  } else {
    classes.push('menu-item', 'profile-menu-item');
  }
  return classes;
}