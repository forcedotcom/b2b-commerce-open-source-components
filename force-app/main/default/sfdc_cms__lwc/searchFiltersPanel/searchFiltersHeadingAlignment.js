export default function searchFiltersHeadingAlignment(headingTextAlign) {
  switch (headingTextAlign) {
    case 'right':
      return 'flex-end';
    case 'center':
      return 'center';
    default:
      return 'flex-start';
  }
}