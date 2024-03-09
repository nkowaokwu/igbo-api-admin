import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import WordPanel from 'src/shared/components/WordPanel';
import { definitionFixture, dialectFixture, exampleFixture, wordFixture } from 'src/__tests__/shared/fixtures';
import WordTagEnum from 'src/backend/shared/constants/WordTagEnum';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';
import { ExampleData } from 'src/backend/controllers/utils/interfaces';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';

describe('WordPanel', () => {
  it('render WordPanel with correct information', async () => {
    const record = wordFixture({
      word: 'Igbo word',
      definitions: [definitionFixture({ wordClass: WordClassEnum.NNC, definitions: ['first definition'] })],
      id: 'custom-id',
      tags: [WordTagEnum.LANGUAGE, WordTagEnum.ARTS],
      // @ts-expect-error ExampleData
      examples: [exampleFixture({ igbo: 'first example igbo', english: 'first example english' })] as ExampleData[],
      dialects: [dialectFixture({ word: 'dialectal word', dialects: [DialectEnum.ACH, DialectEnum.ANA] })],
    });
    const { findByText, findAllByText } = render(
      <TestContext>
        <WordPanel record={record} />
      </TestContext>,
    );

    await findByText('Word Quick View');
    await findByText('Id: custom-id');
    await findByText('Document author:');
    await findByText('Word');
    await findByText('Igbo word');
    await findByText('Definition Groups');
    await findByText('Part of Speech');
    await findByText('Noun');
    await findByText('Nsịbịdị');
    await findAllByText('No Nsịbịdị');
    await findByText('Definitions');
    await findByText('first definition');
    await findByText('Spelling Variations');
    await findByText('No variations');
    await findByText('Related Terms');
    await findByText('Tags');
    await findByText('Language');
    await findByText('Arts');
    await findByText('Word Frequency');
    await findByText('Examples');
    await findByText('first example igbo');
    await findByText('first example english');
    await findByText('Dialectal Variations');
    await findByText('dialectal word');
    await findByText('Achala, Anam');
  });
});
