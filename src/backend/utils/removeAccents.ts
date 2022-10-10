const accents = {
  // Remove all diacritic marks including underdots
  remove: (string = ''): string => string.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
};

export default accents;
