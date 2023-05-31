import React from 'react';
import { render, configure } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import Collections from 'src/shared/constants/Collections';
import ListActions from '../ListActions';

configure({ testIdAttribute: 'data-test' });

describe('Render List Actions', () => {
  beforeEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  });
  it('render the list actions menu for words', async () => {
    const { findByTestId, findByText, queryByText } = render(
      <TestContext isListView>
        <ListActions resource={Collections.WORDS} />
      </TestContext>,
    );

    const wordAttributesFilter = await findByTestId('word-attributes-filter');
    userEvent.click(wordAttributesFilter);
    await findByText('Word Attributes');
    await findByText('Is Standard Igbo');
    await findByText('Has No Pronunciation');
    await findByText('Has Nsịbịdị');
    await findByText('Has No Nsịbịdị');
    await findByText('Is Constructed Term');
    await findByText('Has Pronunciation');

    expect(await queryByText('From Nkọwa okwu')).toBeNull();
    expect(await queryByText('From Igbo API Editor Platform')).toBeNull();
    expect(await queryByText('Is Currently Editing')).toBeNull();
    expect(await queryByText('Is Author')).toBeNull();
    expect(await queryByText('Merged By You')).toBeNull();
    const isStandardIgboOption = document.querySelector('[value="isStandardIgbo"]');
    userEvent.click(isStandardIgboOption);
    expect(isStandardIgboOption.isSameNode(document.querySelector('[aria-checked="true"][value="isStandardIgbo"]')))
      .toBe(true);
    const partOfSpeechFilter = await findByTestId('part-of-speech-filter');
    userEvent.click(partOfSpeechFilter);
    const activeVerbOption = document.querySelector('[value="AV"]');
    userEvent.click(activeVerbOption);
    expect(activeVerbOption.isSameNode(document.querySelector('[aria-checked="true"][value="AV"]')))
      .toBe(true);
  });

  it('render the list actions menu for word suggestions', async () => {
    const { findByTestId, findByText } = render(
      <TestContext>
        <ListActions resource={Collections.WORD_SUGGESTIONS} />
      </TestContext>,
    );

    const wordAttributesFilter = await findByTestId('word-attributes-filter');
    userEvent.click(wordAttributesFilter);
    await findByText('Word Attributes');
    await findByText('Is Standard Igbo');
    await findByText('Has No Pronunciation');
    await findByText('Has Nsịbịdị');
    await findByText('Has No Nsịbịdị');
    await findByText('Is Constructed Term');
    await findByText('From Nkọwa okwu');
    await findByText('From Igbo API Editor Platform');
    await findByText('Is Currently Editing');
    await findByText('Is Author');
    await findByText('Merged By You');
    await findByText('Has Pronunciation');
    const isStandardIgboOption = document.querySelector('[value="isStandardIgbo"]');
    userEvent.click(isStandardIgboOption);
    expect(isStandardIgboOption.isSameNode(document.querySelector('[aria-checked="true"][value="isStandardIgbo"]')))
      .toBe(true);
    const partOfSpeechFilter = await findByTestId('part-of-speech-filter');
    userEvent.click(partOfSpeechFilter);
    const activeVerbOption = document.querySelector('[value="AV"]');
    userEvent.click(activeVerbOption);
    expect(activeVerbOption.isSameNode(document.querySelector('[aria-checked="true"][value="AV"]')))
      .toBe(true);
  });

  it('render the list actions menu for examples', async () => {
    const { findByTestId, findByText, queryByText } = render(
      <TestContext>
        <ListActions resource={Collections.EXAMPLES} />
      </TestContext>,
    );

    const exampleAttributesFilter = await findByTestId('example-attributes-filter');
    userEvent.click(exampleAttributesFilter);
    await findByText('Example Attributes');
    await findByText('Is Proverb');
    await findByText('Is Data Collection');
    await findByText('Is Biblical');
    await findByText('Has Pronunciation');

    expect(await queryByText('From Nkọwa okwu')).toBeNull();
    expect(await queryByText('From Igbo API Editor Platform')).toBeNull();
    expect(await queryByText('Is Currently Editing')).toBeNull();
    expect(await queryByText('Is Author')).toBeNull();
    expect(await queryByText('Merged By You')).toBeNull();

    const isProverb = document.querySelector('[value="isProverb"]');
    userEvent.click(isProverb);
    expect(isProverb.isSameNode(document.querySelector('[aria-checked="true"][value="isProverb"]')))
      .toBe(true);
  });

  it('render the list actions menu for example suggestions', async () => {
    const { findByTestId, findByText } = render(
      <TestContext>
        <ListActions resource={Collections.EXAMPLE_SUGGESTIONS} />
      </TestContext>,
    );

    const exampleAttributesFilter = await findByTestId('example-attributes-filter');
    userEvent.click(exampleAttributesFilter);
    await findByText('Example Attributes');
    await findByText('Is Proverb');
    await findByText('Is Data Collection');
    await findByText('Is Biblical');
    await findByText('From Nkọwa okwu');
    await findByText('From Igbo API Editor Platform');
    await findByText('Is Currently Editing');
    await findByText('Is Author');
    await findByText('Merged By You');
    await findByText('Has Pronunciation');
    const isProverb = document.querySelector('[value="isProverb"]');
    userEvent.click(isProverb);
    expect(isProverb.isSameNode(document.querySelector('[aria-checked="true"][value="isProverb"]')))
      .toBe(true);
  });
});
