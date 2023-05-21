import React, { ReactElement, useState, useEffect } from 'react';
import { get } from 'lodash';
import { ShowProps, useShowController } from 'react-admin';
import {
  Box,
  Heading,
  Skeleton,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import diff from 'deep-diff';
import ReactAudioPlayer from 'react-audio-player';
import { DEFAULT_WORD_RECORD } from 'src/shared/constants';
import View from 'src/shared/constants/Views';
import Collection from 'src/shared/constants/Collections';
import WordClass from 'src/backend/shared/constants/WordClass';
import { getWord } from 'src/shared/API';
import CompleteWordPreview from 'src/shared/components/CompleteWordPreview';
import ResolvedWord from 'src/shared/components/ResolvedWord';
import ResolvedNsibidiCharacter from 'src/shared/components/ResolvedNsibidiCharacter';
import SourceField from 'src/shared/components/SourceField';
import generateFlags from 'src/shared/utils/flagHeadword';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import isVerb from 'src/backend/shared/utils/isVerb';
import {
  EditDocumentTopBar,
  ShowDocumentStats,
  EditDocumentIds,
  Comments,
} from '../../components';
import { determineDate } from '../utils';
import DialectDiff from '../diffFields/DialectDiff';
import DiffField from '../diffFields/DiffField';
import ArrayDiffField from '../diffFields/ArrayDiffField';
import ExampleDiff from '../diffFields/ExampleDiff';
import ArrayDiff from '../diffFields/ArrayDiff';
import TenseDiff from '../diffFields/TenseDiff';
import Attributes from './Attributes';

const DIFF_FILTER_KEYS = [
  'id',
  'approvals',
  'denials',
  'merged',
  'author',
  'authorId',
  'authorEmail',
  'userComments',
  'editorsNotes',
  'originalWordId',
  'id',
  'updatedAt',
  'stems',
  'normalized',
  'mergedBy',
  'createdAt',
  'updatedAt',
  'cachedAt',
  'twitterPollId',
  'userInteractions',
  'exampleForSuggestion',
];

const WordShow = (props: ShowProps): ReactElement => {
  const [isLoading, setIsLoading] = useState(true);
  const [originalWordRecord, setOriginalWordRecord] = useState<Interfaces.Word | null>({});
  const [diffRecord, setDiffRecord] = useState(null);
  const showProps = useShowController(props);
  const { resource } = showProps;
  // @ts-expect-error
  let { record } : { record: Interfaces.Word } = showProps;
  const { permissions } = props;
  const hasFlags = !!Object.values(generateFlags({ word: record || {}, flags: {} }).flags).length;

  record = record || DEFAULT_WORD_RECORD;

  // Order both record and originalWordRecord examples to avoid unnecessary diffs
  record.examples.sort((prev, next) => prev.igbo.localeCompare(next.igbo));

  const {
    id,
    author,
    word,
    approvals,
    denials,
    editorsNotes,
    userComments,
    merged,
    pronunciation,
    originalWordId,
    updatedAt,
    wordPronunciation,
    conceptualWord,
    examples: rawExamples,
  } = record;

  const examples = rawExamples.filter(({ archived = false }) => !archived);
  const archivedExamples = rawExamples.filter(({ archived = false }) => archived);

  const resourceTitle = {
    wordSuggestions: 'Word Suggestion',
    words: 'Word',
  };

  /* Grabs the original word if it exists */
  useEffect(() => {
    (async () => {
      try {
        const originalWord: Interfaces.Word | null = (
          record?.originalWordId ? await getWord(record.originalWordId).catch((err) => {
          // Unable to retrieve word
            console.log(err);
          }) : null
        );
        if (originalWord) {
          originalWord.examples.sort((prev, next) => prev.igbo.localeCompare(next.igbo));
        }
        if (record) {
          record.examples.sort((prev, next) => prev.igbo.localeCompare(next.igbo));
        }
        const differenceRecord = diff(originalWord, record, (_, key) => DIFF_FILTER_KEYS.indexOf(key) > -1);
        setOriginalWordRecord(originalWord);
        setDiffRecord(differenceRecord);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [record]);

  return (
    <Skeleton isLoaded={!isLoading}>
      <Box className="bg-white shadow-sm p-10 mt-10">
        <EditDocumentTopBar
          record={record}
          resource={resource}
          view={View.SHOW}
          id={id}
          permissions={permissions}
          title={`${resourceTitle[resource]} Document Details`}
        />
        <Box className="flex flex-col lg:flex-row mb-1">
          <Box className="flex flex-col flex-auto justify-start items-start">
            <Box className="w-full flex flex-col lg:flex-row justify-between items-center">
              <Box>
                <Heading fontSize="lg" className="text-xl text-gray-700">
                  <>
                    {'Last Updated: '}
                    {determineDate(updatedAt)}
                  </>
                </Heading>
                <EditDocumentIds
                  collection={Collection.WORDS}
                  originalId={originalWordId}
                  id={id}
                  title="Parent Word Id:"
                />
              </Box>
            </Box>
            <Box className="flex flex-row items-center space-x-6 mt-5">
              <Box className="flex flex-col">
                <Tooltip
                  placement="top"
                  backgroundColor="orange.300"
                  color="gray.800"
                  label={hasFlags
                    ? 'This word has been flagged as invalid due to the headword not '
                      + 'following the Dictionary Editing Standards document. Please edit this word for more details.'
                    : ''}
                >
                  <Box className="flex flex-row items-center cursor-default">
                    {hasFlags ? <WarningIcon color="orange.600" boxSize={3} mr={2} /> : null}
                    <Heading
                      fontSize="lg"
                      className="text-xl text-gray-600"
                      color={hasFlags ? 'orange.600' : ''}
                    >
                      Headword
                    </Heading>
                  </Box>
                </Tooltip>
                <DiffField
                  path="word"
                  diffRecord={diffRecord}
                  fallbackValue={word}
                />
              </Box>
              {wordPronunciation ? (
                <Box className="flex flex-col">
                  <Box className="flex flex-row items-center cursor-default">
                    <Heading fontSize="lg" className="text-xl text-gray-600">
                      Headword Pronunciation
                    </Heading>
                  </Box>
                  <DiffField
                    path="wordPronunciation"
                    diffRecord={diffRecord}
                    fallbackValue={wordPronunciation}
                  />
                </Box>
              ) : null}
              {conceptualWord ? (
                <Box className="flex flex-col">
                  <Box className="flex flex-row items-center cursor-default">
                    <Heading fontSize="lg" className="text-xl text-gray-600">
                      Conceptual Headword
                    </Heading>
                  </Box>
                  <DiffField
                    path="conceptualWord"
                    diffRecord={diffRecord}
                    fallbackValue={conceptualWord}
                  />
                </Box>
              ) : null}
            </Box>
            <Box className="flex flex-col mt-5">
              <Heading fontSize="lg" className="text-xl text-gray-600">Audio Pronunciation</Heading>
              {/* TODO: check this part! */}
              <DiffField
                path="word"
                diffRecord={diffRecord}
                fallbackValue={pronunciation ? (
                  <ReactAudioPlayer
                    src={pronunciation}
                    style={{ marginTop: '15px', height: '40px', width: '250px' }}
                    controls
                  />
                ) : <span>No audio pronunciation</span>}
                renderNestedObject={() => (
                  <ReactAudioPlayer
                    src={pronunciation}
                    style={{ marginTop: '15px', height: '40px', width: '250px' }}
                    controls
                  />
                )}
              />
            </Box>
            <Box className="flex flex-col mt-5 w-full lg:w-11/12">
              <Heading fontSize="lg" className="text-xl text-gray-600">Definition Groups</Heading>
              {record.definitions.map((definition, index) => (
                <Box
                  className="pl-4 pb-4 space-y-4 mt-4"
                  borderBottomColor="gray.200"
                  borderBottomWidth="1px"
                  key={`nested-definition-${definition.id}`}
                >
                  <Box className="flex flex-col">
                    <Heading fontSize="md" className="text-gray-600">Part of Speech</Heading>
                    <DiffField
                      path={`definitions.${index}.wordClass`}
                      diffRecord={diffRecord}
                      fallbackValue={
                        WordClass[(definition.wordClass as string)]?.label
                        || `${definition.wordClass} [UPDATE PART OF SPEECH]`
                      }
                    />
                  </Box>
                  <Box className="flex flex-col">
                    <Heading fontSize="md" className="text-xl text-gray-600">Nsịbịdị</Heading>
                    <DiffField
                      path={`definitions.${index}.nsibidi`}
                      diffRecord={diffRecord}
                      fallbackValue={definition.nsibidi}
                      renderNestedObject={(value) => (
                        <span className={value ? 'akagu' : ''}>{value || 'N/A'}</span>
                      )}
                    />
                  </Box>
                  <Box className="flex flex-col">
                    <Heading fontSize="lg" className="text-xl text-gray-600">Nsịbịdị Characters</Heading>
                    <ArrayDiffField
                      recordField={`definitions.${index}.nsibidiCharacters`}
                      recordFieldSingular="nsibidiCharacter"
                      record={record}
                      originalRecord={originalWordRecord}
                    >
                      <ArrayDiff
                        diffRecord={diffRecord}
                        recordField={`definitions.${index}.nsibidiCharacters`}
                        renderNestedObject={(nsibidiCharacterId) => (
                          <ResolvedNsibidiCharacter nsibidiCharacterId={nsibidiCharacterId} />
                        )}
                      />
                    </ArrayDiffField>
                  </Box>
                  <Box className="flex flex-col">
                    <Heading fontSize="md" className="text-xl text-gray-600">English Definitions</Heading>
                    <ArrayDiffField
                      recordField={`definitions.${index}.definitions`}
                      recordFieldSingular="definition"
                      record={record}
                      originalRecord={originalWordRecord}
                    >
                      <ArrayDiff diffRecord={diffRecord} recordField={`definitions.${index}.definitions`} />
                    </ArrayDiffField>
                  </Box>
                  <Box className="flex flex-col">
                    <Heading fontSize="md" className="text-xl text-gray-600">Igbo Definitions</Heading>
                    <ArrayDiffField
                      recordField={`definitions.${index}.igboDefinitions`}
                      recordFieldSingular="igboDefinition"
                      record={record}
                      originalRecord={originalWordRecord}
                    >
                      <ArrayDiff
                        diffRecord={diffRecord}
                        recordField={`definitions.${index}.igboDefinitions`}
                        renderNestedObject={({ igbo, nsibidi }) => (
                          <Box className="flex flex-col space-y-2">
                            <span>{igbo}</span>
                            {nsibidi ? <span className="akagu">{nsibidi}</span> : null}
                          </Box>
                        )}
                      />
                    </ArrayDiffField>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box className="flex flex-col mt-5">
              <Heading fontSize="lg" className="text-xl text-gray-600">Variations</Heading>
              <ArrayDiffField
                recordField="variations"
                recordFieldSingular="variation"
                record={record}
                originalRecord={originalWordRecord}
              >
                <ArrayDiff diffRecord={diffRecord} recordField="variations" />
              </ArrayDiffField>
            </Box>
            <Box className="flex flex-col mt-5">
              <Heading fontSize="lg" className="text-xl text-gray-600">Word Stems</Heading>
              <ArrayDiffField
                recordField="stems"
                recordFieldSingular="stem"
                record={record}
                originalRecord={originalWordRecord}
              >
                <ArrayDiff
                  diffRecord={diffRecord}
                  recordField="stems"
                  renderNestedObject={(wordId) => <ResolvedWord wordId={wordId} />}
                />
              </ArrayDiffField>
            </Box>
            <Box className="flex flex-col mt-5">
              <Heading fontSize="lg" className="text-xl text-gray-600">Related Terms</Heading>
              <ArrayDiffField
                recordField="relatedTerms"
                recordFieldSingular="relatedTerm"
                record={record}
                originalRecord={originalWordRecord}
              >
                <ArrayDiff
                  diffRecord={diffRecord}
                  recordField="relatedTerms"
                  renderNestedObject={(wordId) => <ResolvedWord wordId={wordId} />}
                />
              </ArrayDiffField>
            </Box>
            <Box className="flex flex-col mt-5">
              <Heading fontSize="lg" className="text-xl text-gray-600">Examples</Heading>
              <Box className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <ArrayDiffField
                  recordField="examples"
                  recordFieldSingular="example"
                  record={{ examples } as Interfaces.Word}
                  originalRecord={originalWordRecord}
                >
                  <ExampleDiff
                    record={record}
                    diffRecord={diffRecord}
                    resource={resource}
                  />
                </ArrayDiffField>
              </Box>
            </Box>
          </Box>
          <Box className="mb-10 lg:mb-0 space-y-3 flex flex-col items-start">
            <CompleteWordPreview record={record} showFull={false} className="my-5 lg:my-0" />
            {resource !== Collection.WORDS && (
              <>
                <SourceField record={record} source="source" />
                <ShowDocumentStats
                  approvals={approvals}
                  denials={denials}
                  merged={merged}
                  author={author}
                  collection={Collection.WORDS}
                />
              </>
            )}
            <Box className="flex flex-col w-full justify-between">
              <Attributes record={record} diffRecord={diffRecord} />
              <Box className="flex flex-col space-y-6 mt-5">
                <Box className="flex flex-col mt-5">
                  <Heading fontSize="lg" className="text-xl text-gray-600">Tags</Heading>
                  <ArrayDiffField
                    recordField="tags"
                    recordFieldSingular="tag"
                    record={record}
                    originalRecord={originalWordRecord}
                  >
                    <ArrayDiff diffRecord={diffRecord} recordField="tags" />
                  </ArrayDiffField>
                </Box>
                <Box className="flex flex-col mt-5">
                  <Heading fontSize="lg" className="text-xl text-gray-600">Word Frequency</Heading>
                  <DiffField
                    path="frequency"
                    diffRecord={diffRecord}
                    fallbackValue={get(record, 'frequency') || 1}
                  />
                </Box>
                <Box>
                  <Heading fontSize="lg" className="text-xl text-gray-600 mb-2">Dialects</Heading>
                  <DialectDiff
                    record={record}
                    diffRecord={diffRecord}
                    resource={resource}
                  />
                </Box>
                {/* @ts-expect-error wordClass string */}
                {record?.definitions.some(({ wordClass }) => isVerb(wordClass)) ? (
                  <Box>
                    <Heading fontSize="lg" className="text-xl text-gray-600 mb-2">Tenses</Heading>
                    <TenseDiff
                      record={record}
                      resource={resource}
                    />
                  </Box>
                ) : null}
              </Box>
            </Box>
          </Box>
        </Box>
        {archivedExamples.length ? (
          <details className="mt-4 cursor-pointer">
            <summary>
              <Heading
                display="inline"
                fontSize="lg"
                className="text-xl text-gray-600"
                ml={2}
              >
                Archived Examples 🗄
              </Heading>
            </summary>
            <Box className="flex flex-col mt-5">
              {archivedExamples.map((archivedExample, archivedExampleIndex) => (
                <Box
                  key={`archived-example-${archivedExample.id}`}
                  className="flex flex-row justify-start items-start"
                >
                  <Text color="gray.600" mr={3}>{`${archivedExampleIndex + 1}.`}</Text>
                  <Box>
                    <Text>{archivedExample.igbo}</Text>
                    <Text>{archivedExample.english}</Text>
                    <Text>{archivedExample.nsibidi}</Text>
                    <Text>{archivedExample.meaning}</Text>
                    <ReactAudioPlayer
                      src={archivedExample.pronunciation}
                      style={{ height: '40px', width: '250px' }}
                      controls
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </details>
        ) : null}
        {resource !== Collection.WORDS ? (
          <Comments editorsNotes={editorsNotes} userComments={userComments} />
        ) : null}
      </Box>
    </Skeleton>
  );
};

export default WordShow;
