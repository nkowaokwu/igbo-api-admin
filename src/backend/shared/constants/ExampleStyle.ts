import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';

/* Different example sentence styles */
export default {
  [ExampleStyleEnum.NO_STYLE]: {
    value: ExampleStyleEnum.NO_STYLE,
    label: 'No Style',
    description: 'This is a regular, non-Standard example sentence.',
    colorScheme: 'gray',
  },
  [ExampleStyleEnum.STANDARD]: {
    value: ExampleStyleEnum.STANDARD,
    label: 'Standard',
    description: 'This is a standard example sentence that follows our standard sentence rules.',
    colorScheme: 'blue',
  },
  [ExampleStyleEnum.PROVERB]: {
    value: ExampleStyleEnum.PROVERB,
    label: 'Proverb',
    description: 'This is a proverb sentence.',
    colorScheme: 'orange',
  },
  [ExampleStyleEnum.BIBLICAL]: {
    value: ExampleStyleEnum.BIBLICAL,
    label: 'Biblical',
    description: 'This is a sentence from the Bible.',
    colorScheme: 'green',
  },
};
