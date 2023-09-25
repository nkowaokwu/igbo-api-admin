import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import { exampleData } from 'src/__tests__/__mocks__/documentData';
import ExampleResult from '../ExampleResult';

const result = exampleData;

describe('ExampleResult', () => {
  it('render the example results', async () => {
    const { findByText } = render(
      <TestContext>
        <ExampleResult result={result} />
      </TestContext>,
    );

    await findByText(result.igbo);
    await findByText(result.english);
  });
});
