import React, { ReactElement, useState } from 'react';
import { cloneDeep, noop } from 'lodash';
import { DataProviderContext, Record } from 'react-admin';
import { useForm } from 'react-hook-form';
import { TestContext as ReactAdminTestContext } from 'ra-test';
import { configure } from '@testing-library/react';
// eslint-disable-next-line max-len
import createDefaultWordFormValues from 'src/shared/components/views/components/WordEditForm/utils/createDefaultWordFormValues';
import WordClass from 'src/backend/shared/constants/WordClass';
import Collections from 'src/shared/constants/Collection';
import Views from 'src/shared/constants/Views';
import { DefinitionSchema, ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import { SentenceVerification } from 'src/Core/Collections/IgboSoundbox/types/SoundboxInterfaces';
// eslint-disable-next-line max-len
import createDefaultExampleFormValues from 'src/shared/components/views/components/WordEditForm/utils/createDefaultExampleFormValues';
import { wordFixture } from 'src/__tests__/shared/fixtures';
import { wordRecord } from 'src/__tests__/__mocks__/documentData';
import createDefaultNsibidiCharacterFormValues from 'src/shared/components/views/components/WordEditForm/utils/createDefaultNsibidiCharacterFormValues';

configure({ testIdAttribute: 'data-test' });

const mockGetUserMedia = jest.fn(async () => new Promise<void>((resolve) => resolve()));

export const mocks = {
  Audio: {
    pause: jest.fn(),
    play: jest.fn(),
    addEventListener: jest.fn(),
  },
  clipboard: {
    writeText: jest.fn(),
  },
};
// Audio mock
global.Audio = jest.fn().mockImplementation(() => ({
  pause: mocks.Audio.pause,
  play: mocks.Audio.play,
  addEventListener: mocks.Audio.addEventListener,
}));

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
});
global.navigator.clipboard = {
  writeText: mocks.clipboard.writeText,
};

// IntersectionObserver mock
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

window.scrollTo = noop;

jest.mock('firebase');
jest.mock('firebase/auth');
jest.mock('@chakra-ui/react');
jest.mock('@heartexlabs/label-studio');
jest.mock('react-admin');
jest.mock('mic-recorder-to-mp3');
jest.mock('src/shared/API');
jest.mock('src/shared/DataCollectionAPI');
jest.mock('src/shared/UserAPI');
jest.mock('src/hooks/useRecorder');

const TestContext = ({
  children,
  dataProvider,
  isListView,
  record,
  index,
  basePath = '/',
  resource,
  ...rest
}: {
  view?: Views;
  basePath?: string;
  resource?: Collections;
  save?: () => void;
  children: JSX.Element | JSX.Element[];
  dataProvider?: any;
  isListView?: boolean;
  record?: Record;
  groupIndex?: number;
  index?: number;
  dialects?: any[];
  setDialects?: (value: any) => void;
  pronunciations?: ExampleSuggestion['pronunciations'];
  review?: SentenceVerification;
  definitions?: DefinitionSchema[];
}): ReactElement => {
  const nativeDataProvider = () =>
    Promise.resolve({
      data: {},
    });
  const history = jest.fn(() => ({
    listen: jest.fn(),
  }));

  const staticRecord = cloneDeep(record || wordFixture(wordRecord));

  const { control, watch } = useForm({
    defaultValues:
      resource === Collections.EXAMPLE_SUGGESTIONS
        ? createDefaultExampleFormValues(staticRecord)
        : resource === Collections.NSIBIDI_CHARACTERS
        ? createDefaultNsibidiCharacterFormValues(staticRecord)
        : createDefaultWordFormValues(staticRecord),
    mode: 'onChange',
  });

  const [, setIsDirty] = useState(false);

  return (
    <ReactAdminTestContext {...rest}>
      <DataProviderContext.Provider value={dataProvider || nativeDataProvider}>
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            control,
            errors: {},
            record: staticRecord,
            originalWordRecord: staticRecord,
            getValues: jest.fn(),
            setValue: jest.fn(),
            setDialects: jest.fn(),
            // TODO: useFieldArray for dialects
            dialects: staticRecord.dialects,
            options: Object.entries(WordClass),
            history,
            watch,
            // TODO: useFieldArray for dialects
            index,
            setIsDirty,
            basePath,
            resource,
            ...rest,
            ...child.props,
          }),
        )}
      </DataProviderContext.Provider>
    </ReactAdminTestContext>
  );
};

export default TestContext;
