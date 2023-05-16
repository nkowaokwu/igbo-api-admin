import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import HeadwordForm from '../HeadwordForm';

describe('HeadwordForm', () => {
  it('renders the headword section', async () => {
    const { findByText, findByTestId } = render(
      <TestContext>
        <HeadwordForm />
      </TestContext>,
    );

    await findByText('Headword');
    await findByText('Is Standard Igbo');
    await findByText('Is Accented');
    await findByText('Is Slang');
    await findByText('Is Constructed Term');
    await findByText('Is Borrowed Term');
    await findByText('Is Stem');
    const wordInput = await findByTestId('word-input');
    await findByText('Advanced Headword Options');
    expect(wordInput.getAttribute('value')).toEqual('word');
  });

  it('toggles the advanced headword options summary', async () => {
    const { findByText, findByTestId } = render(
      <TestContext>
        <HeadwordForm />
      </TestContext>,
    );
    userEvent.click(await findByText('Advanced Headword Options'));
    await findByText('Headword pronunciation spelling:');
    await findByTestId('word-pronunciation-input');
    await findByTestId('conceptual-word-input');
  });
});
