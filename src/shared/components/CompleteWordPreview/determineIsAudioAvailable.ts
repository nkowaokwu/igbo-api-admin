import axios from 'axios';
import { compact, get } from 'lodash';
import { Record } from 'react-admin';
import { Word, WordDialect } from 'src/backend/controllers/utils/interfaces';

export default async (record: Word | Record, callback: (value: any) => void): Promise<any> => {
  const pronunciationsPromises = Object.entries(record).reduce((finalPronunciationsPromises, [key, value]) => {
    if (key === 'pronunciation' && value) {
      return [
        ...finalPronunciationsPromises,
        axios.get(record.pronunciation)
          .then(() => ({ pronunciation: true }))
          .catch(() => ({ pronunciation: false })),
      ];
    }
    if (key === 'dialects' && Array.isArray(get(record, 'dialects'))) {
      const dialectsPronunciationsPromises = record.dialects
        .reduce((
          finalDialectsPronunciationPromises: any[],
          { word, pronunciation } : WordDialect,
        ) => {
          if (pronunciation) {
            return [
              ...finalDialectsPronunciationPromises,
              axios.get(pronunciation)
                .then(() => ({
                  [word]: true,
                }))
                .catch(() => ({
                  [word]: false,
                })),
            ];
          }
          return finalDialectsPronunciationPromises;
        }, []);
      return finalPronunciationsPromises.concat(dialectsPronunciationsPromises);
    }
    return finalPronunciationsPromises;
  }, []);

  const resolvedPronunciations = await Promise.all(pronunciationsPromises);
  callback(compact(resolvedPronunciations));
};
