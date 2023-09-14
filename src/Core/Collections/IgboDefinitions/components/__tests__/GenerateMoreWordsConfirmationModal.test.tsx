import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import GenerateMoreWordsConfirmationModal from '../GenerateMoreWordsConfirmationModal';

describe('GenerateMoreWordsConfirmationModal', () => {
  it('renders the modal', async () => {
    const mockClose = jest.fn();
    const mockCancel = jest.fn();
    const { findByText } = render(
      <TestContext index={0}>
        <GenerateMoreWordsConfirmationModal isOpen onClose={mockClose} onCancel={mockCancel} isLoading={false} />
      </TestContext>,
    );
    await findByText('Get More Words');
    await findByText(/Get more word suggestions/);
    await findByText(/Please enter the number/);
    await findByText('Cancel');
    await findByText('Get words');
  });

  it('triggers cancel and close the dialect', async () => {
    const mockClose = jest.fn();
    const mockCancel = jest.fn();
    const { findByText } = render(
      <TestContext index={0}>
        <GenerateMoreWordsConfirmationModal isOpen onClose={mockClose} onCancel={mockCancel} isLoading={false} />
      </TestContext>,
    );
    fireEvent.click(await findByText('Get words'));
    expect(mockClose).toHaveBeenCalled();
    fireEvent.click(await findByText('Cancel'));
    expect(mockCancel).toHaveBeenCalled();
  });
});
