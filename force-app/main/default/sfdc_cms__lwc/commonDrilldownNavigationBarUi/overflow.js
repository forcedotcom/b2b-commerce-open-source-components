export const addOverflowMenu = (menuItems, itemWidths, availableWidth) => {
  const topLevelItems = [];
  let remainingWidth = availableWidth;
  for (const [index, item] of menuItems.entries()) {
    const width = itemWidths[index];
    if (width <= remainingWidth) {
      topLevelItems.push(item);
      remainingWidth -= width;
    } else {
      break;
    }
  }
  if (menuItems.length - topLevelItems.length > 0) {
    const overflowItems = menuItems.slice(topLevelItems.length);
    const containsActiveItem = overflowItems.some(i => i.active);
    return [topLevelItems, overflowItems, containsActiveItem];
  }
  return [menuItems, [], false];
};