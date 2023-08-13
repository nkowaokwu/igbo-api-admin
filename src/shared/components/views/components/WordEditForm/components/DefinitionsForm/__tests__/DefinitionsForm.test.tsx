import React from 'react';
import { cloneDeep } from 'lodash';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import { wordRecord } from 'src/__tests__/__mocks__/documentData';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';
import DefinitionsForm from '../DefinitionsForm';

describe('DefinitionsForm', () => {
  it('renders a single definition group', async () => {
    const { findByText } = render(
      <TestContext>
        <DefinitionsForm />
      </TestContext>,
    );
    await findByText('Definition Groups (1)');
    await findByText('Add Definition Group');
    await findByText('Part of Speech');
    await findByText('Active verb');
    await findByText('Nsịbịdị');
    await findByText('first nsibidi');
    await findByText('No Nsịbịdị characters');
    await findByText(wordRecord.definitions[0].definitions[0]);
    await findByText('Add English Definition');
    await findByText('Add Igbo Definition');
  });

  it('renders multiple definition group', async () => {
    const extendWordRecord = cloneDeep(wordRecord);
    extendWordRecord.definitions.push({
      wordClass: WordClassEnum.ADJ,
      definitions: ['second definition'],
      nsibidi: 'second nsibidi',
      nsibidiCharacters: [],
      igboDefinitions: [],
    });
    const { findByText, findAllByText } = render(
      <TestContext record={extendWordRecord} definitions={extendWordRecord.definitions}>
        <DefinitionsForm />
      </TestContext>,
    );
    await findByText('Definition Groups (2)');
    await findAllByText('Add Definition Group');
    await findAllByText('Part of Speech');
    await findAllByText('Nsịbịdị');
    await findAllByText('Add English Definition');
    await findAllByText('No Nsịbịdị characters');
    await findAllByText('Add Igbo Definition');

    // First definition group
    await findByText('Active verb');
    await findByText('first nsibidi');
    await findByText('first definition');
    await findByText(extendWordRecord.definitions[0].definitions[0]);

    // Second definition group
    await findByText('Adjective');
    await findByText('second nsibidi');
    await findByText(extendWordRecord.definitions[1].definitions[0]);
  });

  it('adds an english definition', async () => {
    const { findByText, findByTestId } = render(
      <TestContext>
        <DefinitionsForm />
      </TestContext>,
    );

    fireEvent.click(await findByText('Add English Definition'));
    await findByTestId('nested-definitions-definitions[0].definitions[0]');
    await findByTestId('nested-definitions-definitions[0].definitions[1]');
  });

  it('removes an english definition', async () => {
    const { findByText, findByTestId, queryByTestId } = render(
      <TestContext>
        <DefinitionsForm />
      </TestContext>,
    );

    fireEvent.click(await findByText('Add English Definition'));
    await findByTestId('nested-definitions-definitions[0].definitions[0]');
    await findByTestId('nested-definitions-definitions[0].definitions[1]');
    fireEvent.click(await findByTestId('delete-button-definitions[0].definitions[1]'));

    expect(await queryByTestId('nested-definitions-definitions[0].definitions[1]')).toBeNull();
  });

  it('adds an igbo definition', async () => {
    const { findByText, findByTestId } = render(
      <TestContext>
        <DefinitionsForm />
      </TestContext>,
    );

    fireEvent.click(await findByText('Add Igbo Definition'));
    await findByTestId('nested-definitions-definitions[0].igboDefinitions[0].igbo');
    fireEvent.click(await findByText('Add Igbo Definition'));
    await findByTestId('nested-definitions-definitions[0].igboDefinitions[1].igbo');
  });

  it('removes an igbo definition', async () => {
    const { findByText, findByTestId, queryByTestId } = render(
      <TestContext>
        <DefinitionsForm />
      </TestContext>,
    );

    fireEvent.click(await findByText('Add Igbo Definition'));
    await findByTestId('nested-definitions-definitions[0].igboDefinitions[0].igbo');
    fireEvent.click(await findByTestId('delete-button-definitions[0].igboDefinitions[0]'));

    expect(await queryByTestId('nested-definitions-definitions[0].igboDefinitions[0].igbo')).toBeNull();
  });

  it('create definition group', async () => {
    const { findByText, findAllByText } = render(
      <TestContext>
        <DefinitionsForm />
      </TestContext>,
    );

    fireEvent.click(await findByText('Add Definition Group'));
    await findByText('Definition Groups (2)');
    await findAllByText('Delete Definition Group');
  });

  it('creates and deletes a definition group', async () => {
    const { findByText, findAllByTestId, findByTestId, findAllByText } = render(
      <TestContext>
        <DefinitionsForm />
      </TestContext>,
    );

    fireEvent.click(await findByText('Add Definition Group'));
    await findByText('Definition Groups (2)');
    userEvent.type((await findAllByTestId('definition-group-nsibidi-input'))[1], 'new first nsibidi');
    expect((await findAllByTestId('definition-group-nsibidi-input'))[1].getAttribute('value')).toBe(
      'new first nsibidi',
    );
    fireEvent.click((await findAllByText('Delete Definition Group'))[0]);
    expect(await (await findByTestId('definition-group-nsibidi-input')).getAttribute('value')).toBe(
      'new first nsibidi',
    );
  });
});
