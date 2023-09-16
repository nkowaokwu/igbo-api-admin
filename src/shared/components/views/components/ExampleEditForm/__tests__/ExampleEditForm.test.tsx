import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { last } from 'lodash';
import TestContext from 'src/__tests__/components/TestContext';
import Collections from 'src/shared/constants/Collection';
import Views from 'src/shared/constants/Views';
import ExampleEditForm from '../ExampleEditForm';

describe('Example Edit', () => {
  beforeEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  });
  it('render example edit form', async () => {
    const { findByText } = render(
      <TestContext
        view={Views.EDIT}
        resource={Collections.EXAMPLE_SUGGESTIONS}
        record={{ id: '123', originalExampleId: '456' }}
      >
        <ExampleEditForm />
      </TestContext>,
    );
    await findByText('Parent Example Id:');
    await findByText('Igbo');
    await findByText('English');
    await findByText('Nsịbịdị');
    await findByText('Associated Words');
    await findByText("Editor's Comments");
  });

  it('add an associated word to word suggestion', async () => {
    const { findByText, findAllByText, findByPlaceholderText } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS} save={() => {}}>
        <ExampleEditForm />
      </TestContext>,
    );

    userEvent.type(await findByPlaceholderText('Search for associated word or use word id'), 'cat');
    await findAllByText('retrieved word');
    await findAllByText('NNC');
    await findAllByText('first definition');
    userEvent.click(last(await findAllByText('retrieved word')));
    await findByText('ADJ');
    await findByText('resolved word definition');
  });

  it.skip('submit example suggestions', async () => {
    const mockSave = jest.fn();
    const { findByText, findByTestId } = render(
      <TestContext
        view={Views.EDIT}
        resource={Collections.WORD_SUGGESTIONS}
        record={{ id: '123', associatedDefinitionsSchemas: [null] }}
        save={mockSave}
      >
        <ExampleEditForm />
      </TestContext>,
    );
    userEvent.type(await findByText('Igbo'), 'updated igbo');
    userEvent.type(await findByText('English'), 'updated english');
    fireEvent.submit(await findByTestId('example-submit-button'));
    expect(mockHandleSubmit).toBeCalled();
    expect(mockSave).toBeCalled();
  });
});
