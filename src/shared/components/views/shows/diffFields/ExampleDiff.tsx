import React, { ReactElement } from 'react';
import { Box, chakra } from '@chakra-ui/react';
import { Record } from 'react-admin';
import ReactAudioPlayer from 'react-audio-player';
import { ExampleClientData } from 'src/backend/controllers/utils/interfaces';
import DiffField from './DiffField';

const ExampleDiff = ({
  value,
  index,
  diffRecord,
  resource,
} : {
  value?: ExampleClientData,
  index?: number,
  diffRecord: Record,
  resource: string,
}): ReactElement => (
  <Box className="flex flex-col space-y-2">
    <Box className="flex flex-col">
      <DiffField
        path={`examples.${index}.igbo`}
        diffRecord={diffRecord}
        fallbackValue={value.igbo}
      />
      <DiffField
        path={`examples.${index}.english`}
        diffRecord={diffRecord}
        fallbackValue={value.english}
      />
      <DiffField
        path={`examples.${index}.meaning`}
        diffRecord={diffRecord}
        fallbackValue={value.meaning}
      />
      <DiffField
        path={`examples.${index}.nsibidi`}
        diffRecord={diffRecord}
        fallbackValue={value.nsibidi}
        renderNestedObject={(value) => <chakra.span className="akagu">{value}</chakra.span>}
      />
      <ReactAudioPlayer
        src={value.pronunciation}
        style={{ height: '40px', width: '250px' }}
        controls
      />
    </Box>
    <a
      className="link"
      href={`#/${resource === 'words' ? 'examples' : 'exampleSuggestions'}/${value.id}/show`}
    >
      Link to Example
    </a>
  </Box>
);

export default ExampleDiff;
