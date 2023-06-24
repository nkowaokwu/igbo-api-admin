import React from 'react';
import { render } from '@testing-library/react';
import StatBody from 'src/Core/Dashboard/components/LinearProgressCard/StatBody';
import TestContext from 'src/__tests__/components/TestContext';

describe('StatBody', () => {
  it('render StatBody', async () => {
    const { findByText, findByTestId } = render(
      <TestContext totalCount={10} goal={20} heading="Heading" description="Description">
        <StatBody />
      </TestContext>,
    );
    await findByText('Heading');
    await findByText('10 / 20');
    await findByTestId('linear-progress-bar');
  });

  it('render StatBody as generic', async () => {
    const { queryByText, findByText, queryByTestId } = render(
      <TestContext totalCount={10} goal={20} heading="Heading" description="Description" isGeneric>
        <StatBody />
      </TestContext>,
    );
    await findByText('Heading');
    await findByText('10');
    expect(await queryByText('10 / 20')).toBeNull();
    expect(await queryByTestId('linear-progress-bar')).toBeNull();
  });
});
