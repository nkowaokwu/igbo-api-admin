import React, { ReactElement, useState, useEffect } from 'react';
import { ShowProps, useShowController } from 'react-admin';
import {
  Box,
  Heading,
  Skeleton,
  Tooltip,
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import diff from 'deep-diff';
import ReactAudioPlayer from 'react-audio-player';
import { DEFAULT_WORD_RECORD } from 'src/shared/constants';
import View from 'src/shared/constants/Views';
import Collection from 'src/shared/constants/Collections';
import WordClass from 'src/shared/constants/WordClass';
import { getWord } from 'src/shared/API';
import CompleteWordPreview from 'src/shared/components/CompleteWordPreview';
import ResolvedWord from 'src/shared/components/ResolvedWord';
import SourceField from 'src/shared/components/SourceField';
import generateFlags from 'src/shared/utils/flagHeadword';
import {
  EditDocumentTopBar,
  ShowDocumentStats,
  EditDocumentIds,
  Comments,
} from '../../components';
import { determineDate } from '../../utils';
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
];

const WordShow = (props: ShowProps): ReactElement => {
  const [isLoading, setIsLoading] = useState(true);
  const [originalWordRecord, setOriginalWordRecord] = useState<any>({});
  const [diffRecord, setDiffRecord] = useState(null);
  const showProps = useShowController(props);
  const { resource } = showProps;
  let { record } = showProps;
  const { permissions } = props;
  const hasFlags = !!Object.values(generateFlags({ word: record || {}, flags: {} }).flags).length;

  record = record || DEFAULT_WORD_RECORD;

  const {
    id,
    author,
    word,
    wordClass,
    nsibidi,
    approvals,
    denials,
    editorsNotes,
    userComments,
    merged,
    pronunciation,
    originalWordId,
    updatedAt,
  } = record;

  const resourceTitle = {
    wordSuggestions: 'Word Suggestion',
    genericWords: 'Generic Word',
    words: 'Word',
  };

  /* Grabs the original word if it exists */
  useEffect(() => {
    (async () => {
      const originalWord = record?.originalWordId ? await getWord(record.originalWordId) : null;
      const differenceRecord = diff(originalWord, record, (_, key) => DIFF_FILTER_KEYS.indexOf(key) > -1);
      setOriginalWordRecord(originalWord);
      setDiffRecord(differenceRecord);
      setIsLoading(false);
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
        <Box className="flex flex-col-reverse lg:flex-row mt-1">
          <Box className="flex flex-col flex-auto justify-between items-start">
            <Box className="w-full flex flex-col lg:flex-row justify-between items-center">
              <Box>
                <Heading fontSize="lg" className="text-xl text-gray-700">
                  {'Last Updated: '}
                  {determineDate(updatedAt)}
                </Heading>
                <EditDocumentIds collection="words" originalId={originalWordId} id={id} title="Origin Word Id:" />
              </Box>
              <CompleteWordPreview record={record} showFull className="my-5 lg:my-0" />
            </Box>
            <Box className="flex flex-col lg:flex-row w-full justify-between">
              <Attributes record={record} diffRecord={diffRecord} />
              <Box className="flex flex-col space-y-6 mt-5">
                <Box className="flex flex-col mt-5">
                  <Heading fontSize="lg" className="text-xl text-gray-600">Tags</Heading>
                  {/* @ts-ignore */}
                  <ArrayDiffField
                    recordField="tags"
                    recordFieldSingular="tag"
                    record={record}
                    // @ts-ignore
                    originalWordRecord={originalWordRecord}
                  >
                    {/* @ts-ignore */}
                    <ArrayDiff diffRecord={diffRecord} recordField="tags" />
                  </ArrayDiffField>
                </Box>
                <Box>
                  <Heading fontSize="lg" className="text-xl text-gray-600 mb-2">Dialects</Heading>
                  <DialectDiff
                    record={record}
                    diffRecord={diffRecord}
                    resource={resource}
                  />
                </Box>
                <Box>
                  <Heading fontSize="lg" className="text-xl text-gray-600 mb-2">Tenses</Heading>
                  <TenseDiff
                    record={record}
                    resource={resource}
                  />
                </Box>
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
                      Word
                    </Heading>
                  </Box>
                </Tooltip>
                <DiffField
                  path="word"
                  diffRecord={diffRecord}
                  fallbackValue={word}
                />
              </Box>
              <Box className="flex flex-col">
                <Heading fontSize="lg" className="text-xl text-gray-600">Nsịbịdị</Heading>
                <DiffField
                  path="nsibidi"
                  diffRecord={diffRecord}
                  fallbackValue={nsibidi}
                  renderNestedObject={(value) => (
                    <span className={value ? 'akagu' : ''}>{value || 'N/A'}</span>
                  )}
                />
              </Box>
            </Box>
            <Box className="flex flex-col mt<-5">
              <Heading fontSize="lg" className="text-xl text-gray-600">Part of Speech</Heading>
              <DiffField
                path="wordClass"
                diffRecord={diffRecord}
                fallbackValue={WordClass[wordClass]?.label || `${wordClass} [UPDATE PART OF SPEECH]`}
              />
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
                    style={{ height: '40', width: 250 }}
                    controls
                  />
                ) : <span>No audio pronunciation</span>}
                renderNestedObject={() => (
                  <ReactAudioPlayer
                    src={pronunciation}
                    style={{ height: '40', width: 250 }}
                    controls
                  />
                )}
              />
            </Box>
            <Box className="flex flex-col mt-5">
              <Heading fontSize="lg" className="text-xl text-gray-600">Definitions</Heading>
              {/* @ts-ignore */}
              <ArrayDiffField
                recordField="definitions"
                recordFieldSingular="definition"
                record={record}
                // @ts-ignore
                originalWordRecord={originalWordRecord}
              >
                {/* @ts-ignore */}
                <ArrayDiff diffRecord={diffRecord} recordField="definitions" />
              </ArrayDiffField>
            </Box>
            <Box className="flex flex-col mt-5">
              <Heading fontSize="lg" className="text-xl text-gray-600">Variations</Heading>
              {/* @ts-ignore */}
              <ArrayDiffField
                recordField="variations"
                recordFieldSingular="variation"
                record={record}
                // @ts-ignore
                originalWordRecord={originalWordRecord}
              >
                {/* @ts-ignore */}
                <ArrayDiff diffRecord={diffRecord} recordField="variations" />
              </ArrayDiffField>
            </Box>
            <Box className="flex flex-col mt-5">
              <Heading fontSize="lg" className="text-xl text-gray-600">Word Stems</Heading>
              {/* @ts-ignore */}
              <ArrayDiffField
                recordField="stems"
                recordFieldSingular="stem"
                record={record}
                // @ts-ignore
                originalWordRecord={originalWordRecord}
              >
                {/* @ts-ignore */}
                <ArrayDiff
                  diffRecord={diffRecord}
                  recordField="stems"
                  renderNestedObject={(wordId) => <ResolvedWord wordId={wordId} />}
                />
              </ArrayDiffField>
            </Box>
            <Box className="flex flex-col mt-5">
              <Heading fontSize="lg" className="text-xl text-gray-600">Synonyms</Heading>
              {/* @ts-ignore */}
              <ArrayDiffField
                recordField="synonyms"
                recordFieldSingular="synonym"
                record={record}
                // @ts-ignore
                originalWordRecord={originalWordRecord}
              >
                {/* @ts-ignore */}
                <ArrayDiff
                  diffRecord={diffRecord}
                  recordField="synonyms"
                  renderNestedObject={(wordId) => <ResolvedWord wordId={wordId} />}
                />
              </ArrayDiffField>
            </Box>
            <Box className="flex flex-col mt-5">
              <Heading fontSize="lg" className="text-xl text-gray-600">Antonyms</Heading>
              {/* @ts-ignore */}
              <ArrayDiffField
                recordField="antonyms"
                recordFieldSingular="antonym"
                record={record}
                // @ts-ignore
                originalWordRecord={originalWordRecord}
              >
                {/* @ts-ignore */}
                <ArrayDiff
                  diffRecord={diffRecord}
                  recordField="antonyms"
                  renderNestedObject={(wordId) => <ResolvedWord wordId={wordId} />}
                />
              </ArrayDiffField>
            </Box>
            <Box className="flex flex-col mt-5">
              <Heading fontSize="lg" className="text-xl text-gray-600">Examples</Heading>
              {/* @ts-ignore */}
              <ArrayDiffField
                recordField="examples"
                recordFieldSingular="example"
                record={record}
                // @ts-ignore
                originalWordRecord={originalWordRecord}
              >
                {/* @ts-ignore */}
                <ExampleDiff
                  diffRecord={diffRecord}
                  // @ts-ignore
                  resource={resource}
                />
              </ArrayDiffField>
            </Box>
            {resource !== Collection.WORDS ? (
              <Comments editorsNotes={editorsNotes} userComments={userComments} />
            ) : null}
          </Box>
          {resource !== Collection.WORDS && (
            <Box className="mb-10 lg:mb-0 space-y-3 flex flex-col items-end">
              <SourceField record={record} source="source" />
              <ShowDocumentStats
                approvals={approvals}
                denials={denials}
                merged={merged}
                author={author}
                collection="words"
              />
            </Box>
          )}
        </Box>
      </Box>
    </Skeleton>
  );
};

export default WordShow;
