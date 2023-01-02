import React, { ReactElement, useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Spinner,
  Tooltip,
} from '@chakra-ui/react';
import { Controller } from 'react-hook-form';
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
  control,
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
    associatedDefinitionsSchemas,
    pronunciation,
    originalExampleId,
  } = example;
  const formData = getValues();
  const [isExistingExample, setIsExistingExample] = useState(!!originalExampleId);
  const deleteMessage = isExistingExample
    ? `This is an existing example suggestion that is being updated. Clicking this button will NOT
    permanently delete the example sentence, rather it will be archived (saved) but hidden.`
    : 'This is a new example suggestion. Clicking this button will delete it permanently.';

  const handleInputIgbo = (onChange) => (e) => {
    const updatedExamples = [...examples];
    updatedExamples[index].igbo = e.target.value;
    onChange(e);
  };

  const handleInputEnglish = (onChange) => (e) => {
    const updatedExamples = [...examples];
    updatedExamples[index].english = e.target.value;
    onChange(e);
  };

  const handleInputMeaning = (onChange) => (e) => {
    const updatedExamples = [...examples];
    updatedExamples[index].meaning = e.target.value;
    onChange(e);
  };

  const handleInputNsibidi = (onChange) => (e) => {
    const updatedExamples = [...examples];
    updatedExamples[index].nsibidi = e.target.value;
    onChange(e);
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
        <Controller
          render={({ onChange, ...props }) => (
            <Input
              {...props}
              onChange={handleInputIgbo(onChange)}
              className="form-input"
              placeholder="Example in Igbo"
              data-test={`examples-${index}-igbo-input`}
            />
          )}
          name={`examples[${index}].igbo`}
          defaultValue={igbo || (formData.examples && formData.examples[index]?.igbo) || ''}
          control={control}
        />
        <h3 className="text-gray-700">English:</h3>
        <Controller
          render={({ onChange, ...props }) => (
            <Input
              {...props}
              onChange={handleInputEnglish(onChange)}
              className="form-input"
              placeholder="Example in English (literal)"
              data-test={`examples-${index}-english-input`}
            />
          )}
          name={`examples[${index}].english`}
          defaultValue={english || (formData.examples && formData.examples[index]?.english) || ''}
          control={control}
        />
        <h3 className="text-gray-700">Meaning:</h3>
        <Controller
          render={({ onChange, ...props }) => (
            <Input
              {...props}
              onChange={handleInputMeaning(onChange)}
              className="form-input"
              placeholder="Example in English (meaning)"
              data-test={`examples-${index}-meaning-input`}
            />
          )}
          name={`examples[${index}].meaning`}
          defaultValue={meaning || (formData.examples && formData.examples[index]?.meaning) || ''}
          control={control}
        />
        <h3 className="text-gray-700">Nsịbịdị:</h3>
        <Controller
          render={({ onChange, ...props }) => (
            <NsibidiInput
              {...props}
              onChange={handleInputNsibidi(onChange)}
              placeholder="Example in Nsịbịdị"
              data-test={`examples-${index}-nsibidi-input`}
            />
          )}
          name={`examples[${index}].nsibidi`}
          defaultValue={nsibidi || (formData.examples && formData.examples[index]?.nsibidi) || ''}
          control={control}
        />
        <Controller
          render={() => (
            <div>
              <AudioRecorder
                path={`examples[${index}]`}
                getFormValues={getValues}
                setPronunciation={handleSetPronunciation}
                record={example}
                originalRecord={originalRecord}
                formTitle="Igbo Sentence Recording"
                formTooltip="Record the audio for the Igbo example sentence only one time.
                You are able to record over pre-existing recordings."
              />
            </div>
          )}
          defaultValue={pronunciation}
          name={`examples[${index}].pronunciation`}
          control={control}
        />
        <Box position="absolute" pointerEvents="none">
          <Controller
            render={(props) => (
              <Input
                {...props}
                className="form-input invisible"
                placeholder="Original Example Id"
                data-test={`examples-${index}-originalExampleId`}
              />
            )}
            name={`examples[${index}].originalExampleId`}
            defaultValue={originalExampleId}
            control={control}
          />
          <Controller
            render={(props) => (
              <Input
                {...props}
                className="form-input invisible"
                placeholder="Example Id"
                data-test={`examples-${index}-id`}
              />
            )}
            name={`examples[${index}].id`}
            defaultValue={id}
            control={control}
          />
          <Controller
            render={(props) => (
              <Input
                {...props}
                className="form-input invisible"
                placeholder="Associated Definitions Schema"
                data-test={`examples-${index}-associatedDefinitionsSchemas`}
              />
            )}
            name={`examples[${index}].associatedDefinitionsSchemas`}
            defaultValue={associatedDefinitionsSchemas}
            control={control}
          />
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
