import React, { ReactElement, useEffect, useState } from 'react';
import { get } from 'lodash';
import {
  Box,
  IconButton,
  Spinner,
  Tooltip,
} from '@chakra-ui/react';
import { Input } from 'src/shared/primitives';
import network from 'src/utils/dataProvider';
import Collection from 'src/shared/constants/Collections';
import AudioRecorder from '../../../../AudioRecorder';
import ExamplesInterface from './ExamplesInterface';
import NsibidiInput from '../../NsibidiForm/NsibidiInput';

const Example = ({
  setExamples,
  examples,
  example,
  getValues,
  setValue,
  index,
}: ExamplesInterface): ReactElement => {
  const [originalRecord, setOriginalRecord] = useState(null);
  const {
    igbo,
    english,
    meaning,
    nsibidi,
    id = '',
    associatedWords,
    originalExampleId,
  } = example;
  const formData = getValues();
  const [isExistingExample, setIsExistingExample] = useState(!!originalExampleId);
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

  const handleSetPronunciation = (path, value) => {
    // Setting the react-hook-form value
    setValue(path, value);
    const updatedExamples = [...examples];
    updatedExamples[index].pronunciation = value;
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
          className="form-input"
          placeholder="Example in Igbo"
          data-test={`examples-${index}-igbo-input`}
          defaultValue={igbo || (formData.examples && formData.examples[index]?.igbo) || ''}
        />
        <h3 className="text-gray-700">English:</h3>
        <Input
          onChange={handleInputEnglish}
          className="form-input"
          placeholder="Example in English (literal)"
          data-test={`examples-${index}-english-input`}
          defaultValue={english || (formData.examples && formData.examples[index]?.english) || ''}
        />
        <h3 className="text-gray-700">Meaning:</h3>
        <Input
          onChange={handleInputMeaning}
          className="form-input"
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
        <AudioRecorder
          path={`examples[${index}]`}
          getFormValues={(path) => path.startsWith('examples') ? example : get(example, path)}
          setPronunciation={handleSetPronunciation}
          record={example}
          originalRecord={originalRecord}
          formTitle="Igbo Sentence Recording"
          formTooltip="Record the audio for the Igbo example sentence only one time.
          You are able to record over pre-existing recordings."
        />
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
            setValue('examples', []);
          }}
          className="ml-3"
          icon={isExistingExample ? (() => <>🗄</>)() : (() => <>🗑</>)()}
        />
      </Tooltip>
    </Box>
  ) : <Spinner />;
};

export default Example;
