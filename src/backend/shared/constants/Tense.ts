import TenseEnum from './TenseEnum';
/**
 * This file defines the valid tenses options for words and wordSuggestions
 */

export default {
  [TenseEnum.INFINITIVE]: {
    value: 'infinitive',
    label: TenseEnum.INFINITIVE,
  },
  [TenseEnum.IMPERATIVE]: {
    value: 'imperative',
    label: TenseEnum.IMPERATIVE,
  },
  [TenseEnum.SIMPLE_PAST]: {
    value: 'simplePast',
    label: TenseEnum.SIMPLE_PAST,
  },
  [TenseEnum.PRESENT_PASSIVE]: {
    value: 'presentPassive',
    label: TenseEnum.PRESENT_PASSIVE,
  },
  [TenseEnum.SIMPLE_PRESENT]: {
    value: 'simplePresent',
    label: TenseEnum.SIMPLE_PRESENT,
  },
  [TenseEnum.PRESENT_CONTINUOUS]: {
    value: 'presentContinuous',
    label: TenseEnum.PRESENT_CONTINUOUS,
  },
  [TenseEnum.FUTURE]: {
    value: 'future',
    label: TenseEnum.FUTURE,
  },
};
