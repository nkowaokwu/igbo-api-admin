import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import ResourceConnectionButton from '../ResourceConnectionButton';

const mockClick = jest.fn();

describe('ResourceConnectionButton', () => {
  it('render archiving state for ResourceConnectionButton', async () => {
    const { findByLabelText } = render(
      <TestContext>
        <ResourceConnectionButton tooltip="Testing" shouldArchive onClick={mockClick} />
      </TestContext>,
    );
    fireEvent.click(await findByLabelText('Archive'));
    expect(mockClick).toHaveBeenCalled();
  });

  it('render detach state for ResourceConnectionButton', async () => {
    const { findByLabelText } = render(
      <TestContext>
        <ResourceConnectionButton tooltip="Testing" shouldDetach onClick={mockClick} />
      </TestContext>,
    );
    fireEvent.click(await findByLabelText('Detach'));
    expect(mockClick).toHaveBeenCalled();
  });

  it('render delete state for ResourceConnectionButton', async () => {
    const { findByLabelText } = render(
      <TestContext>
        <ResourceConnectionButton tooltip="Testing" shouldArchive={false} shouldDetach={false} onClick={mockClick} />
      </TestContext>,
    );
    fireEvent.click(await findByLabelText('Delete'));
    expect(mockClick).toHaveBeenCalled();
  });
});
