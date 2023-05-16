import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import WordTags from 'src/backend/shared/constants/WordTags';
import TagsForm from '../TagsForm';

describe('TagsForm', () => {
  it('renders the tags', async () => {
    const { findByText, findByTestId } = render(
      <TestContext groupIndex={0}>
        <TagsForm />
      </TestContext>,
    );
    await findByText('Tags');
    const tagsSelect = await findByTestId('tags-input-container');
    fireEvent.keyDown(tagsSelect.firstChild, { key: 'ArrowDown' });
    await Promise.all(Object.values(WordTags).map(async ({ label }) => {
      await findByText(label);
    }));
  });

  it('selects a tag', async () => {
    const { findByText, queryByText, findByTestId } = render(
      <TestContext groupIndex={0}>
        <TagsForm />
      </TestContext>,
    );
    await findByText('Tags');
    const tagsSelect = await findByTestId('tags-input-container');
    fireEvent.keyDown(tagsSelect.firstChild, { key: 'ArrowDown' });
    await Promise.all(Object.values(WordTags).map(async ({ label }) => {
      await findByText(label);
    }));
    userEvent.click(await findByText('Commerce'));
    await findByText('Commerce');
    await Promise.all(Object.values(WordTags).map(async ({ label }) => {
      if (label !== WordTags.COMMERCE.label) {
        expect(await queryByText(label)).toBeNull();
      } else {
        await findByText(label);
      }
    }));
  });
});
