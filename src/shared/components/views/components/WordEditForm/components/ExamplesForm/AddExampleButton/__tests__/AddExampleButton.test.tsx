import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import AddExampleButton from '../AddExampleButton';

describe('AddExampleButton', () => {
  it('render AddExampleButton', async () => {
    const mockAppend = jest.fn();
    const { findByText } = render(
      <TestContext>
        <AddExampleButton append={mockAppend} />
      </TestContext>,
    );

    fireEvent.click(await findByText('Add Example'));
    expect(mockAppend).toBeCalled();
  });
});
