import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import * as PlatformAPI from 'src/shared/PlatformAPI';
import LoginStats from '../LoginStats';

describe('LoginStat', () => {
  it('renders the login stats', async () => {
    jest
      .spyOn(PlatformAPI, 'getPlatformStats')
      .mockReturnValue(Promise.resolve({ data: { volunteers: 1, hours: 100 } }));
    const { findByText } = render(
      <TestContext>
        <LoginStats />
      </TestContext>,
    );

    await findByText('100');
    await findByText('Hours of Igbo Audio');
    await findByText('1');
    await findByText('Active Volunteers');
  });

  it('throws an error loading login stats', async () => {
    jest.spyOn(PlatformAPI, 'getPlatformStats').mockReturnValue(Promise.reject(new Error('Unable to fetch stats')));
    const { queryByText } = render(
      <TestContext>
        <LoginStats />
      </TestContext>,
    );

    expect(await queryByText('Hours ofIgbo Audio')).toBeNull();
    expect(await queryByText('Active Volunteers')).toBeNull();
  });
});
