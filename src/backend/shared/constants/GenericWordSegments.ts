export default {
  // Includes all diacritics for the letters a, e, and i
  FIRST_GROUP: /^[a-iA-IìíīịÍĪỊāàÁĀèéēÈÉĒ]/u,
  // Includes all diacritics for the letter n
  SECOND_GROUP: /^[j-nJ-NṄǹńṅǸŃ]/u,
  // Includes all diacritics for the letters o and u
  THIRD_GROUP: /^[o-zO-Z\*\.,\-+$òóōọÒÓŌỌùúūụÙÚŪỤ]/u, // eslint-disable-line
};
