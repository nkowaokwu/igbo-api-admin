// Testing react-select dropdown: https://stackoverflow.com/a/61551935
import React from 'react';
import { noop } from 'lodash';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import FilePicker from '../FilePicker';

describe('FilePicker', () => {
  it('render single file upload', async () => {
    const { findByText, queryByText, findByTestId } = render(
      <TestContext>
        <FilePicker type="image" onFileSelect={noop} />
      </TestContext>,
    );

    await findByText(/Drag & Drop or/);
    expect(queryByText(/You can upload/)).toBeNull();
    expect((await findByTestId('file-picker-input')).hasAttribute('multiple')).toBeFalsy();
  });

  it('render multiple files upload', async () => {
    const { findByText, findByTestId } = render(
      <TestContext>
        <FilePicker type="image" onFileSelect={noop} multiple />
      </TestContext>,
    );

    await findByText(/Drag & Drop or/);
    await findByText(/You can upload/);
    expect((await findByTestId('file-picker-input')).hasAttribute('multiple')).toBeTruthy();
  });

  it('accept type is image', async () => {
    const { findByTestId } = render(
      <TestContext>
        <FilePicker type="image" onFileSelect={noop} multiple />
      </TestContext>,
    );

    expect((await findByTestId('file-picker-input')).getAttribute('accept')).toEqual('image/*');
  });

  it('accept type is media', async () => {
    const { findByTestId } = render(
      <TestContext>
        <FilePicker onFileSelect={noop} multiple type="media" />
      </TestContext>,
    );

    expect((await findByTestId('file-picker-input')).getAttribute('accept')).toEqual('video/*,audio/*');
  });
});
