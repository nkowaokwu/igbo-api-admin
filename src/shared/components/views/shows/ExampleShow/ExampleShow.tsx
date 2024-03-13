import React, { ReactElement, useEffect, useState } from 'react';
import { ShowProps, useShowController } from 'react-admin';
import { Box, Heading, Skeleton, Text, chakra } from '@chakra-ui/react';
import pluralize from 'pluralize';
import diff from 'deep-diff';
import ReactAudioPlayer from 'react-audio-player';
import { DEFAULT_EXAMPLE_RECORD } from 'src/shared/constants';
import View from 'src/shared/constants/Views';
import Collection from 'src/shared/constants/Collection';
import { getExample } from 'src/shared/API';
import SourceField from 'src/shared/components/SourceField';
import ResolvedWord from 'src/shared/components/ResolvedWord';
import ResolvedNsibidiCharacter from 'src/shared/components/ResolvedNsibidiCharacter';
import SummaryList from 'src/shared/components/views/shows/components/SummaryList';
import SpeakerNameManager from 'src/Core/Collections/components/SpeakerNameManager/SpeakerNameManager';
import useFetchSpeakers from 'src/hooks/useFetchSpeakers';
import { PronunciationData } from 'src/backend/controllers/utils/interfaces';
import DocumentStats from 'src/shared/components/views/edits/components/DocumentStats';
import DiffField from '../diffFields/DiffField';
import ArrayDiffField from '../diffFields/ArrayDiffField';
import ArrayDiff from '../diffFields/ArrayDiff';
import { ShowDocumentStats, EditDocumentTopBar, Comments } from '../../components';

