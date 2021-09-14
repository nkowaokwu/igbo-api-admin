import { WordDialect } from 'src/backend/controllers/utils/interfaces';
import Dialects from '../../../backend/shared/constants/Dialects';
/* Renders the date in a correct format */
export const determineDate = (updatedOn: string | number): string | Date => {
  if (!updatedOn) {
    return 'N/A';
  }
  return new Date(updatedOn).toLocaleString();
};

/* Builds an empty record dialects object for deprecated word suggestions */
export const generateEmptyRecordDialects = (): { [key: string]: WordDialect } => (
  Object.values(Dialects).reduce((recordDialects, { value }) => (
    {
      ...recordDialects,
      [value]: {
        word: '',
        dialect: value,
        pronunciation: '',
        variations: [],
      },
    }
  ), {})
);
