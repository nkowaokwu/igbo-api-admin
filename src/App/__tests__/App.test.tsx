import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as reactAdmin from 'react-admin';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import App from '../App';

jest.mock('firebase/firestore');
jest.mock('src/shared/DataCollectionAPI');
jest.mock('src/Core/Dashboard/network');

describe('App', () => {
  beforeEach(() => {
    jest.spyOn(reactAdmin, 'usePermissions').mockReturnValue({ role: UserRoles.ADMIN });
  });

  it('render the profile user menu', async () => {
    const { findByLabelText, findByText } = render(<App />);
    userEvent.click(await findByLabelText('Profile'));
    await findByText('Profile');
    await findByText('Contact the team');
    await findByText('Report a bug');
    await findByText('Request a feature');
  });

  it('render the notifications bar', async () => {
    const { findByText, findAllByText } = render(<App />);
    await findAllByText('🔔');
    await findByText('0 new notifications');
    await findByText('No new notifications');
  });
  it('render the Igbo API Editor Platform with admin role', async () => {
    const { queryByText, findByText, findAllByText } = render(<App />);

    await findAllByText('Dashboard');
    await findByText('Words');
    await findByText('Examples');
    await findByText('Nsịbịdị Characters');
    await findByText('Corpora');
    await findByText('Word Suggestions');
    await findByText('Example Suggestions');
    await findByText('Corpus Suggestions');
    await findByText('Constructed Term Polls');
    await findByText('Users');
    await findByText('Data Dump');
    await findByText('Igbo Definitions');
    await findByText('Igbo Text Images');
    await findByText('Upload Igbo Text Images');
    expect(await queryByText('Profile')).toBeNull();

    expect(await queryByText('Loading the page, please wait a moment')).toBeNull();
  });
  it('render the Igbo API Editor Platform with merger role', async () => {
    jest.spyOn(reactAdmin, 'usePermissions').mockReturnValue({ role: UserRoles.MERGER });
    const { queryByText, findByText, findAllByText } = render(<App />);

    await findAllByText('Dashboard');
    await findByText('Words');
    await findByText('Examples');
    await findByText('Nsịbịdị Characters');
    await findByText('Corpora');
    await findByText('Word Suggestions');
    await findByText('Example Suggestions');
    await findByText('Corpus Suggestions');
    await findByText('Constructed Term Polls');
    expect(await queryByText('Users')).toBeNull();
    expect(await queryByText('Data Dump')).toBeNull();
    expect(await queryByText('Igbo Definitions')).toBeNull();
    expect(await queryByText('Profile')).toBeNull();
    expect(queryByText('Igbo Text Images'));
    expect(queryByText('Upload Igbo Text Images'));

    expect(await queryByText('Loading the page, please wait a moment')).toBeNull();
  });

  it('render the Igbo API Editor Platform with editor role', async () => {
    jest.spyOn(reactAdmin, 'usePermissions').mockReturnValue({ role: UserRoles.EDITOR });
    const { queryByText, findByText, findAllByText } = render(<App />);

    await findAllByText('Dashboard');
    await findByText('Words');
    await findByText('Examples');
    await findByText('Nsịbịdị Characters');
    await findByText('Corpora');
    await findByText('Word Suggestions');
    await findByText('Example Suggestions');
    await findByText('Corpus Suggestions');
    await findByText('Constructed Term Polls');
    expect(await queryByText('Users')).toBeNull();
    expect(await queryByText('Data Dump')).toBeNull();
    expect(await queryByText('Igbo Definitions')).toBeNull();
    expect(await queryByText('Profile')).toBeNull();
    expect(queryByText('Igbo Text Images'));
    expect(queryByText('Upload Igbo Text Images'));

    expect(await queryByText('Loading the page, please wait a moment')).toBeNull();
  });

  it('render the Igbo API Editor Platform with transcriber role', async () => {
    jest.spyOn(reactAdmin, 'usePermissions').mockReturnValue({ role: UserRoles.TRANSCRIBER });
    const { queryByText, findAllByText } = render(<App />);

    await findAllByText('Dashboard');
    expect(await queryByText('Words')).toBeNull();
    expect(await queryByText('Examples')).toBeNull();
    expect(await queryByText('Nsịbịdị Characters')).toBeNull();
    expect(await queryByText('Corpora')).toBeNull();
    expect(await queryByText('Word Suggestions')).toBeNull();
    expect(await queryByText('Example Suggestions')).toBeNull();
    expect(await queryByText('Corpus Suggestions')).toBeNull();
    expect(await queryByText('Constructed Term Polls')).toBeNull();
    expect(await queryByText('Users')).toBeNull();
    expect(await queryByText('Data Dump')).toBeNull();
    expect(await queryByText('Igbo Definitions')).toBeNull();
    expect(await queryByText('Profile')).toBeNull();
    expect(queryByText('Igbo Text Images'));
    expect(queryByText('Upload Igbo Text Images'));

    expect(await queryByText('Loading the page, please wait a moment')).toBeNull();
  });
  it('render the Igbo API Editor Platform with editor crowdsourcer', async () => {
    jest.spyOn(reactAdmin, 'usePermissions').mockReturnValue({ role: UserRoles.CROWDSOURCER });
    const { queryByText, findAllByText } = render(<App />);

    await findAllByText('Dashboard');
    expect(await queryByText('Words')).toBeNull();
    expect(await queryByText('Examples')).toBeNull();
    expect(await queryByText('Nsịbịdị Characters')).toBeNull();
    expect(await queryByText('Corpora')).toBeNull();
    expect(await queryByText('Word Suggestions')).toBeNull();
    expect(await queryByText('Example Suggestions')).toBeNull();
    expect(await queryByText('Corpus Suggestions')).toBeNull();
    expect(await queryByText('Constructed Term Polls')).toBeNull();
    expect(await queryByText('Users')).toBeNull();
    expect(await queryByText('Data Dump')).toBeNull();
    expect(await queryByText('Igbo Definitions')).toBeNull();
    expect(await queryByText('Profile')).toBeNull();
    expect(queryByText('Igbo Text Images'));
    expect(queryByText('Upload Igbo Text Images'));

    expect(await queryByText('Loading the page, please wait a moment')).toBeNull();
  });
});
