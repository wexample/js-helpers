function stringToKebab(value) {
  if (!value) {
    return 'index';
  }

  return value
    .replace(/\.[^.]+$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

module.exports = {
  stringToKebab,
  default: stringToKebab,
};
