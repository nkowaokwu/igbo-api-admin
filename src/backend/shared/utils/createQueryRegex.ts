import { SearchRegExp } from 'src/backend/controllers/utils/interfaces';
import createRegExp from './createRegExp';

/* Either creates a regex pattern for provided searchWord
or fallbacks to matching every word */
export default (searchWord: string): SearchRegExp => (
  !searchWord ? { wordReg: /./, definitionsReg: /./ } : createRegExp(searchWord)
);
