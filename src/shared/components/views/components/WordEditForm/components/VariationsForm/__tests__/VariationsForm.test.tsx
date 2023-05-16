import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import VariationsForm from '../VariationsForm';

describe('VariationsForm', () => {
  it('renders the variations', async () => {
    const { findByText, findByLabelText } = render(
      <TestContext groupIndex={0}>
        <VariationsForm />
      </TestContext>,
    );
    await findByText('Spelling Variations');
    await findByLabelText('Add Variation');
    await findByText('No spelling variations');
  });

  it('adds a new variation', async () => {
    const {
      findAllByLabelText,
      queryByTestId,
      findByLabelText,
      findByTestId,
    } = render(
      <TestContext groupIndex={0}>
        <VariationsForm />
      </TestContext>,
    );
    userEvent.click(await findByLabelText('Add Variation'));
    userEvent.type(await findByTestId('variation-0-input'), 'new variation');
    userEvent.click((await findAllByLabelText('Delete Variation'))[0]);

    expect(await queryByTestId('variation-0-input')).toBeNull();
  });
});
