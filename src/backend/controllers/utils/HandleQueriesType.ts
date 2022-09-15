type HandledQueries = {
  searchWords: '',
  regexKeyword: RegExp,
  page: number,
  sort: { key: string, direction: string } | null,
  skip: number,
  limit: number,
  range: [string | number, string | number],
  filters: string,
  user: string,
  strict: boolean,
  constructedTerms: boolean,
};

export default HandledQueries;
