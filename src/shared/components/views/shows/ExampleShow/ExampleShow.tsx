import React, { ReactElement, useEffect, useState } from 'react';
import { ShowProps, useShowController } from 'react-admin';
import { Box, Skeleton, Text, chakra, VStack, HStack, Tooltip } from '@chakra-ui/react';
import {
  LuPaintbrush,
  LuScrollText,
  LuFileAudio,
  LuBrain,
  LuLink,
  LuArchive,
  LuXCircle,
  LuCheckCircle2,
} from 'react-icons/lu';
import { get } from 'lodash';
import diff from 'deep-diff';
import ReactAudioPlayer from 'react-audio-player';
import { DEFAULT_EXAMPLE_RECORD } from 'src/shared/constants';
import View from 'src/shared/constants/Views';
import Collection from 'src/shared/constants/Collection';
import { getExample } from 'src/shared/API';
import ResolvedWord from 'src/shared/components/ResolvedWord';
import ResolvedNsibidiCharacter from 'src/shared/components/ResolvedNsibidiCharacter';
import SpeakerNameManager from 'src/Core/Collections/components/SpeakerNameManager/SpeakerNameManager';
import useFetchSpeakers from 'src/hooks/useFetchSpeakers';
import { PronunciationData, Translation } from 'src/backend/controllers/utils/interfaces';
import useIsIgboAPIProject from 'src/hooks/useIsIgboAPIProject';
import ShowTextRenderer from 'src/shared/components/views/components/ShowDocumentStats/component/ShowTextRenderer';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
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
  const { id, source, translations, meaning, nsibidi, style, associatedWords, editorsNotes, userComments } =
    record || DEFAULT_EXAMPLE_RECORD;
  const speakerIds = source.pronunciations.map(({ speaker: speakerId }) => speakerId);
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
  const archivedSourcePronunciations = source.pronunciations.filter(({ archived = false }) => archived);
  const archivedTranslationPronunciations = translations.flatMap(({ pronunciations }) =>
    pronunciations.filter(({ archived = false }) => archived),
  );

  const renderNestedAudioPronunciation = (
    { audio, approvals = [], denials = [], archived }: PronunciationData = {
      audio: '',
      speaker: '',
      approvals: [],
      denials: [],
      archived: false,
      review: false,
    },
  ) => (
    <VStack backgroundColor={archived ? 'orange.200' : ''} alignItems="start" my={2}>
      <ReactAudioPlayer data-test="pronunciations" src={audio} style={{ height: '40px', width: '250px' }} controls />
      <HStack gap={2}>
        <Text className="space-x-4" display="flex">
          <Tooltip label="Total denials">
            <chakra.span
              fontStyle="italic"
              color={approvals.length >= 2 ? 'green' : 'gray'}
              fontSize="sm"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <LuXCircle />
              {approvals.length}
            </chakra.span>
          </Tooltip>
          <Tooltip label="Total approvals">
            <chakra.span
              fontStyle="italic"
              color={denials.length === 1 ? 'orange' : denials.length >= 2 ? 'red' : 'gray'}
              fontSize="sm"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <LuCheckCircle2 />
              {denials.length}
            </chakra.span>
          </Tooltip>
        </Text>
      </HStack>
    </VStack>
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

  return record?.id ? (
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
              renderNestedObject={(value) => (
                <chakra.span overflowWrap="anywhere">
                  <chakra.span overflowWrap="anywhere">{String(value || false)}</chakra.span> (
                  {LanguageLabels[get(record, 'source.language')]?.label})
                </chakra.span>
              )}
            />
          </ShowTextRenderer>
          <ShowTextRenderer title="Source text pronunciations" icon={<LuFileAudio />}>
            <ArrayDiffField recordField="source.pronunciations" record={record}>
              <ArrayDiff diffRecord={diffRecord} renderNestedObject={renderNestedAudioPronunciation} />
            </ArrayDiffField>
          </ShowTextRenderer>
          <ShowTextRenderer title="Sentence translations" icon={<LuScrollText />}>
            {record.translations.map((_, index) => (
              <DiffField
                path={`translations.${index}.text`}
                diffRecord={diffRecord}
                fallbackValue={get(translations, `${index}`)}
                renderNestedObject={(translation: Translation) => (
                  <VStack alignItems="start" width="full" gap={2}>
                    <details>
                      <summary>
                        <chakra.span overflowWrap="anywhere">
                          <chakra.span overflowWrap="anywhere">{String(translation.text || false)}</chakra.span> (
                          {LanguageLabels[get(translation, 'language')]?.label})
                        </chakra.span>
                      </summary>
                      <ArrayDiffField
                        recordField={`translations.${index}.pronunciations`}
                        record={record}
                        hideEmpty
                        hideBullets
                      >
                        <ArrayDiff diffRecord={diffRecord} renderNestedObject={renderNestedAudioPronunciation} />
                      </ArrayDiffField>
                    </details>
                  </VStack>
                )}
              />
            ))}
          </ShowTextRenderer>
          {archivedSourcePronunciations.length ? (
            <ShowTextRenderer title="Archived source text pronunciations" icon={<LuArchive />}>
              {archivedSourcePronunciations.map((archivedPronunciation, archivedPronunciationIndex) => (
                <HStack gap={0} justifyContent="start">
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
                </HStack>
              ))}
            </ShowTextRenderer>
          ) : null}
          {archivedTranslationPronunciations.length ? (
            <ShowTextRenderer title="Archived translated text pronunciations" icon={<LuArchive />}>
              {archivedTranslationPronunciations.map((archivedPronunciation, index) => (
                <HStack gap={0} justifyContent="start">
                  <Text color="gray.600" mr={3}>{`${index + 1}.`}</Text>
                  <Box>
                    <ReactAudioPlayer
                      src={archivedPronunciation.audio}
                      style={{ height: '40px', width: '250px' }}
                      controls
                    />
                    <SpeakerNameManager isLoading={isLoadingSpeakers} speakers={speakers} index={index} />
                  </Box>
                </HStack>
              ))}
            </ShowTextRenderer>
          ) : null}
          {isIgboAPIProject ? (
            <>
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
                  renderNestedObject={(value) => <span>{ExampleStyle[value]?.label || 'No Style'}</span>}
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
  ) : null;
};

export default ExampleShow;
