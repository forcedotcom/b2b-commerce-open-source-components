export default function sanitizeValue(richTextValue, allowedTags = ['sup', 'sub']) {
  if (!richTextValue) {
    return '';
  }
  if (!import.meta.env.SSR) {
    return richTextValue.replace(/<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g, (match, tagName) => {
      tagName = tagName.toLowerCase();
      if (allowedTags.includes(tagName)) {
        return match.startsWith('</') ? `</${tagName}>` : `<${tagName}>`;
      }
      return '';
    });
  }
  return richTextValue;
}