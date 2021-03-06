import axios from 'axios';
import { Record } from 'react-admin';
import { compact } from 'lodash';
import { Word } from 'src/backend/controllers/utils/interfaces';

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
    if (key === 'dialects') {
      const dialectsPronunciationsPromises = Object.entries(record.dialects)
        .reduce((
          finalDialectsPronunciationPromises: any[],
          [dialectKey, dialectValue] : [string, { pronunciation: string }],
        ) => {
          if (dialectValue?.pronunciation) {
            return [
              ...finalDialectsPronunciationPromises,
              axios.get(dialectValue?.pronunciation)
                .then(() => ({
                  dialect: {
                    [dialectKey]: true,
                  },
                }))
                .catch(() => ({
                  dialect: {
                    [dialectKey]: false,
                  },
                })),
            ];
          }
          return null;
        }, []);
      return finalPronunciationsPromises.concat(dialectsPronunciationsPromises);
    }
    return finalPronunciationsPromises;
  }, []);

  const resolvedPronunciations = await Promise.all(pronunciationsPromises);
  callback(compact(resolvedPronunciations));
};
