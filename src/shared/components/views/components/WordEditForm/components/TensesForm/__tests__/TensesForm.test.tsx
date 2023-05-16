import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import Tense from 'src/backend/shared/constants/Tense';
import TensesForm from '../TensesForm';

describe('TensesForm', () => {
  it('renders all tense inputs', async () => {
    const { findByText, findByTestId } = render(
      <TestContext groupIndex={0}>
        <TensesForm />
      </TestContext>,
    );
    await findByText('Tenses');
    await Promise.all(Object.values(Tense).map(async ({ value }) => {
      expect((await findByTestId(`tenses-${value}-input`)).getAttribute('value')).toEqual('');
    }));
  });
});
