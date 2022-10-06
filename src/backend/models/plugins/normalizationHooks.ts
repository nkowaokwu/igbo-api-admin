import mongoose from 'mongoose';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

/* Decomposes the headword for improved search */
export const normalizeHeadword = (schema: mongoose.Schema<Interfaces.WordSuggestion>): void => {
  schema.pre('save', async function (next) {
    this.word = (this.word || '').normalize('NFD');
    next();
    return this;
  });
};

export const normalizeIgbo = (schema: mongoose.Schema<Interfaces.ExampleSuggestion>): void => {
  schema.pre('save', async function (next) {
    this.igbo = (this.igbo || '').normalize('NFD');
    next();
    return this;
  });
};
