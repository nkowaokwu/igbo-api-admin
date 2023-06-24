import React from 'react';
import * as reactAdmin from 'react-admin';
import { render } from '@testing-library/react';
import Profile from 'src/Core/Profile/Profile';
import TestContext from 'src/__tests__/components/TestContext';

jest.mock('src/shared/DataCollectionAPI');
jest.mock('src/Core/Dashboard/network');

describe('Profile', () => {
  it('render Profile as admin', async () => {
    jest
      .spyOn(reactAdmin, 'usePermissions')
      .mockReturnValue({ loading: false, loaded: true, permissions: { role: 'admin' } });
    const { findByText } = render(
      <TestContext>
        <Profile />
      </TestContext>,
    );
    await findByText('Back');
    await findByText('Personal Contributions');
    await findByText('Recorded example sentences');
    await findByText('Verified example sentences');
  });
  it('render Profile as crowdsourcer', async () => {
    jest
      .spyOn(reactAdmin, 'usePermissions')
      .mockReturnValue({ loading: false, loaded: true, permissions: { role: 'crowdsourcer' } });
    const { queryByText, findByText } = render(
      <TestContext>
        <Profile />
      </TestContext>,
    );
    await findByText('Back');
    expect(await queryByText('Personal Contributions')).toBeNull();
    await findByText('Recorded example sentences');
    await findByText('Verified example sentences');
  });
});
