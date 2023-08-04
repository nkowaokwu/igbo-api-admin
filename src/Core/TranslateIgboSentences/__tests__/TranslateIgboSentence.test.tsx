// Testing react-select dropdown: https://stackoverflow.com/a/61551935
import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import TranslateIgboSentences from '../TranslateIgboSentences';

describe('TranslateIgboSentences', () => {
  it('render TranslateIgboSentences', async () => {
    const { findByText } = render(
      <TestContext>
        <TranslateIgboSentences />
      </TestContext>,
    );

    await findByText('Submit Batch');
    await findByText('First Igbo');
  });
});
