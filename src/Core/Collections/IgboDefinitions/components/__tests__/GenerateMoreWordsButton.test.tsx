import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import * as DataCollectionAPI from 'src/shared/DataCollectionAPI';
import GenerateMoreWordsButton from '../GenerateMoreWordsButton';

describe('GenerateMoreWordsButton', () => {
  it('render button', async () => {
    const { findByText } = render(
      <TestContext>
        <GenerateMoreWordsButton />
      </TestContext>,
    );

    await findByText('Get more words');
  });

  it('open and closes confirmation modal', async () => {
    const { findByText, queryByText } = render(
      <TestContext>
        <GenerateMoreWordsButton />
      </TestContext>,
    );

    expect(queryByText('Get More Words')).toBeNull();
    userEvent.click(await findByText('Get more words'));
    await findByText('Get More Words');
    userEvent.click(await findByText('Get words'));
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(queryByText('Get More Words')).toBeNull();
  });

  it('sends request to create more word suggestions', async () => {
    const postSpy = jest.spyOn(DataCollectionAPI, 'postWordSuggestionsForIgboDefinitions').mockReturnValue({});

    const { findByText, findByPlaceholderText } = render(
      <TestContext>
        <GenerateMoreWordsButton />
      </TestContext>,
    );

    userEvent.click(await findByText('Get more words'));
    userEvent.clear(await findByPlaceholderText('Number of word suggestions to create. i.e. 10'));
    userEvent.type(await findByPlaceholderText('Number of word suggestions to create. i.e. 10'), '7');
    userEvent.click(await findByText('Get words'));
    expect(postSpy).toHaveBeenCalledWith({
      limit: 7,
    });
  });
});
