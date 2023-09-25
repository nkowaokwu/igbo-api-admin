import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import SearchAndAddExampleButton from '../SearchAndAddExampleButton';

describe('SearchAndAddExampleButton', () => {
  it('shows the input field for searching example sentences', async () => {
    const mockAppend = jest.fn();

    const { findByText, findByPlaceholderText, findByLabelText } = render(
      <TestContext>
        <SearchAndAddExampleButton append={mockAppend} />
      </TestContext>,
    );

    fireEvent.click(await findByText('Attach Existing Example'));
    await findByPlaceholderText('Search example sentence');
    await findByLabelText('Close search bar');
  });

  it('search and add example suggestions', async () => {
    const mockAppend = jest.fn();

    const { findByText, findByPlaceholderText } = render(
      <TestContext>
        <SearchAndAddExampleButton append={mockAppend} />
      </TestContext>,
    );

    fireEvent.click(await findByText('Attach Existing Example'));
    userEvent.type(await findByPlaceholderText('Search example sentence'), 'igbo');
    await findByText('english-example');
    userEvent.click(await findByText('igbo-example'));
    expect(mockAppend).toHaveBeenCalled();
  });
});
