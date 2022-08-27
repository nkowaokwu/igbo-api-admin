import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Record } from 'react-admin';
import {
  Box,
  Text,
  Heading,
  Tooltip,
  Link,
} from '@chakra-ui/react';
import moment from 'moment';
import WordClass from 'src/backend/shared/constants/WordClass';
import Dialects from 'src/backend/shared/constants/Dialects';
import WordTags from 'src/backend/shared/constants/WordTags';
import AudioRecordingPreview from './AudioRecordingPreview';
import StandardIgboPreview from './StandardIgboPreview';

const WordPanel = ({ record }: { record?: Record }): ReactElement => (
  <Box className="space-y-3 py-3">
    <Box>
      <Heading fontSize="2xl">Word Quick View</Heading>
      <Text>{`Id: ${get(record, 'id')}`}</Text>
      <Tooltip label={moment(record.updatedAt).format('MMMM Do YYYY, h:mm:ss a')} aria-label="A tooltip">
        <Box className="flex flex-row space-x-2">
          <Text>Last updated:</Text>
          <Text className="font-bold">{moment(get(record, 'updatedAt')).fromNow()}</Text>
        </Box>
      </Tooltip>
      <Box className="flex flex-row space-x-2 items-center">
        <Text>Document author:</Text>
        <Text className="text-xl text-gray-800">
          <Link
            textDecoration="underline"
            color="blue.500"
            className="font-bold text-sm"
            href={`mailto:${get(record, 'author.email') || ''}`}
          >
            {get(record, 'author.displayName') || 'Nameless editor'}
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
        <Text>{get(record, 'word')}</Text>
      </Box>
      <Box>
        <Text fontSize="xl" className="font-bold">Nsịbịdị</Text>
        <Text
          className={record.nsibidi ? 'akagu text-green-800' : 'italic text-gray-600'}
        >
          {get(record, 'nsibidi') || 'No Nsịbịdị'}
        </Text>
      </Box>
      <Box>
        <Text fontSize="xl" className="font-bold">Part of Speech</Text>
        <Text>{get(WordClass[record.wordClass], 'label')}</Text>
      </Box>
    </Box>
    <Box className="flex flex-row items-start space-x-8">
      <Box className="space-y-2">
        <Box>
          <Text fontSize="lg" className="font-bold">Definitions</Text>
          {get(record, 'definitions.length') ? record.definitions.map((definition, index) => (
            <Box key={definition} className="flex flex-row space-x-1">
              <Text className="font-bold text-gray-600">{`${index + 1}.`}</Text>
              <Text>{definition}</Text>
            </Box>
          )) : <Text className="text-gray-500 italic">No definitions</Text>}
        </Box>
        <Box>
          <Text fontSize="lg" className="font-bold">Spelling Variations</Text>
          {get(record, 'variations.length') ? record.variations.map((variation, index) => (
            <Box key={variation} className="flex flex-row space-x-1">
              <Text className="font-bold text-gray-600">{`${index + 1}.`}</Text>
              <Text>{variation}</Text>
            </Box>
          )) : <Text className="text-gray-500 italic">No variations</Text>}
        </Box>
        <Box>
          <Text fontSize="lg" className="font-bold">Related Terms</Text>
          {get(record, 'relatedTerms.length') ? record.relatedTerms.map((relatedTerm, index) => (
            <Box key={relatedTerm} className="flex flex-row space-x-1">
              <Text className="font-bold text-gray-600">{`${index + 1}.`}</Text>
              <Text>{relatedTerm}</Text>
            </Box>
          )) : <Text className="text-gray-500 italic">No related terms</Text>}
        </Box>
        <Box>
          <Text fontSize="lg" className="font-bold">Tags</Text>
          {get(record, 'tags.length') ? record.tags.map((tag, index) => (
            <Box key={tag} className="flex flex-row space-x-1">
              <Text className="font-bold text-gray-600">{`${index + 1}.`}</Text>
              <Text>{get(WordTags[tag.toUpperCase()], 'label')}</Text>
            </Box>
          )) : <Text className="text-gray-500 italic">No tags</Text>}
        </Box>
      </Box>
      <Box>
        <Box>
          <Text fontSize="lg" className="font-bold">Dialectal Variations</Text>
          {Object.entries(get(record, 'dialects') || {}).length ? (
            // @ts-expect-error
            Object.entries(record.dialects).map(([dialect, { dialects }], index) => (
              <Box className="space-y-1">
                <Box key={dialect} className="flex flex-row space-x-1">
                  <Text className="font-bold text-gray-600">{`${index + 1}.`}</Text>
                  <Text>{dialect}</Text>
                </Box>
                <AudioRecordingPreview record={record} audioPath={`dialects.${dialect}.pronunciation`} />
                <Text>
                  {dialects.map((regionalDialect) => (
                    get(Dialects[regionalDialect], 'label')
                  )).join(', ')}
                </Text>
              </Box>
            ))) : <Text className="text-gray-500 italic">No dialects</Text>}
        </Box>
      </Box>
    </Box>
    <Box>
      <Text fontSize="lg" className="font-bold">Examples</Text>
      <Box className="space-y-2">
        {get(record, 'examples.length') ? record.examples.map((example, index) => {
          const { igbo, english } = example;
          return (
            <>
              <Box className="flex flex-row items-center space-x-2">
                <Text className="font-bold text-gray-600">{`${index + 1}.`}</Text>
                <Box>
                  <Text>{igbo}</Text>
                  <Text className="italic text-gray-600">{english}</Text>
                </Box>
              </Box>
              <AudioRecordingPreview record={example} />
            </>
          );
        }) : <Text className="text-gray-500 italic">No examples</Text>}
      </Box>
    </Box>
  </Box>
);
WordPanel.defaultProps = {
  record: { id: '' },
};

export default WordPanel;
