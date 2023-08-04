import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import { putWordSuggestionsWithoutIgboDefinitions } from 'src/shared/API';
import IgboDefinitions from '../IgboDefinitions';

describe('IgboDefinitions', () => {
  it('gets all five Igbo definitions with disabled submit button', async () => {
    const { findByText, findByLabelText } = render(
      <TestContext>
        <IgboDefinitions />
      </TestContext>,
    );
    await findByText('first retrieved word');
    userEvent.click(await findByLabelText('Next Igbo definition'));
    expect(await findByText('Submit Batch')).toHaveProperty('disabled', true);

    await findByText('second retrieved word');
    userEvent.click(await findByLabelText('Next Igbo definition'));
    expect(await findByText('Submit Batch')).toHaveProperty('disabled', true);

    await findByText('third retrieved word');
    userEvent.click(await findByLabelText('Next Igbo definition'));
    expect(await findByText('Submit Batch')).toHaveProperty('disabled', true);

    await findByText('fourth retrieved word');
    userEvent.click(await findByLabelText('Next Igbo definition'));
    expect(await findByText('Submit Batch')).toHaveProperty('disabled', true);

    await findByText('fifth retrieved word');
    expect(await findByText('Submit Batch')).toHaveProperty('disabled', true);
  });

  it('gets all five Igbo definitions with enabled submit button', async () => {
    const { findByText, findByPlaceholderText, findByLabelText } = render(
      <TestContext>
        <IgboDefinitions />
      </TestContext>,
    );
    await findByText('first retrieved word');
    userEvent.type(await findByPlaceholderText('Type Igbo definition here'), 'first igbo definition');
    userEvent.click(await findByLabelText('Next Igbo definition'));
    expect(await findByText('Submit Batch')).toHaveProperty('disabled', true);

    await findByText('second retrieved word');
    userEvent.click(await findByLabelText('Next Igbo definition'));
    expect(await findByText('Submit Batch')).toHaveProperty('disabled', true);

    await findByText('third retrieved word');
    userEvent.click(await findByLabelText('Next Igbo definition'));
    expect(await findByText('Submit Batch')).toHaveProperty('disabled', true);

    await findByText('fourth retrieved word');
    userEvent.click(await findByLabelText('Next Igbo definition'));
    expect(await findByText('Submit Batch')).toHaveProperty('disabled', false);

    await findByText('fifth retrieved word');
    expect(await findByText('Submit Batch')).toHaveProperty('disabled', false);

    userEvent.click(await findByLabelText('Previous Igbo definition'));
    expect(await findByText('Submit Batch')).toHaveProperty('disabled', false);
  });

  it('provides properly formatted payload', async () => {
    const { findByText, findByPlaceholderText, findByLabelText } = render(
      <TestContext>
        <IgboDefinitions />
      </TestContext>,
    );
    await findByText('first retrieved word');
    userEvent.type(await findByPlaceholderText('Type Igbo definition here'), 'first igbo definition');
    userEvent.click(await findByLabelText('Next Igbo definition'));
    expect(await findByText('Submit Batch')).toHaveProperty('disabled', true);

    await findByText('second retrieved word');
    userEvent.type(await findByPlaceholderText('Type Igbo definition here'), 'second igbo definition');
    userEvent.click(await findByLabelText('Next Igbo definition'));
    expect(await findByText('Submit Batch')).toHaveProperty('disabled', true);

    await findByText('third retrieved word');
    userEvent.type(await findByPlaceholderText('Type Igbo definition here'), 'third igbo definition');
    userEvent.click(await findByLabelText('Next Igbo definition'));
    expect(await findByText('Submit Batch')).toHaveProperty('disabled', true);

    await findByText('fourth retrieved word');
    userEvent.type(await findByPlaceholderText('Type Igbo definition here'), 'fourth igbo definition');
    userEvent.click(await findByLabelText('Next Igbo definition'));
    expect(await findByText('Submit Batch')).toHaveProperty('disabled', false);

    await findByText('fifth retrieved word');
    userEvent.type(await findByPlaceholderText('Type Igbo definition here'), 'fifth igbo definition');

    userEvent.click(await findByText('Submit Batch'));

    expect(putWordSuggestionsWithoutIgboDefinitions).toBeCalledWith([
      { id: '123', igboDefinition: 'first igbo definition' },
      { id: '234', igboDefinition: 'second igbo definition' },
      { id: '345', igboDefinition: 'third igbo definition' },
      { id: '456', igboDefinition: 'fourth igbo definition' },
      { id: '567', igboDefinition: 'fifth igbo definition' },
    ]);
  });
});
