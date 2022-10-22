import { SearchRegExp } from 'src/backend/controllers/utils/interfaces';

type HandledQueries = {
  searchWords: '',
  regexKeyword: SearchRegExp,
  page: number,
  sort: { key: string, direction: string } | null,
  skip: number,
  limit: number,
  range: [string | number, string | number],
  filters: string,
  user: string,
  strict: boolean,
};

export default HandledQueries;
