import { assign } from 'lodash';
import { WordData } from 'src/backend/controllers/utils/interfaces';

const cleanTenses = (data: WordData): WordData => {
  const cleanedData = assign(data);

  Object.entries(cleanedData.tenses).forEach(([key, value]) => {
    cleanedData.tenses[key] = typeof value === 'string' && Boolean(value) ? value : '';
  });

  return cleanedData;
};

export default cleanTenses;
