import React, { ReactElement, useState } from 'react';
import { assign, get } from 'lodash';
import { Box, Text, chakra, HStack } from '@chakra-ui/react';
import { Record, usePermissions } from 'react-admin';
import ReactAudioPlayer from 'react-audio-player';
import { Controller, Control, useFieldArray, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { LuArchive } from 'react-icons/lu';
import ResourceConnectionButton from 'src/shared/components/buttons/ResourceConnectionButton';
import SpeakerNameManager from 'src/Core/Collections/components/SpeakerNameManager/SpeakerNameManager';
import useFetchSpeakers from 'src/hooks/useFetchSpeakers';
import ShowTextRenderer from 'src/shared/components/views/components/ShowDocumentStats/component/ShowTextRenderer';
import AddAudioPronunciationButton from './AddAudioPronunciationButton';
import FormHeader from '../../FormHeader';
import AudioRecorder from '../../AudioRecorder';

const ExampleAudioPronunciationsForm = ({
  control,
  record,
  originalRecord,
  uid,
  name = '',
  setValue,
  getValues,
}: {
  control: Control;
  record: Record;
  originalRecord: Record | null;
  uid: string;
  name?: string;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
}): ReactElement => {
  const prependedName = name ? `${name}.` : '';
  const formName = `${prependedName}pronunciations`;
  const [isLoadingSpeakers, setIsLoadingSpeakers] = useState(false);
  const [, setInternalPronunciations] = useState([]);
  const {
    fields: pronunciations = [],
    append,
    remove,
  } = useFieldArray({
    control,
    name: formName,
  });
  const permissions = usePermissions();
  const speakerIds = pronunciations.map(({ speaker: speakerId }) => speakerId);
  const speakers = useFetchSpeakers({ permissions, setIsLoading: setIsLoadingSpeakers, speakerIds });

  const archivedPronunciations = pronunciations.filter(({ archived = false }) => archived);

  const handleAppend = () =>
    append({
      audio: '',
      speaker: uid,
      archived: false,
    });

  const generateDeleteMessage = (archiving: boolean) =>
    archiving
      ? `This is an existing example pronunciation. Clicking this button will NOT 
    permanently delete the example pronunciation, rather it will be archived 
    (saved) but hidden.`
      : `This is a new example pronunciation. Clicking on this 
    button will delete it permanently.`;

  const handleArchivePronunciation = (shouldArchive: boolean, index: number) => () => {
    if (shouldArchive) {
      const currentPronunciation = assign(pronunciations[index]);
      const currentPronunciations = assign(pronunciations);
      currentPronunciation.archived = true;
      currentPronunciations[index] = currentPronunciation;
      setValue(`${formName}[${index}]`, currentPronunciation);
      setInternalPronunciations(currentPronunciations);
    } else {
      remove(index);
    }
  };
  return (
    <Box width="full">
      <FormHeader
        title="Sentence Recordings"
        tooltip="An example can have multiple audio recorded for it. One on unique
        speaker can record a version for this sentence."
      />
      <AddAudioPronunciationButton onClick={handleAppend} />
      <Box mb={4} width="full">
        {pronunciations?.length ? (
          pronunciations.map((pronunciation, index) => {
            const isExistingPronunciation = get(record, `${formName}[${index}].audio`);
            const deleteMessage = generateDeleteMessage(isExistingPronunciation);
            return (
              <Box className="flex flex-col" key={isExistingPronunciation}>
                {pronunciation.archived ? (
                  <Text fontSize="sm" fontStyle="italic" color="orange.700">
                    This example pronunciation will <chakra.span fontWeight="bold">NOT</chakra.span> be deleted. It will
                    be saved and archived.
                  </Text>
                ) : null}
                <Box
                  className="flex flex-row justify-between items-center rounded"
                  backgroundColor={pronunciation.archived ? 'orange.200' : ''}
                  cursor={pronunciation.archived ? 'pointer' : ''}
                  p={2}
                >
                  <Controller
                    render={({ field: props }) => (
                      <input style={{ position: 'absolute', visibility: 'hidden' }} {...props} />
                    )}
                    name={`${formName}[${index}].audio`}
                    control={control}
                    defaultValue={pronunciation.audio}
                  />
                  <Controller
                    render={({ field: props }) => (
                      <input style={{ position: 'absolute', visibility: 'hidden' }} {...props} />
                    )}
                    name={`${formName}[${index}].speaker`}
                    control={control}
                    defaultValue={pronunciation.speaker}
                  />
                  <Controller
                    render={({ field: props }) => (
                      <input style={{ position: 'absolute', visibility: 'hidden' }} {...props} />
                    )}
                    name={`${formName}[${index}].archived`}
                    control={control}
                    defaultValue={pronunciation.archived}
                  />
                  <AudioRecorder
                    path={`${formName}.${index}.audio`}
                    getFormValues={() => get(getValues(), `${formName}.${index}.audio`)}
                    setPronunciation={(_, value) => {
                      setValue(`${formName}[${index}].audio`, value);
                      setValue(`${formName}[${index}].speaker`, uid);
                    }}
                    record={record}
                    originalRecord={originalRecord}
                    formTitle=""
                    formTooltip=""
                  />
                  <ResourceConnectionButton
                    tooltip={deleteMessage}
                    shouldArchive={isExistingPronunciation}
                    onClick={handleArchivePronunciation(!!isExistingPronunciation, index)}
                  />
                </Box>
              </Box>
            );
          })
        ) : (
          <Box className="flex w-full justify-center mb-2">
            <Text className="italic text-gray-700" fontFamily="Silka">
              No audio pronunciations
            </Text>
          </Box>
        )}
      </Box>
      {archivedPronunciations.length ? (
        <ShowTextRenderer title="Archived pronunciations" icon={<LuArchive />}>
          {archivedPronunciations.map((archivedPronunciation, archivedPronunciationIndex) => (
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
    </Box>
  );
};

export default ExampleAudioPronunciationsForm;
