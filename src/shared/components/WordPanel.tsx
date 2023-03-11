import React, { ReactElement } from 'react';
import { get } from 'lodash';
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
import ResolvedWord from 'src/shared/components/ResolvedWord/ResolvedWord';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import AudioRecordingPreview from './AudioRecordingPreview';
import StandardIgboPreview from './StandardIgboPreview';
import ConstructedTermPreview from './ConstructedTermPreview';
import isResourceSuggestion from '../utils/isResourceSuggestion';
import Collections from '../constants/Collections';

const WordPanel = ({ record, resource }: { record?: Interfaces.Word, resource: Collections }): ReactElement => {
  const isSuggestion = resource === Collections.WORD_SUGGESTIONS;
  return (
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
          {isSuggestion ? <Text>Document author:</Text> : null}
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
      <Box style={{ width: 200 }} className="flex flex-row justify-start items-start space-x-3">
        <AudioRecordingPreview record={record} />
        <StandardIgboPreview record={record} />
        <ConstructedTermPreview record={record} />
      </Box>
      <Box className="flex flex-row space-x-3">
        <Box>
          <Text fontSize="xl" className="font-bold">Word</Text>
          <Text>{get(record, 'word')}</Text>
        </Box>
      </Box>
      <Box className="flex flex-row items-start space-x-8">
        <Box className="space-y-2">
          <Box>
            <Text fontSize="xl" className="font-bold">Definition Groups</Text>
            <Box>
              {(get(record, 'definitions') || []).map(({
                wordClass,
                definitions,
                nsibidi,
                id = '',
              }) => (
                <Box key={id}>
                  <Box className="flex flex-row space-x-3 items-start">
                    <Box>
                      <Text fontSize="lg" className="font-bold">Part of Speech</Text>
                      <Text>{get(WordClass[wordClass], 'label')}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="lg" className="font-bold">Nsịbịdị</Text>
                      <Tooltip label={nsibidi}>
                        <Text
                          className={`${nsibidi ? 'akagu' : 'italic text-gray-600'} cursor-default`}
                        >
                          {nsibidi || 'No Nsịbịdị'}
                        </Text>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Text fontSize="lg" className="font-bold">Definitions</Text>
                  {definitions?.length ? definitions.map((definition, index) => (
                    <Box key={definition} className="flex flex-row space-x-1">
                      <Text className="font-bold text-gray-600">{`${index + 1}.`}</Text>
                      <Text>{definition}</Text>
                    </Box>
                  )) : <Text className="text-gray-500 italic">No definitions</Text>}
                </Box>
              ))}
            </Box>
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
                <ResolvedWord wordId={relatedTerm} isSuggestion={isResourceSuggestion(resource)} />
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
            {(get(record, 'dialects') || []).length ? (
              get(record, 'dialects').map(({ word, dialects, _id }, index) => (
                <Box key={_id?.toString?.()} className="space-y-1">
                  <Box className="flex flex-row space-x-1">
                    <Text className="font-bold text-gray-600">{`${index + 1}.`}</Text>
                    <Text>{word}</Text>
                  </Box>
                  <AudioRecordingPreview record={record} audioPath={`dialects.${index}.pronunciation`} />
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
            const { igbo, english, nsibidi } = example;
            return (
              <>
                <Box className="flex flex-row items-center space-x-2">
                  <Text className="font-bold text-gray-600">{`${index + 1}.`}</Text>
                  <Box>
                    <Text>{igbo}</Text>
                    <Text className="italic text-gray-600">{english}</Text>
                    <Text className={nsibidi ? 'akagu' : 'italic text-gray-600'}>{nsibidi || 'No Nsịbịdị'}</Text>
                  </Box>
                </Box>
                {example.pronunciations.map(({ audio }, index) => (
                  <Box className="flex flex-row space-x-2">
                    {example.pronunciations.length > 1 ? <Text>{`${index + 1}.`}</Text> : null}
                    <AudioRecordingPreview record={{ pronunciation: audio }} />
                  </Box>
                ))}
              </>
            );
          }) : <Text className="text-gray-500 italic">No examples</Text>}
        </Box>
      </Box>
    </Box>
  );
};

WordPanel.defaultProps = {
  record: { id: '' },
};

export default WordPanel;
