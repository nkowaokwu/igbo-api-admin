import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import WordTags from 'src/backend/shared/constants/WordTags';
import WordTagEnum from 'src/backend/shared/constants/WordTagEnum';
import TagsForm from '../TagsForm';

describe('TagsForm', () => {
  it('renders the tags', async () => {
    const { findByText, findByTestId, getByText } = render(
      <TestContext groupIndex={0}>
        <TagsForm />
      </TestContext>,
    );
    await findByText('Tags');
    const tagsSelect = await findByTestId('tags-input-container');
    fireEvent.keyDown(tagsSelect.firstChild, { key: 'ArrowDown' });
    Object.values(WordTags).forEach(({ label }) => {
      getByText(label);
    });
  });

  it('selects a tag', async () => {
    const { findByText, queryByText, findByTestId, getByText } = render(
      <TestContext groupIndex={0}>
        <TagsForm />
      </TestContext>,
    );
    await findByText('Tags');
    const tagsSelect = await findByTestId('tags-input-container');
    fireEvent.keyDown(tagsSelect.firstChild, { key: 'ArrowDown' });
    Object.values(WordTags).forEach(({ label }) => {
      getByText(label);
    });
    userEvent.click(await findByText('Commerce'));
    await findByText('Commerce');
    Object.values(WordTags).forEach(({ label }) => {
      if (label !== WordTags[WordTagEnum.COMMERCE].label) {
        expect(queryByText(label)).toBeNull();
      } else {
        getByText(label);
      }
    });
  });
});
