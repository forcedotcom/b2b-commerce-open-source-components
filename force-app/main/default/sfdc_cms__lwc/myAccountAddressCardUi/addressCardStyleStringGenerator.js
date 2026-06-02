export default {
  defaultBadgeStyle: {
    createForStyles(styles) {
      const parts = [];
      if (styles['default-badge-bg-color']) {
        parts.push(`background-color: ${styles['default-badge-bg-color']}`);
      }
      if (styles['default-badge-border-radius']) {
        parts.push(`border-radius: ${styles['default-badge-border-radius']}`);
      }
      return parts.join('; ');
    }
  }
};