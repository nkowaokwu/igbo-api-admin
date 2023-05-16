import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dialects from 'src/backend/shared/constants/Dialects';
import TestContext from 'src/__tests__/components/TestContext';
import DialectForm from '../DialectForm';

describe('DialectForm', () => {
  it('renders the dialect', async () => {
    const { findByText, findByTestId } = render(
      <TestContext index={0}>
        <DialectForm />
      </TestContext>,
    );
    await findByText('Word');
    await findByText('Word Pronunciation');
    await findByText('Dialects');

    const dialectSelect = await findByTestId('dialects-input-container-0');
    fireEvent.keyDown(dialectSelect.firstChild, { key: 'ArrowDown' });

    await Promise.all(Object.values(Dialects).map(async ({ label }) => {
      await findByText(label);
    }));
  });

  it('selects a dialect', async () => {
    const { findByText, queryByText, findByTestId } = render(
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
    await Promise.all(Object.values(Dialects).map(async ({ label }) => {
      if (label !== Dialects.AJA.label && label !== Dialects.ABI.label) {
        expect(await queryByText(label)).toBeNull();
      } else {
        expect(await findByText(label));
      }
    }));
  });
});
