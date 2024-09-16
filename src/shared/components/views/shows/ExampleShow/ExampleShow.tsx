import React, { ReactElement, useEffect, useState } from 'react';
import { ShowProps, useShowController } from 'react-admin';
import { Box, Skeleton, Text, chakra, VStack } from '@chakra-ui/react';
import { LuPaintbrush, LuScrollText, LuFileAudio, LuBrain, LuLink } from 'react-icons/lu';
import { get } from 'lodash';
import pluralize from 'pluralize';
import diff from 'deep-diff';
import ReactAudioPlayer from 'react-audio-player';
import { DEFAULT_EXAMPLE_RECORD } from 'src/shared/constants';
import View from 'src/shared/constants/Views';
import Collection from 'src/shared/constants/Collection';
import { getExample } from 'src/shared/API';
import ResolvedWord from 'src/shared/components/ResolvedWord';
import ResolvedNsibidiCharacter from 'src/shared/components/ResolvedNsibidiCharacter';
import SummaryList from 'src/shared/components/views/shows/components/SummaryList';
import SpeakerNameManager from 'src/Core/Collections/components/SpeakerNameManager/SpeakerNameManager';
import useFetchSpeakers from 'src/hooks/useFetchSpeakers';
import { PronunciationData } from 'src/backend/controllers/utils/interfaces';
import useIsIgboAPIProject from 'src/hooks/useIsIgboAPIProject';
import ShowTextRenderer from 'src/shared/components/views/components/ShowDocumentStats/component/ShowTextRenderer';
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
    source,
    translations,
    meaning,
    nsibidi,
    style,
    associatedWords,
    pronunciations = [],
    editorsNotes,
    userComments,
  } = record || DEFAULT_EXAMPLE_RECORD;
  const speakerIds = pronunciations.map(({ speaker: speakerId }) => speakerId);
  const speakers = useFetchSpeakers({ permissions, setIsLoading: setIsLoadingSpeakers, speakerIds });
  const isIgboAPIProject = useIsIgboAPIProject();

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
    exampleSuggestions: 'Sentence Draft',
    examples: 'Sentence',
  };
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
    <Box>
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
    </Box>
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
      <Box className="shadow-sm p-4 lg:p-10">
        <EditDocumentTopBar
          record={record}
          resource={resource}
          view={View.SHOW}
          id={id}
          permissions={permissions}
          title={resourceTitle[resource]}
        />
        <ShowDocumentStats
          record={record}
          collection={Collection.EXAMPLES}
          showFull={resource !== Collection.EXAMPLES}
        />
        <VStack className="flex flex-col flex-auto justify-between items-start">
          <ShowTextRenderer title="Source text" icon={<LuScrollText />}>
            <DiffField
              path="source.text"
              diffRecord={diffRecord}
              fallbackValue={get(source, 'text')}
              renderNestedObject={(value) => <span>{String(value || false)}</span>}
            />
          </ShowTextRenderer>
          <ShowTextRenderer title="Source text pronunciations" icon={<LuFileAudio />}>
            <ArrayDiffField recordField="source.pronunciations" record={record}>
              <ArrayDiff diffRecord={diffRecord} renderNestedObject={renderNestedAudioPronunciation} />
            </ArrayDiffField>
          </ShowTextRenderer>
          <ShowTextRenderer title="Translated text" icon={<LuScrollText />}>
            <DiffField
              path="translations.0.text"
              diffRecord={diffRecord}
              fallbackValue={get(translations, '0.text')}
              renderNestedObject={(value) => <span>{String(value || false)}</span>}
            />
          </ShowTextRenderer>
          <ShowTextRenderer title="Translate text pronunciations" icon={<LuFileAudio />}>
            <ArrayDiffField recordField="translations.0.pronunciations" record={record}>
              <ArrayDiff diffRecord={diffRecord} renderNestedObject={renderNestedAudioPronunciation} />
            </ArrayDiffField>
          </ShowTextRenderer>
          <ShowTextRenderer title="Meaning" icon={<LuBrain />}>
            <DiffField
              path="meaning"
              diffRecord={diffRecord}
              fallbackValue={meaning}
              renderNestedObject={(value) => <chakra.span>{String(value || false)}</chakra.span>}
            />
          </ShowTextRenderer>
          <ShowTextRenderer title="Nsịbịdị" icon={<>〒</>}>
            <DiffField
              path="nsibidi"
              diffRecord={diffRecord}
              fallbackValue={nsibidi}
              renderNestedObject={(value) => <chakra.span className="akagu">{String(value || false)}</chakra.span>}
            />
          </ShowTextRenderer>
          <ShowTextRenderer title="Nsịbịdị characters" icon={<>〒</>}>
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
          </ShowTextRenderer>
          {isIgboAPIProject ? (
            <>
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
              <ShowTextRenderer title="Associated words" icon={<LuLink />}>
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
              </ShowTextRenderer>
              <ShowTextRenderer title="Sentence style" icon={<LuPaintbrush />}>
                <DiffField
                  path="style"
                  diffRecord={diffRecord}
                  fallbackValue={style}
                  renderNestedObject={(value) => <span>{String(value || false)}</span>}
                />
              </ShowTextRenderer>
            </>
          ) : null}
          {resource !== Collection.EXAMPLES && isIgboAPIProject ? (
            <Comments editorsNotes={editorsNotes} userComments={userComments} />
          ) : null}
        </VStack>
      </Box>
    </Skeleton>
  );
};

export default ExampleShow;
