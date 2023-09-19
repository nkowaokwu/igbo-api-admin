import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import NsibidiCharacterAttributeEnum from 'src/backend/shared/constants/NsibidiCharacterAttributeEnum';
import Collection from 'src/shared/constants/Collection';
import NsibidiCharacterShow from '../NsibidiCharacterShow';

const record = {
  id: 'testing',
  attributes: {
    [NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS]: true,
  },
  nsibidi: 'n',
};

const dataProvider = {
  getOne: () =>
    Promise.resolve({
      data: record,
    }),
};

describe('NsibidiCharacterShow', () => {
  beforeEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
    dataProvider.getOne = () =>
      Promise.resolve({
        data: record,
      });
  });
  it('renders the legacy characters', async () => {
    const { findByText, findAllByText } = render(
      <TestContext
        enableReducers
        initialState={{ admin: { resources: { nsibidiCharacters: { data: {} } } } }}
        dataProvider={dataProvider}
      >
        <NsibidiCharacterShow basePath="/" id={record.id} resource={Collection.NSIBIDI_CHARACTERS} />
      </TestContext>,
    );
    await findByText('Nsịbịdị Character Attributes');
    await findByText('Has Legacy Characters');
    await findByText('Legacy characters');
    await findAllByText(record.nsibidi);
  });

  it('does not render the legacy characters', async () => {
    const updatedRecord = {
      id: 'testing',
      attributes: {
        [NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS]: false,
      },
      nsibidi: 'n',
    };
    dataProvider.getOne = () =>
      Promise.resolve({
        data: updatedRecord,
      });
    const { queryByText, findByText } = render(
      <TestContext
        enableReducers
        initialState={{ admin: { resources: { nsibidiCharacters: { data: {} } } } }}
        dataProvider={dataProvider}
      >
        <NsibidiCharacterShow basePath="/" id={record.id} resource={Collection.NSIBIDI_CHARACTERS} />
      </TestContext>,
    );
    await findByText('Nsịbịdị Character Attributes');
    await findByText('Has Legacy Characters');
    expect(queryByText('Legacy characters')).toBeNull();
  });
});