const ExampleShow = (props: ShowProps): ReactElement => {
  const [isLoadingSpeakers, setIsLoadingSpeakers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [originalExampleRecord, setOriginalExampleRecord] = useState({});
  const [diffRecord, setDiffRecord] = useState(null);
  const { record, resource } = useShowController(props);
  const { permissions } = props;
  const {
    id,
    igbo,
    english,
    meaning,
    nsibidi,
    style,
    associatedWords,
    pronunciations = [],
    originalExampleId,
    editorsNotes,
    userComments,
    approvals,
    denials,
    merged,
    author,
  } = record || DEFAULT_EXAMPLE_RECORD;
  const speakerIds = pronunciations.map(({ speaker: speakerId }) => speakerId);
  const speakers = useFetchSpeakers({ permissions, setIsLoading: setIsLoadingSpeakers, speakerIds });

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
    'updatedAt',
    'stems',
    'normalized',
    'mergedBy',
  ];

  const resourceTitle = {
    exampleSuggestions: 'Example Suggestion',
    examples: 'Example',
  };
  const notArchivedPronunciations = pronunciations.filter(({ archived = false }) => !archived);
  const archivedPronunciations = pronunciations.filter(({ archived = false }) => archived);

  const renderNestedAudioPronunciation = (
    { audio, approvals = [], denials = [] }: PronunciationData = {
      audio: '',
      speaker: '',
      approvals: [],
      denials: [],
      archived: false,
      review: false,
    },
  ) => (
    <>
      <ReactAudioPlayer data-test="pronunciations" src={audio} style={{ height: '40px', width: '250px' }} controls />
      <Text className="space-x-4">
        <chakra.span fontStyle="italic" color={approvals.length >= 2 ? 'green' : 'gray'} fontSize="sm">
          {pluralize('approval', approvals.length, true)}
        </chakra.span>
        <chakra.span
          fontStyle="italic"
          color={denials.length === 1 ? 'orange' : denials.length >= 2 ? 'red' : 'gray'}
          fontSize="sm"
        >
          {pluralize('denial', denials.length, true)}
        </chakra.span>
      </Text>
    </>
  );

  /* Grabs the original word if it exists */
  useEffect(() => {
    (async () => {
      const originalExample = record?.originalExampleId ? await getExample(record.originalExampleId) : null;
      const differenceRecord = diff(originalExample, record, (_, key) => DIFF_FILTER_KEYS.indexOf(key) > -1);
      setOriginalExampleRecord(originalExample);
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
            <DocumentStats
              collection={Collection.EXAMPLES}
              originalId={originalExampleId}
              record={record}
              id={id}
              title="Parent Example Id:"
            />
            <Box>
              <Heading fontSize="lg" className="text-xl text-gray-600">
                Sentence Style
              </Heading>
              <DiffField
                path="style"
                diffRecord={diffRecord}
                fallbackValue={style}
                renderNestedObject={(value) => <span>{String(value || false)}</span>}
              />
              <Box className="flex flex-col mt-5">
                <Heading fontSize="lg" className="text-xl text-gray-600">
                  Audio Pronunciations
                </Heading>
                <ArrayDiffField recordField="pronunciations" record={{ pronunciations: notArchivedPronunciations }}>
                  <ArrayDiff diffRecord={diffRecord} renderNestedObject={renderNestedAudioPronunciation} />
                </ArrayDiffField>
              </Box>
              <Heading fontSize="lg" className="text-xl text-gray-600">
                Igbo
              </Heading>
              <DiffField
                path="igbo"
                diffRecord={diffRecord}
                fallbackValue={igbo}
                renderNestedObject={(value) => <span>{String(value || false)}</span>}
              />
              <Heading fontSize="lg" className="text-xl text-gray-600">
                English
              </Heading>
              <DiffField
                path="english"
                diffRecord={diffRecord}
                fallbackValue={english}
                renderNestedObject={(value) => <span>{String(value || false)}</span>}
              />
              <Heading fontSize="lg" className="text-xl text-gray-600">
                Meaning
              </Heading>
              <DiffField
                path="meaning"
                diffRecord={diffRecord}
                fallbackValue={meaning}
                renderNestedObject={(value) => <chakra.span>{String(value || false)}</chakra.span>}
              />
              <Heading fontSize="lg" className="text-xl text-gray-600">
                Nsịbịdị
              </Heading>
              <DiffField
                path="nsibidi"
                diffRecord={diffRecord}
                fallbackValue={nsibidi}
                renderNestedObject={(value) => <chakra.span className="akagu">{String(value || false)}</chakra.span>}
              />
              <Box className="flex flex-col">
                <Heading fontSize="lg" className="text-xl text-gray-600">
                  Nsịbịdị Characters
                </Heading>
                <ArrayDiffField
                  recordField="nsibidiCharacters"
                  recordFieldSingular="nsibidiCharacter"
                  record={record}
                  originalRecord={originalExampleRecord}
                >
                  <ArrayDiff
                    diffRecord={diffRecord}
                    recordField="nsibidiCharacters"
                    renderNestedObject={(nsibidiCharacterId) => (
                      <ResolvedNsibidiCharacter nsibidiCharacterId={nsibidiCharacterId} />
                    )}
                  />
                </ArrayDiffField>
              </Box>
              <SummaryList
                items={archivedPronunciations}
                title="Archived Example Pronunciations 🗄"
                render={(archivedPronunciation, archivedPronunciationIndex) => (
                  <>
                    <Text color="gray.600" mr={3}>{`${archivedPronunciationIndex + 1}.`}</Text>
                    <Box>
                      <ReactAudioPlayer
                        src={archivedPronunciation.audio}
                        style={{ height: '40px', width: '250px' }}
                        controls
                      />
                      <SpeakerNameManager
                        isLoading={isLoadingSpeakers}
                        speakers={speakers}
                        index={archivedPronunciationIndex}
                      />
                    </Box>
                  </>
                )}
              />
              <Box className="flex flex-col mt-5">
                <Text fontWeight="bold" className="text-xl text-gray-600">
                  Associated Words
                </Text>
                {associatedWords?.length ? (
                  associatedWords?.map((associatedWord, index) => (
                    <Box className="flex flex-row items-center space-x-2">
                      <Text>{`${index + 1}. `}</Text>
                      <ResolvedWord key={associatedWord} wordId={associatedWord} />
                    </Box>
                  ))
                ) : (
                  <span className="text-gray-500 italic">No associated word Ids</span>
                )}
              </Box>
              {resource !== Collection.EXAMPLES ? (
                <Comments editorsNotes={editorsNotes} userComments={userComments} />
              ) : null}
            </Box>
          </Box>
          {resource !== Collection.EXAMPLES && (
            <Box className="mb-10 lg:mb-0 flex flex-col items-end">
              <SourceField record={record} source="source" />
              <ShowDocumentStats
                approvals={approvals}
                denials={denials}
                merged={merged}
                author={author}
                collection={Collection.EXAMPLES}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Skeleton>
  );
};

export default ExampleShow;
