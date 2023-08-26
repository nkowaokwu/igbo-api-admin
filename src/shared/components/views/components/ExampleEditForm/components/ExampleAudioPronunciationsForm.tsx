import React, { ReactElement, useState } from 'react';
import { assign, get } from 'lodash';
import { Box, Text, chakra } from '@chakra-ui/react';
import { Record, usePermissions } from 'react-admin';
import ReactAudioPlayer from 'react-audio-player';
import { Controller, Control, useFieldArray } from 'react-hook-form';
import ArchiveButton from 'src/shared/components/buttons/ArchiveButton';
import SummaryList from 'src/shared/components/views/shows/components/SummaryList';
import SpeakerNameManager from 'src/Core/Collections/components/SpeakerNameManager/SpeakerNameManager';
import useFetchSpeakers from 'src/hooks/useFetchSpeakers';
import AddAudioPronunciationButton from './AddAudioPronunciationButton';
import FormHeader from '../../FormHeader';
import AudioRecorder from '../../AudioRecorder';

const ExampleAudioPronunciationsForm = ({
  control,
  record,
  originalRecord,
  uid,
}: {
  control: Control;
  record: Record;
  originalRecord: Record | null;
  uid: string;
}): ReactElement => {
  const [isLoadingSpeakers, setIsLoadingSpeakers] = useState(false);
  const [, setInternalPronunciations] = useState([]);
  const {
    fields: pronunciations = [],
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'pronunciations',
  });
  const permissions = usePermissions();
  const speakerIds = pronunciations.map(({ speaker: speakerId }) => speakerId);
  const speakers = useFetchSpeakers({ permissions, setIsLoading: setIsLoadingSpeakers, speakerIds });

  const { getValues, setValue } = control;
  const archivedPronunciations = pronunciations.filter(({ archived = false }) => archived);

  const handleAppend = () =>
    append({
      audio: '',
      speaker: uid,
      approvals: [],
      denials: [],
      archived: false,
      review: true,
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
      setValue(`pronunciations[${index}]`, currentPronunciation);
      setInternalPronunciations(currentPronunciations);
    } else {
      remove(index);
    }
  };
  return (
    <Box>
      <FormHeader
        title="Igbo Sentence Recordings"
        tooltip="An example can have multiple audio recorded for it. One on unique
        speaker can record a version for this sentence."
      />
      {pronunciations?.length ? (
        pronunciations.map((pronunciation, index) => {
          const isExistingPronunciation = get(record, `pronunciations[${index}].audio`);
          const deleteMessage = generateDeleteMessage(isExistingPronunciation);
          return (
            <Box className="flex flex-col" key={isExistingPronunciation}>
              {pronunciation.archived ? (
                <Text fontSize="sm" fontStyle="italic" color="orange.700">
                  This example pronunciation will <chakra.span fontWeight="bold">NOT</chakra.span> be deleted. It will
                  be saved and archived
                </Text>
              ) : null}
              <Box
                className={`flex flex-row justify-between items-center p-4 rounded ${
                  pronunciation.archived ? 'bg-orange-200 pointer' : ''
                }`}
              >
                <Controller
                  render={(props) => <input style={{ position: 'absolute', visibility: 'hidden' }} {...props} />}
                  name={`pronunciations[${index}].audio`}
                  control={control}
                  defaultValue={pronunciation.audio}
                />
                <Controller
                  render={(props) => <input style={{ position: 'absolute', visibility: 'hidden' }} {...props} />}
                  name={`pronunciations[${index}].speaker`}
                  control={control}
                  defaultValue={pronunciation.speaker}
                />
                <Controller
                  render={(props) => <input style={{ position: 'absolute', visibility: 'hidden' }} {...props} />}
                  name={`pronunciations[${index}].archived`}
                  control={control}
                  defaultValue={pronunciation.archived}
                />
                <AudioRecorder
                  path={`pronunciations.${index}.audio`}
                  getFormValues={() => get(getValues(), `pronunciations.${index}.audio`)}
                  setPronunciation={(_, value) => {
                    setValue(`pronunciations[${index}].audio`, value);
                    setValue(`pronunciations[${index}].speaker`, uid);
                  }}
                  record={record}
                  originalRecord={originalRecord}
                  formTitle=""
                  formTooltip=""
                />
                <ArchiveButton
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
      <AddAudioPronunciationButton onClick={handleAppend} />
      <SummaryList
        items={archivedPronunciations}
        title="Archived Example Pronunciations 🗄"
        render={(archivedPronunciation, archivedPronunciationIndex) => (
          <>
            <Text color="gray.600" mr={3}>{`${archivedPronunciationIndex + 1}.`}</Text>
            <Box>
              <ReactAudioPlayer src={archivedPronunciation.audio} style={{ height: '40px', width: '250px' }} controls />
              <SpeakerNameManager
                isLoading={isLoadingSpeakers}
                speakers={speakers}
                index={archivedPronunciationIndex}
              />
            </Box>
          </>
        )}
      />
    </Box>
  );
};

export default ExampleAudioPronunciationsForm;
