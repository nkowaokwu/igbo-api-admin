import React, {
  ReactElement,
  useEffect,
  useState,
  useRef,
} from 'react';
import { set } from 'lodash';
import {
  Box,
  Button,
  IconButton,
  Spinner,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { Input } from 'src/shared/primitives';
import network from 'src/utils/dataProvider';
import Collection from 'src/shared/constants/Collections';
import useFirebaseUid from 'src/hooks/useFirebaseUid';
import ExamplePronunciation from 'src/shared/components/ExamplePronunciation';
import DeleteAudioPronunciationAlert from 'src/shared/components/DeleteAudioPronunciationAlert';
import ExamplesInterface from './ExamplesInterface';
import NsibidiInput from '../../NsibidiForm/NsibidiInput';

const Example = ({
  setExamples,
  examples,
  example,
  getValues,
  index,
}: ExamplesInterface): ReactElement => {
  const [originalRecord, setOriginalRecord] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const addSentenceRecordingRef = useRef<HTMLButtonElement>(null);
  const {
    igbo,
    english,
    meaning,
    nsibidi,
    pronunciations,
    id = '',
    associatedWords,
    originalExampleId,
  } = example;
  const formData = getValues();
  const [isExistingExample, setIsExistingExample] = useState(!!originalExampleId);
  const [firebaseUid, setFirebaseUid] = useState('');
  const [pronunciationIndex, setPronunciationIndex] = useState(-1);
  useFirebaseUid(setFirebaseUid);

  const handleOpenAlert = (index) => {
    setPronunciationIndex(index);
    onOpen();
  };

  const handleCloseAlert = () => {
    setPronunciationIndex(-1);
    onClose();
  };

  const deleteMessage = isExistingExample
    ? `This is an existing example suggestion that is being updated. Clicking this button will NOT
    permanently delete the example sentence, rather it will be archived (saved) but hidden.`
    : 'This is a new example suggestion. Clicking this button will delete it permanently.';

  const handleInputIgbo = (e) => {
    const updatedExamples = [...examples];
    updatedExamples[index].igbo = e.target.value;
  };

  const handleInputEnglish = (e) => {
    const updatedExamples = [...examples];
    updatedExamples[index].english = e.target.value;
  };

  const handleInputMeaning = (e) => {
    const updatedExamples = [...examples];
    updatedExamples[index].meaning = e.target.value;
  };

  const handleInputNsibidi = (e) => {
    const updatedExamples = [...examples];
    updatedExamples[index].nsibidi = e.target.value;
  };

  const handleAddPronunciation = (value) => {
    // Setting the react-hook-form value
    const updatedExamples = [...examples];
    updatedExamples[index].pronunciations.push(value);
    // Setting the local WordEditForm value
    setExamples(updatedExamples);
  };

  const handleDeletePronunciation = () => {
    const updatedExamples = [...examples];
    const updatedPronunciations = updatedExamples[index].pronunciations;
    updatedPronunciations.splice(pronunciationIndex, 1);
    updatedExamples[index].pronunciations = updatedPronunciations;
    setExamples(updatedExamples);
    handleCloseAlert();
  };

  const handleSetPronunciation = (pronunciationPath: string, audioData: string) => {
    // Setting the react-hook-form value
    const updatedExamples = [...examples];
    const updatedAudioData = {
      audio: audioData,
      speaker: firebaseUid,
    };
    set(updatedExamples[index], pronunciationPath, updatedAudioData);
    // Setting the local WordEditForm value
    setExamples(updatedExamples);
  };

  useEffect(() => {
    setIsExistingExample(!!originalExampleId);
  }, [example]);

  useEffect(() => {
    (async () => {
      setOriginalRecord(
        originalExampleId
          ? await network.getOne(Collection.EXAMPLES, { id: originalExampleId })
          : example,
      );
    })();
  }, []);

  return originalRecord ? (
    <>
      <DeleteAudioPronunciationAlert
        isOpen={isOpen}
        onConfirm={handleDeletePronunciation}
        onClose={handleCloseAlert}
        cancelRef={addSentenceRecordingRef}
      />
      <Box className="list-container" key={`${id}-${igbo}-${english}`}>
        <Box
          data-example-id={id}
          data-original-example-id={originalExampleId}
          data-associated-words={associatedWords}
          className="flex flex-col w-full space-y-3"
        >
          <h3 className="text-gray-700">Igbo:</h3>
          <Input
            onChange={handleInputIgbo}
            placeholder="Example in Igbo"
            data-test={`examples-${index}-igbo-input`}
            defaultValue={igbo || (formData.examples && formData.examples[index]?.igbo) || ''}
          />
          <h3 className="text-gray-700">English:</h3>
          <Input
            onChange={handleInputEnglish}
            placeholder="Example in English (literal)"
            data-test={`examples-${index}-english-input`}
            defaultValue={english || (formData.examples && formData.examples[index]?.english) || ''}
          />
          <h3 className="text-gray-700">Meaning:</h3>
          <Input
            onChange={handleInputMeaning}
            placeholder="Example in English (meaning)"
            data-test={`examples-${index}-meaning-input`}
            defaultValue={meaning || (formData.examples && formData.examples[index]?.meaning) || ''}
          />
          <h3 className="text-gray-700">Nsịbịdị:</h3>
          <NsibidiInput
            onChange={handleInputNsibidi}
            placeholder="Example in Nsịbịdị"
            data-test={`examples-${index}-nsibidi-input`}
            defaultValue={nsibidi || (formData.examples && formData.examples[index]?.nsibidi) || ''}
          />
          <Box className="w-full space-y-2">
            <Tooltip label="This will add another sentence audio recording for the same example sentence.">
              <Button
                width="full"
                onClick={() => handleAddPronunciation('')}
                colorScheme="green"
                ref={addSentenceRecordingRef}
              >
                Add sentence recording
              </Button>
            </Tooltip>
            <Box className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pronunciations.map((pronunciation, index) => (
                <ExamplePronunciation
                  key={pronunciation.audio}
                  pronunciation={pronunciation}
                  index={index}
                  onOpenAlert={handleOpenAlert}
                  setPronunciation={handleSetPronunciation}
                  example={example}
                  originalRecord={originalRecord}
                />
              ))}
            </Box>
          </Box>
        </Box>
        <Tooltip label={deleteMessage}>
          <IconButton
            backgroundColor={isExistingExample ? 'orange.100' : 'red.100'}
            _hover={{
              backgroundColor: isExistingExample ? 'orange.200' : 'red.200',
            }}
            aria-label={isExistingExample ? 'Archive Example' : 'Delete Example'}
            onClick={() => {
              const updateExamples = [...examples];
              updateExamples.splice(index, 1);
              setExamples(updateExamples);
            }}
            className="ml-3"
            icon={isExistingExample ? (() => <>🗄</>)() : (() => <>🗑</>)()}
          />
        </Tooltip>
      </Box>
    </>
  ) : <Spinner />;
};

export default Example;
