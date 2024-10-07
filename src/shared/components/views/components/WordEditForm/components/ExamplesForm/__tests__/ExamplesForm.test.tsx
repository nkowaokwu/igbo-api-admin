import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import { exampleSuggestionFixture, wordFixture, wordSuggestionFixture } from 'src/__tests__/shared/fixtures';
import ExamplesForm from '../ExamplesForm';

describe('ExamplesForm', () => {
  it('renders the examples', async () => {
    const testRecord = wordFixture();
    testRecord.examples = [];
    const { findByText } = render(
      <TestContext record={testRecord}>
        <ExamplesForm />
      </TestContext>,
    );

    await findByText('Examples (0)');
    await findByText('No sentences');
    await findByText('Add Example');
    await findByText('Attach Existing Example');
  });

  it('creates a new example', async () => {
    const record = wordFixture({ examples: [exampleSuggestionFixture()] });
    const { findByText, findByTestId, findAllByText, findAllByLabelText } = render(
      <TestContext record={record}>
        <ExamplesForm />
      </TestContext>,
    );

    userEvent.click(await findByText('Add Example'));
    await findByText('Examples (2)');
    await findByTestId('examples-0-igbo-input');
    await findByTestId('examples-0-english-input');
    await findByTestId('examples-0-meaning-input');
    await findByTestId('examples-0-nsibidi-input');
    await findAllByLabelText('Delete');
    await findAllByText('No Nsịbịdị characters');
  });

  it('attaches a new example', async () => {
    const { findByText, findByPlaceholderText } = render(
      <TestContext>
        <ExamplesForm />
      </TestContext>,
    );

    userEvent.click(await findByText('Attach Existing Example'));
    userEvent.type(await findByPlaceholderText('Search example sentence'), 'word');
  });

  it('deletes a new example', async () => {
    const record = wordFixture({ examples: [exampleSuggestionFixture()] });
    const { findByText, findByTestId, findByLabelText, queryByTestId } = render(
      <TestContext record={record}>
        <ExamplesForm />
      </TestContext>,
    );

    await findByText('Examples (1)');
    userEvent.type(await findByTestId('examples-0-igbo-input'), 'igbo input');
    userEvent.type(await findByTestId('examples-0-english-input'), 'english input');
    userEvent.type(await findByTestId('examples-0-meaning-input'), 'meaning input');
    userEvent.type(await findByTestId('examples-0-nsibidi-input'), 'nsibidi input');

    userEvent.click(await findByLabelText('Delete'));

    expect(await queryByTestId('examples-0-igbo-input')).toBeNull();
    expect(await queryByTestId('examples-0-english-input')).toBeNull();
    expect(await queryByTestId('examples-0-meaning-input')).toBeNull();
    expect(await queryByTestId('examples-0-nsibidi-input')).toBeNull();
  });

  it('deletes first example after editing the second', async () => {
    const record = wordSuggestionFixture({ examples: [exampleSuggestionFixture()] });
    const { findByText, findByTestId, findByLabelText, queryByTestId, findAllByLabelText } = render(
      <TestContext record={record}>
        <ExamplesForm />
      </TestContext>,
    );

    userEvent.click(await findByText('Add Example'));
    await findByText('Examples (2)');
    userEvent.type(await findByTestId('examples-0-igbo-input'), 'igbo input');
    userEvent.type(await findByTestId('examples-0-english-input'), 'english input');
    userEvent.type(await findByTestId('examples-0-meaning-input'), 'meaning input');
    userEvent.type(await findByTestId('examples-0-nsibidi-input'), 'nsibidi input');

    userEvent.click(await findByLabelText('Add Example'));
    await findByText('Examples (3)');

    userEvent.type(await findByTestId('examples-1-igbo-input'), 'second igbo input');
    userEvent.type(await findByTestId('examples-1-english-input'), 'second english input');
    userEvent.type(await findByTestId('examples-1-meaning-input'), 'second meaning input');
    userEvent.type(await findByTestId('examples-1-nsibidi-input'), 'second nsibidi input');

    userEvent.click((await findAllByLabelText('Delete'))[0]);

    expect(await queryByTestId('examples-0-igbo-input').getAttribute('value')).toEqual('second igbo input');
    expect(await queryByTestId('examples-0-english-input').getAttribute('value')).toEqual('second english input');
    expect(await queryByTestId('examples-0-meaning-input').getAttribute('value')).toEqual('second meaning input');
    expect(await queryByTestId('examples-0-nsibidi-input').getAttribute('value')).toEqual('second nsibidi input');
  });

  it('renders the archive button for existing Example sentence', async () => {
    const staticWordRecord = wordFixture();
    staticWordRecord.examples = [
      exampleSuggestionFixture({
        originalExampleId: 'original-example-id',
        id: 'example-id',
        nsibidi: 'nsibidi',
        igbo: 'igbo',
        english: 'english',
      }),
    ];

    const { findByText, findAllByLabelText } = render(
      <TestContext record={staticWordRecord}>
        <ExamplesForm />
      </TestContext>,
    );
    userEvent.click((await findAllByLabelText('Archive'))[0]);
    await findByText('Examples (0)');
  });
});
