import { capitalize } from 'lodash';
import TenseEnum from './TenseEnum';
/**
 * This file defines the valid tenses options for words and wordSuggestions
 */

export default {
  [TenseEnum.INFINITIVE]: {
    value: TenseEnum.INFINITIVE,
    label: capitalize(TenseEnum.INFINITIVE),
  },
  [TenseEnum.IMPERATIVE]: {
    value: TenseEnum.IMPERATIVE,
    label: capitalize(TenseEnum.IMPERATIVE),
  },
  [TenseEnum.SIMPLE_PAST]: {
    value: TenseEnum.SIMPLE_PAST,
    label: capitalize(TenseEnum.SIMPLE_PAST),
  },
  [TenseEnum.PRESENT_PASSIVE]: {
    value: TenseEnum.PRESENT_PASSIVE,
    label: capitalize(TenseEnum.PRESENT_PASSIVE),
  },
  [TenseEnum.SIMPLE_PRESENT]: {
    value: TenseEnum.SIMPLE_PRESENT,
    label: capitalize(TenseEnum.SIMPLE_PRESENT),
  },
  [TenseEnum.PRESENT_CONTINUOUS]: {
    value: TenseEnum.PRESENT_CONTINUOUS,
    label: capitalize(TenseEnum.PRESENT_CONTINUOUS),
  },
  [TenseEnum.FUTURE]: {
    value: TenseEnum.FUTURE,
    label: capitalize(TenseEnum.FUTURE),
  },
};
