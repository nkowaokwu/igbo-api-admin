import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dialects from 'src/backend/shared/constants/Dialect';
import TestContext from 'src/__tests__/components/TestContext';
import DialectForm from '../DialectForm';

describe('DialectForm', () => {
  it('renders the dialect', async () => {
    const { findByText, findByTestId, getByText } = render(
      <TestContext index={0}>
        <DialectForm />
      </TestContext>,
    );
    await findByText('Word');
    await findByText('Word Pronunciation');
    await findByText('Dialects');

    const dialectSelect = await findByTestId('dialects-input-container-0');
    fireEvent.keyDown(dialectSelect.firstChild, { key: 'ArrowDown' });

    Object.values(Dialects).forEach(({ label }) => {
      getByText(label);
    });
  });

  it('selects a dialect', async () => {
    const { findByText, queryByText, findByTestId, getByText } = render(
      <TestContext index={0}>
        <DialectForm />
      </TestContext>,
    );
    await findByText('Word');
    await findByText('Word Pronunciation');
    await findByText('Dialects');

    const dialectSelect = await findByTestId('dialects-input-container-0');
    fireEvent.keyDown(dialectSelect.firstChild, { key: 'ArrowDown' });

    userEvent.click(await findByText(Dialects.AJA.label));
    Object.values(Dialects).forEach(({ label }) => {
      if (label !== Dialects.AJA.label && label !== Dialects.ABI.label) {
        expect(queryByText(label)).toBeNull();
      } else {
        expect(getByText(label));
      }
    });
  });
});
