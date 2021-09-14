import React, { ReactElement } from 'react';
import { Record } from 'react-admin';
import {
  Box,
  Text,
  Heading,
  Tooltip,
  Link,
} from '@chakra-ui/react';
import moment from 'moment';
import Dialects from '../../backend/shared/constants/Dialects';
import WordClass from '../../backend/shared/constants/WordClass';
import AudioRecordingPreview from './AudioRecordingPreview';
import StandardIgboPreview from './StandardIgboPreview';
import * as Interfaces from '../../backend/controllers/utils/interfaces';

const WordPanel = ({ record }: { record?: Record }): ReactElement => {
  const dialectValues: { [key: string]: Interfaces.WordDialect }[] = Object.values(record.dialects);

  return (
    <Box className="space-y-3 py-3">
      <Box>
        <Heading fontSize="2xl">Word Quick View</Heading>
        <Text className="italic text-gray-600">Word document details</Text>
        <Text>{`Id: ${record.id}`}</Text>
        <Tooltip label={moment(record.updatedOn).format('MMMM Do YYYY, h:mm:ss a')} aria-label="A tooltip">
          <Box className="flex flex-row space-x-2">
            <Text>Last updated:</Text>
            <Text className="font-bold">{moment(record.updatedOn).fromNow()}</Text>
          </Box>
        </Tooltip>
        <Box className="flex flex-row space-x-2 items-center">
          <Text>Document author:</Text>
          <Text className="text-xl text-gray-800">
            <Link
              textDecoration="underline"
              color="blue.500"
              className="font-bold text-sm"
              href={`mailto:${record.author?.email || ''}`}
            >
              {record.author?.displayName || 'Nameless editor'}
            </Link>
          </Text>
        </Box>
      </Box>
      <Box style={{ width: 200 }} className="flex flex-row justify-start items-start">
        <AudioRecordingPreview record={record} />
        <StandardIgboPreview record={record} />
      </Box>
      <Box className="flex flex-row space-x-3">
        <Box>
          <Text fontSize="xl" className="font-bold">Word</Text>
          <Text>{record.word}</Text>
        </Box>
        <Box>
          <Text fontSize="xl" className="font-bold">Part of Speech</Text>
          <Text>{WordClass[record.wordClass].label}</Text>
        </Box>
      </Box>
      <Box>
        <Text fontSize="xl" className="font-bold">Definitions</Text>
        {record.definitions.length ? record.definitions.map((definition, index) => (
          <Box key={definition} className="flex flex-row space-x-1">
            <Text className="font-bold text-gray-600">{`${index + 1}.`}</Text>
            <Text>{definition}</Text>
          </Box>
        )) : <Text className="text-gray-500 italic">No definitions</Text>}
      </Box>
      <Box>
        <Box className="mb-3">
          <Text fontSize="xl" className="font-bold">Present Dialectal Variations</Text>
          <Text className="italic text-gray-600">Associated dialects that have been filled in by editors</Text>
        </Box>
        <Box className="grid grid-flow-row grid-cols-1 lg:grid-cols-3 gap-4">
          {dialectValues.find(({ word }) => word) ? (
            dialectValues.map(({ dialect, word }) => (
              word ? (
                <Box key={`${dialect}`}>
                  <Text fontSize="lg" className="font-bold">{Dialects[`${dialect}`].label}</Text>
                  <Text>{word}</Text>
                </Box>
              ) : null
            ))
          ) : <Text className="text-gray-500 italic">No dialects completed</Text>}
        </Box>
      </Box>
    </Box>
  );
};

WordPanel.defaultProps = {
  record: { id: '' },
};

export default WordPanel;
