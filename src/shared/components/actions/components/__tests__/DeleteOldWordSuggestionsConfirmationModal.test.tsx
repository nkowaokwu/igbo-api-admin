import React from 'react';
import { noop } from 'lodash';
import { render, fireEvent } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import DeleteOldWordSuggestionsConfirmationModal from '../DeleteOldWordSuggestionsConfirmationModal';

describe('DeleteOldWordSuggestionsConfirmationModal', () => {
  it('render content in modal', async () => {
    const { findByText } = render(
      <TestContext>
        <DeleteOldWordSuggestionsConfirmationModal isOpen onClose={noop} onCancel={noop} isLoading={false} />
      </TestContext>,
    );

    await findByText('Delete Old Word Suggestions');
    await findByText(/You will be/);
    await findByText(/This excludes/);
    await findByText('Cancel');
    await findByText('Delete word suggestions');
  });

  it('closes the modal', async () => {
    const onCloseMock = jest.fn();
    const onCancelMock = jest.fn();
    const { findByText } = render(
      <TestContext>
        <DeleteOldWordSuggestionsConfirmationModal
          isOpen
          onClose={onCloseMock}
          onCancel={onCancelMock}
          isLoading={false}
        />
      </TestContext>,
    );

    fireEvent.click(await findByText('Cancel'));
    fireEvent.click(await findByText('Delete word suggestions'));

    expect(onCloseMock).toBeCalled();
    expect(onCancelMock).toBeCalled();
  });
});
