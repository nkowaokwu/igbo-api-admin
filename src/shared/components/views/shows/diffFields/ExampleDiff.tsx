import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import { get } from 'lodash';
import { Record } from 'react-admin';
import ReactAudioPlayer from 'react-audio-player';
import { ExampleClientData } from 'src/backend/controllers/utils/interfaces';
import DiffField from './DiffField';
import ArrayDiff from './ArrayDiff';
import ArrayDiffField from './ArrayDiffField';

const ExampleDiff = ({
  value,
  index,
  diffRecord,
  record,
  resource,
}: {
  value?: ExampleClientData;
  index?: number;
  diffRecord: Record;
  record: Record;
  resource: string;
}): ReactElement => (
  <Box className="flex flex-col space-y-2">
    <Box className="flex flex-col">
      <DiffField
        path={`examples.${index}.nsibidi`}
        diffRecord={diffRecord}
        fallbackValue={value.nsibidi}
        className="akagu"
        fontSize="xs"
      />
      <DiffField
        path={`examples[${index}].source.text`}
        diffRecord={diffRecord}
        fallbackValue={get(value, 'source.text')}
      />
      <DiffField
        path={`examples[${index}].translations.0.text`}
        diffRecord={diffRecord}
        fallbackValue={get(value, 'translations.0.text')}
      />
      <DiffField path={`examples[${index}].meaning`} diffRecord={diffRecord} fallbackValue={get(value, 'meaning')} />
      <ArrayDiffField recordField={`examples[${index}].pronunciations`} record={record}>
        <ArrayDiff
          diffRecord={diffRecord}
          renderNestedObject={(pronunciation) => (
            <ReactAudioPlayer
              data-test="nested-examples-pronunciation"
              src={pronunciation?.audio}
              style={{ height: '40px', width: '250px' }}
              controls
            />
          )}
        />
      </ArrayDiffField>
    </Box>
    <a className="link" href={`#/${resource === 'words' ? 'examples' : 'exampleSuggestions'}/${value.id}/show`}>
      Link to Example
    </a>
  </Box>
);

export default ExampleDiff;
