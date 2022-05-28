/* Removes the verb prefix character '-' */
export default (term: string): string => {
  if (typeof term === 'string' && term && term.charAt(0) === '-') {
    return term.substring(1);
  }
  return term;
};
