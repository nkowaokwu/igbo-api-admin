import parquet from 'parquetjs';

/* Translation schema */
const translationSchema = {
  text: { type: 'UTF8' },
  language: { type: 'UTF8' },
  pronunciations: {
    repeated: true,
    fields: {
      audio: { type: 'UTF8' },
      speaker: { type: 'UTF8' },
    },
  },
};

/* Schema used for Parquet file */
export const exampleSchema = new parquet.ParquetSchema({
  source: {
    fields: translationSchema,
  },
  translations: {
    repeated: true,
    fields: translationSchema,
  },
});
