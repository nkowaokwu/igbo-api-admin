import React from 'react';
import * as reactAdmin from 'react-admin';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    await findByText('18');
    await findByText('Abịrịba');
    await findByText('Female');
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
    await findByText('18');
    await findByText('Abịrịba');
    await findByText('Female');
  });
  it('render Profile edit button', async () => {
    const { findByText } = render(
      <TestContext>
        <Profile />
      </TestContext>,
    );

    userEvent.click(await findByText('Edit'));
    await findByText('Save');
    await findByText('Cancel');
  });

  it('cancel the Profile edits', async () => {
    const { queryByText, findByText } = render(
      <TestContext>
        <Profile />
      </TestContext>,
    );

    userEvent.click(await findByText('Edit'));
    await findByText('Save');
    userEvent.click(await findByText('Cancel'));
    await findByText('Edit');
    expect(queryByText('Save')).toBeNull();
  });
});
