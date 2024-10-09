import React, { ReactElement, useState, useEffect } from 'react';
import { assign, get } from 'lodash';
import { ShowProps, useShowController } from 'react-admin';
import { Box, Heading, Skeleton, Text, Tooltip, VStack } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import {
  LuArchive,
  LuBadgeCheck,
  LuBookOpen,
  LuBrainCog,
  LuDna,
  LuFileAudio,
  LuFileType,
  LuFootprints,
  LuGrape,
  LuNetwork,
  LuTags,
  LuText,
  LuUngroup,
  LuWaves,
  LuWholeWord,
} from 'react-icons/lu';
import diff from 'deep-diff';
import ReactAudioPlayer from 'react-audio-player';
import { DEFAULT_WORD_RECORD } from 'src/shared/constants';
import View from 'src/shared/constants/Views';
import Collection from 'src/shared/constants/Collection';
import WordClass from 'src/backend/shared/constants/WordClass';
import { getWord } from 'src/shared/API';
import CompleteWordPreview from 'src/shared/components/CompleteWordPreview';
import ResolvedWord from 'src/shared/components/ResolvedWord';
import ResolvedNsibidiCharacter from 'src/shared/components/ResolvedNsibidiCharacter';
import generateFlags from 'src/shared/utils/flagHeadword';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import isVerb from 'src/backend/shared/utils/isVerb';
import DocumentStats from 'src/shared/components/views/edits/components/DocumentStats';
import ShowTextRenderer from 'src/shared/components/views/components/ShowDocumentStats/component/ShowTextRenderer';
import { EditDocumentTopBar, ShowDocumentStats, Comments } from '../../components';
import DialectDiff from '../diffFields/DialectDiff';
import DiffField from '../diffFields/DiffField';
import ArrayDiffField from '../diffFields/ArrayDiffField';
import ExampleDiff from '../diffFields/ExampleDiff';
import ArrayDiff from '../diffFields/ArrayDiff';
import TenseDiff from '../diffFields/TenseDiff';
import Attributes from '../components/Attributes';

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
  let { record }: { record: Interfaces.WordData | Interfaces.WordSuggestionData } = showProps;
  const { permissions } = props;
  const hasFlags = !!Object.values(generateFlags({ word: record || {}, flags: {} }).flags).length;

  record = record || DEFAULT_WORD_RECORD;

  // Order both record and originalWordRecord examples to avoid unnecessary diffs
  record.examples.sort((prev, next) => prev.source.text.localeCompare(next.source.text));

  const {
    id,
    word,
    editorsNotes,
    userComments,
    pronunciation,
    originalWordId,
    wordPronunciation,
    conceptualWord,
    examples: rawExamples,
  } = record;

  const examples = rawExamples.filter(({ archived = false }) => !archived);
  examples.sort((prev, next) => prev.source.text.localeCompare(next.source.text));
  const archivedExamples = rawExamples.filter(({ archived = false }) => archived);

  const resourceTitle = {
    wordSuggestions: 'Word Draft',
    words: 'Word',
  };

  const prepareOriginalWordRecordForExamples = (): Interfaces.Word => {
    if (!!originalWordRecord && 'examples' in originalWordRecord) {
      return {
        ...assign(originalWordRecord),
        examples: originalWordRecord.examples.filter(({ archived = false }) => !archived),
      };
    }
    return originalWordRecord;
  };

  /* Grabs the original word if it exists */
  useEffect(() => {
    (async () => {
      try {
        const originalWord: Interfaces.Word | null = record?.originalWordId
          ? await getWord(record.originalWordId).catch(() => {
              // Unable to retrieve word
              // console.log(err);
            })
          : null;
        if (originalWord) {
          originalWord.examples.sort((prev, next) => prev.source.text.localeCompare(next.source.text));
        }
        if (record) {
          record.examples.sort((prev, next) => prev.source.text.localeCompare(next.source.text));
        }
        const differenceRecord = diff(originalWord, record, (_, key) => DIFF_FILTER_KEYS.indexOf(key) > -1);
        setOriginalWordRecord(originalWord);
        setDiffRecord(differenceRecord);
      } catch (err) {
        // console.log(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [record]);

  return (
    <Skeleton isLoaded={!isLoading}>
      <Box className="shadow-sm p-4 lg:p-10">
        <EditDocumentTopBar
          record={record}
          resource={resource}
          view={View.SHOW}
          id={id}
          permissions={permissions}
          title={resourceTitle[resource]}
        />
        <ShowDocumentStats record={record} collection={Collection.WORDS} showFull={resource !== Collection.WORDS} />
        <Box className="flex flex-col lg:flex-row mb-1 space-y-2 lg:space-x-4" width="full">
          <VStack alignItems="start" gap={2} flex={1}>
            <Box className="w-full flex flex-col lg:flex-row justify-between items-center">
              <DocumentStats
                collection={Collection.WORDS}
                originalId={originalWordId}
                record={record}
                id={id}
                title="Parent Word Id:"
              />
            </Box>
            <ShowTextRenderer title="Headword" icon={<LuBookOpen />}>
              <Tooltip
                placement="top"
                backgroundColor="orange.300"
                color="gray.800"
                label={
                  hasFlags
                    ? 'This word has been flagged as invalid due to the headword not ' +
                      'following the Dictionary Editing Standards document. Please edit this word for more details.'
                    : ''
                }
              >
                <>
                  {hasFlags ? <WarningIcon color="orange.600" boxSize={3} mr={2} /> : null}
                  <DiffField path="word" diffRecord={diffRecord} fallbackValue={word} />
                </>
              </Tooltip>
            </ShowTextRenderer>
            {wordPronunciation ? (
              <ShowTextRenderer title="Headword pronunciation" icon={<LuWholeWord />}>
                <DiffField path="wordPronunciation" diffRecord={diffRecord} fallbackValue={wordPronunciation} />
              </ShowTextRenderer>
            ) : null}
            {conceptualWord ? (
              <ShowTextRenderer title="Conceptual headword" icon={<LuBrainCog />}>
                <DiffField path="conceptualWord" diffRecord={diffRecord} fallbackValue={conceptualWord} />
              </ShowTextRenderer>
            ) : null}
            <ShowTextRenderer title="Audio pronunciation" icon={<LuFileAudio />}>
              <DiffField
                path="word"
                diffRecord={diffRecord}
                fallbackValue={
                  pronunciation ? (
                    <ReactAudioPlayer
                      src={pronunciation}
                      style={{ marginTop: '15px', height: '40px', width: '250px' }}
                      controls
                    />
                  ) : (
                    <span>No audio pronunciation</span>
                  )
                }
                renderNestedObject={() => (
                  <ReactAudioPlayer
                    src={pronunciation}
                    style={{ marginTop: '15px', height: '40px', width: '250px' }}
                    controls
                  />
                )}
              />
            </ShowTextRenderer>
            <ShowTextRenderer title="Definition groups" icon={<LuFileType />}>
              {record.definitions.map((definition, index) => (
                <Box
                  className="pl-4 pb-4 space-y-4 mt-4"
                  borderBottomColor="gray.200"
                  borderBottomWidth="1px"
                  key={`nested-definition-${definition.id}`}
                >
                  <Box className="flex flex-col">
                    <Heading fontSize="md" className="text-gray-600">
                      Part of Speech
                    </Heading>
                    <DiffField
                      path={`definitions.${index}.wordClass`}
                      diffRecord={diffRecord}
                      fallbackValue={
                        WordClass[definition.wordClass as string]?.label ||
                        `${definition.wordClass} [UPDATE PART OF SPEECH]`
                      }
                    />
                  </Box>
                  <Box className="flex flex-col">
                    <Heading fontSize="md" className="text-xl text-gray-600">
                      Nsịbịdị
                    </Heading>
                    <DiffField
                      path={`definitions[${index}].nsibidi`}
                      diffRecord={diffRecord}
                      fallbackValue={definition.nsibidi}
                      renderNestedObject={(value) => <span className={value ? 'akagu' : ''}>{value || 'N/A'}</span>}
                    />
                  </Box>
                  <Box className="flex flex-col">
                    <Heading fontSize="lg" className="text-xl text-gray-600">
                      Nsịbịdị Characters
                    </Heading>
                    <ArrayDiffField
                      recordField={`definitions[${index}].nsibidiCharacters`}
                      recordFieldSingular="nsibidiCharacter"
                      record={record}
                      originalRecord={originalWordRecord}
                    >
                      <ArrayDiff
                        diffRecord={diffRecord}
                        recordField={`definitions[${index}].nsibidiCharacters`}
                        renderNestedObject={(nsibidiCharacterId) => (
                          <ResolvedNsibidiCharacter nsibidiCharacterId={nsibidiCharacterId} />
                        )}
                      />
                    </ArrayDiffField>
                  </Box>
                  <Box className="flex flex-col">
                    <Heading fontSize="md" className="text-xl text-gray-600">
                      English Definitions
                    </Heading>
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
                    <Heading fontSize="md" className="text-xl text-gray-600">
                      Igbo Definitions
                    </Heading>
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
            </ShowTextRenderer>
            <ShowTextRenderer title="Variations" icon={<LuDna />}>
              <ArrayDiffField
                recordField="variations"
                recordFieldSingular="variation"
                record={record}
                originalRecord={originalWordRecord}
              >
                <ArrayDiff diffRecord={diffRecord} recordField="variations" />
              </ArrayDiffField>
            </ShowTextRenderer>
            <ShowTextRenderer title="Word stems" icon={<LuGrape />}>
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
            </ShowTextRenderer>
            <ShowTextRenderer title="Related terms" icon={<LuFootprints />}>
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
            </ShowTextRenderer>
            <ShowTextRenderer title="Examples" ico={<LuText />}>
              <Box className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <ArrayDiffField
                  recordField="examples"
                  recordFieldSingular="example"
                  record={{ examples } as { examples: Interfaces.ExampleData[] }}
                  originalRecord={prepareOriginalWordRecordForExamples()}
                >
                  <ExampleDiff
                    record={{ examples } as { examples: Interfaces.ExampleData[] }}
                    diffRecord={diffRecord}
                    resource={resource}
                  />
                </ArrayDiffField>
              </Box>
            </ShowTextRenderer>
          </VStack>
          <VStack alignItems="start" gap={2} flex={1}>
            <ShowTextRenderer title="Completeness" icon={<LuBadgeCheck />}>
              <CompleteWordPreview record={record} showFull={false} className="my-5 lg:my-0" />
            </ShowTextRenderer>
            <VStack alignItems="start" gap={2} width="full">
              <Attributes attributeType={Collection.WORD_SUGGESTIONS} record={record} />
              <VStack alignItems="start" gap={2} width="full">
                <ShowTextRenderer title="Tags" icon={<LuTags />}>
                  <ArrayDiffField
                    recordField="tags"
                    recordFieldSingular="tag"
                    record={record}
                    originalRecord={originalWordRecord}
                  >
                    <ArrayDiff diffRecord={diffRecord} recordField="tags" />
                  </ArrayDiffField>
                </ShowTextRenderer>
                <ShowTextRenderer title="Word frequency" icon={<LuWaves />}>
                  <DiffField path="frequency" diffRecord={diffRecord} fallbackValue={get(record, 'frequency') || 1} />
                </ShowTextRenderer>
                <ShowTextRenderer title="Dialects" icon={<LuUngroup />}>
                  <DialectDiff record={record} diffRecord={diffRecord} resource={resource} />
                </ShowTextRenderer>
                {/* @ts-expect-error wordClass string */}
                {record?.definitions.some(({ wordClass }) => isVerb(wordClass)) ? (
                  <ShowTextRenderer title="Tenses" icon={<LuNetwork />}>
                    <TenseDiff record={record} resource={resource} />
                  </ShowTextRenderer>
                ) : null}
              </VStack>
            </VStack>
          </VStack>
        </Box>
        {archivedExamples.length ? (
          <ShowTextRenderer title="Archived sentences" icon={<LuArchive />}>
            {archivedExamples.map((archivedExample, archivedExampleIndex) => (
              <>
                <Text color="gray.600" mr={3}>{`${archivedExampleIndex + 1}.`}</Text>
                <Box>
                  <Text>{get(archivedExample, 'source.text')}</Text>
                  <Text>{get(archivedExample, 'translations.0.text')}</Text>
                  <Text>{archivedExample.nsibidi}</Text>
                  <Text>{archivedExample.meaning}</Text>
                  <ReactAudioPlayer
                    src={get(archivedExample, 'source.pronunciations[0].audio')}
                    style={{ height: '40px', width: '250px' }}
                    controls
                  />
                </Box>
              </>
            ))}
          </ShowTextRenderer>
        ) : null}
        {resource !== Collection.WORDS ? <Comments editorsNotes={editorsNotes} userComments={userComments} /> : null}
      </Box>
    </Skeleton>
  );
};

export default WordShow;
