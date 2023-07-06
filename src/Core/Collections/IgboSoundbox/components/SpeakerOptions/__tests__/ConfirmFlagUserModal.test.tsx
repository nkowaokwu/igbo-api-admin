// Testing react-select dropdown: https://stackoverflow.com/a/61551935
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import ConfirmFlagUserModal from '../ConfirmFlagUserModal';

describe('ConfirmFlagUserModal', () => {
  it('render the confirm flag user modal', async () => {
    const title = 'Title';
    const { findByText, findByPlaceholderText } = render(
      <TestContext isOpen title={title}>
        <ConfirmFlagUserModal />
      </TestContext>,
    );

    await findByText('Reason');
    await findByText('Details');
    await findByPlaceholderText("Please share details on this user's activity.");
    await findByText('Cancel');
    await findByText('Submit report');
  });

  it('submits the confirm flag user modal', async () => {
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();
    const title = 'Title';
    const { findByText, findByPlaceholderText } = render(
      <TestContext isOpen title={title} onConfirm={mockOnConfirm} onClose={mockOnClose}>
        <ConfirmFlagUserModal />
      </TestContext>,
    );

    fireEvent.click(await findByText('Inappropriate activity'));
    userEvent.type(await findByPlaceholderText("Please share details on this user's activity."), 'True reason');
    fireEvent.click(await findByText('Submit report'));
    expect(mockOnConfirm).toBeCalledWith({
      reason: 'Inappropriate activity',
      details: 'True reason',
    });
    expect(mockOnClose).toBeCalled();
  });

  it('cancels the confirm flag user modal', async () => {
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();
    const title = 'Title';
    const { findByText, findByPlaceholderText } = render(
      <TestContext isOpen title={title} onConfirm={mockOnConfirm} onClose={mockOnClose}>
        <ConfirmFlagUserModal />
      </TestContext>,
    );

    fireEvent.click(await findByText('Inappropriate activity'));
    userEvent.type(await findByPlaceholderText("Please share details on this user's activity."), 'True reason');
    fireEvent.click(await findByText('Cancel'));
    expect(mockOnClose).toBeCalled();
    expect(mockOnConfirm).not.toBeCalled();
  });
});
