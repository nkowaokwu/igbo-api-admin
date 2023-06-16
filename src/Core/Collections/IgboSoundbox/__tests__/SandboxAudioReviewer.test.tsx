import React from 'react';
import { render } from '@testing-library/react';
import * as reactAdmin from 'react-admin';
import TestContext from 'src/__tests__/components/TestContext';
import SandboxAudioReviewer from '../SandboxAudioReviewer';

const examplePronunciations = [
  { audio: 'first audio', speaker: 'admin-uid', approvals: [], denials: [], review: true, _id: 'first-id' },
  { audio: 'second audio', speaker: 'merger-uid', approvals: [], denials: [], review: true, _id: 'second-id' },
  { audio: 'third audio', speaker: 'editor-uid', approvals: [], denials: [], review: true, _id: 'third-id' },
];
jest.mock('react-admin');

describe('SandboxAudioReviewer', () => {
  it('render the speaker name for admin', async () => {
    jest
      .spyOn(reactAdmin, 'usePermissions')
      .mockReturnValue({ loading: false, loaded: true, permissions: { role: 'admin' } });
    const mockOnApprove = jest.fn();
    const mockOnDeny = jest.fn();
    const { findByText } = render(
      <TestContext
        pronunciations={examplePronunciations}
        review={{ id: 'example-id', reviews: { 'first-id': null, 'second-id': null, 'third-id': null } }}
        onApprove={mockOnApprove}
        onDeny={mockOnDeny}
      >
        <SandboxAudioReviewer />
      </TestContext>
    );
    await findByText('Admin Account');
    await findByText('Merger Account');
    await findByText('Editor Account');
  });

  it('does not render the speaker name for merger', async () => {
    jest
      .spyOn(reactAdmin, 'usePermissions')
      .mockReturnValue({ loading: false, loaded: true, permissions: { role: 'merger' } });
    const mockOnApprove = jest.fn();
    const mockOnDeny = jest.fn();
    const { queryByText } = render(
      <TestContext
        pronunciations={examplePronunciations}
        review={{ id: 'example-id', reviews: { 'first-id': null, 'second-id': null, 'third-id': null } }}
        onApprove={mockOnApprove}
        onDeny={mockOnDeny}
      >
        <SandboxAudioReviewer />
      </TestContext>
    );
    expect(await queryByText('Admin Account')).toBeNull();
    expect(await queryByText('Merger Account')).toBeNull();
    expect(await queryByText('Editor Account')).toBeNull();
  });

  it('does not render the speaker name for editor', async () => {
    jest
      .spyOn(reactAdmin, 'usePermissions')
      .mockReturnValue({ loading: false, loaded: true, permissions: { role: 'editor' } });
    const mockOnApprove = jest.fn();
    const mockOnDeny = jest.fn();
    const { queryByText } = render(
      <TestContext
        pronunciations={examplePronunciations}
        review={{ id: 'example-id', reviews: { 'first-id': null, 'second-id': null, 'third-id': null } }}
        onApprove={mockOnApprove}
        onDeny={mockOnDeny}
      >
        <SandboxAudioReviewer />
      </TestContext>
    );
    expect(await queryByText('Admin Account')).toBeNull();
    expect(await queryByText('Merger Account')).toBeNull();
    expect(await queryByText('Editor Account')).toBeNull();
  });

  it('does not render the speaker name for transcriber', async () => {
    jest
      .spyOn(reactAdmin, 'usePermissions')
      .mockReturnValue({ loading: false, loaded: true, permissions: { role: 'transcriber' } });
    const mockOnApprove = jest.fn();
    const mockOnDeny = jest.fn();
    const { queryByText } = render(
      <TestContext
        pronunciations={examplePronunciations}
        review={{ id: 'example-id', reviews: { 'first-id': null, 'second-id': null, 'third-id': null } }}
        onApprove={mockOnApprove}
        onDeny={mockOnDeny}
      >
        <SandboxAudioReviewer />
      </TestContext>
    );
    expect(await queryByText('Admin Account')).toBeNull();
    expect(await queryByText('Merger Account')).toBeNull();
    expect(await queryByText('Editor Account')).toBeNull();
  });

  it('does not render the speaker name for crowdsourcer', async () => {
    jest
      .spyOn(reactAdmin, 'usePermissions')
      .mockReturnValue({ loading: false, loaded: true, permissions: { role: 'crowdsourcer' } });
    const mockOnApprove = jest.fn();
    const mockOnDeny = jest.fn();
    const { queryByText } = render(
      <TestContext
        pronunciations={examplePronunciations}
        review={{ id: 'example-id', reviews: { 'first-id': null, 'second-id': null, 'third-id': null } }}
        onApprove={mockOnApprove}
        onDeny={mockOnDeny}
      >
        <SandboxAudioReviewer />
      </TestContext>
    );
    expect(await queryByText('Admin Account')).toBeNull();
    expect(await queryByText('Merger Account')).toBeNull();
    expect(await queryByText('Editor Account')).toBeNull();
  });
});
