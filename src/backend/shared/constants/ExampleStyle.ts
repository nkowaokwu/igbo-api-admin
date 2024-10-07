import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';

/* Different example sentence styles */
export default {
  [ExampleStyleEnum.APOSTROPHE]: {
    value: ExampleStyleEnum.APOSTROPHE,
    label: 'Apostrophe',
    description: 'This is a sentence represents an apostrophe.',
    colorScheme: 'green',
  },
  [ExampleStyleEnum.BIBLICAL]: {
    value: ExampleStyleEnum.BIBLICAL,
    label: 'Biblical',
    description: 'This is a sentence from the Bible.',
    colorScheme: 'green',
  },
  [ExampleStyleEnum.EUPHEMISM]: {
    value: ExampleStyleEnum.EUPHEMISM,
    label: 'Euphemism',
    description: 'This is a sentence that contains a euphemism.',
    colorScheme: 'blue',
  },
  [ExampleStyleEnum.HYPERBOLE]: {
    value: ExampleStyleEnum.HYPERBOLE,
    label: 'Hyperbole',
    description: 'This is a sentence that contains a hyperbole.',
    colorScheme: 'green',
  },
  [ExampleStyleEnum.IDIOM]: {
    value: ExampleStyleEnum.IDIOM,
    label: 'Idiom',
    description: 'This is a sentence that contains a idiom.',
    colorScheme: 'red',
  },
  [ExampleStyleEnum.IRONY]: {
    value: ExampleStyleEnum.IRONY,
    label: 'Irony',
    description: 'This is a sentence that represents irony.',
    colorScheme: 'cyan',
  },
  [ExampleStyleEnum.METAPHOR]: {
    value: ExampleStyleEnum.METAPHOR,
    label: 'Metaphor',
    description: 'This is a sentence that contains a metaphor.',
    colorScheme: 'cyan',
  },
  [ExampleStyleEnum.METONYMY]: {
    value: ExampleStyleEnum.METONYMY,
    label: 'Metonymy',
    description: 'This is a sentence that contains a metonymy.',
    colorScheme: 'gray',
  },
  [ExampleStyleEnum.NO_STYLE]: {
    value: ExampleStyleEnum.NO_STYLE,
    label: 'No Style',
    description: 'This is a regular, non-Standard example sentence.',
    colorScheme: 'gray',
  },
  [ExampleStyleEnum.PARADOX]: {
    value: ExampleStyleEnum.PARADOX,
    label: 'Paradox',
    description: 'This is a sentence that contains a paradox.',
    colorScheme: 'gray',
  },
  [ExampleStyleEnum.PERSONIFICATION]: {
    value: ExampleStyleEnum.PERSONIFICATION,
    label: 'Personification',
    description: 'This is a sentence that represents personification.',
    colorScheme: 'orange',
  },
  [ExampleStyleEnum.PROVERB]: {
    value: ExampleStyleEnum.PROVERB,
    label: 'Proverb',
    description: 'This is a proverb sentence.',
    colorScheme: 'orange',
  },
  [ExampleStyleEnum.PUN]: {
    value: ExampleStyleEnum.PUN,
    label: 'Pun',
    description: 'This is a sentence that contains a pun.',
    colorScheme: 'blue',
  },
  [ExampleStyleEnum.RHETORICAL_QUESTION]: {
    value: ExampleStyleEnum.RHETORICAL_QUESTION,
    label: 'Rhetorical Question',
    description: 'This is a sentence that represents a rhetorical question.',
    colorScheme: 'blue',
  },
  [ExampleStyleEnum.SIMILE]: {
    value: ExampleStyleEnum.SIMILE,
    label: 'Simile',
    description: 'This is a sentence that contains a simile.',
    colorScheme: 'gray',
  },
  [ExampleStyleEnum.STANDARD]: {
    value: ExampleStyleEnum.STANDARD,
    label: 'Standard',
    description: 'This is a standard example sentence that follows our standard sentence rules.',
    colorScheme: 'blue',
  },
  [ExampleStyleEnum.SYNECDOCHE]: {
    value: ExampleStyleEnum.SYNECDOCHE,
    label: 'Synecdoche',
    description: 'This is a sentence that represents a synecdoche.',
    colorScheme: 'gray',
  },
};
