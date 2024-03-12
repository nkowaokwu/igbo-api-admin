import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';
import { definitionFixture, exampleFixture, wordFixture } from 'src/__tests__/shared/fixtures';
import createDefaultWordFormValues from '../utils/createDefaultWordFormValues';

describe('WordEditForm utils', () => {
  it('creates a default word form value', () => {
    const word = wordFixture({
      definitions: [definitionFixture({ definitions: ['first definition'], nsibidi: 'first nsibidi' })],
      examples: [exampleFixture({ style: ExampleStyleEnum.NO_STYLE })],
    });
    const defaultValues = createDefaultWordFormValues(word);

    expect(defaultValues.definitions[0].wordClass.value).toEqual('ADJ');
    expect(defaultValues.definitions[0].wordClass.label).toEqual('Adjective');
    expect(defaultValues.definitions[0].definitions[0].text).toEqual('first definition');
    expect(defaultValues.definitions[0].nsibidi).toEqual('first nsibidi');
    expect(defaultValues.examples).toHaveLength(1);
    expect(defaultValues.examples[0].style).toEqual({
      label: ExampleStyle[word.examples[0].style].label,
      value: ExampleStyle[word.examples[0].style].value,
    });
    expect(defaultValues.stems).toHaveLength(0);
    expect(defaultValues.relatedTerms).toHaveLength(0);
    expect(defaultValues.pronunciation).toEqual('');
    expect(defaultValues.examples[0]).toHaveProperty('exampleId');
  });
});
