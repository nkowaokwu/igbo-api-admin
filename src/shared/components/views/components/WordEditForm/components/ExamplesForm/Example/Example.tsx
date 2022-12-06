import React, { ReactElement, useEffect, useState } from 'react';
import { Box, IconButton, Spinner } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { Controller } from 'react-hook-form';
import { Input } from 'src/shared/primitives';
import network from 'src/utils/dataProvider';
import Collection from 'src/shared/constants/Collections';
import AudioRecorder from '../../../../AudioRecorder';
import ExamplesInterface from './ExamplesInterface';

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
    id = '',
    associatedWords,
    associatedDefinitionsSchemas,
    pronunciation,
    originalExampleId,
  } = example;
  const formData = getValues();

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

  const handleSetPronunciation = (path, value) => {
    // Setting the react-hook-form value
    setValue(path, value);
    const updatedExamples = [...examples];
    updatedExamples[index].pronunciation = value;
    // Setting the local WordEditForm value
    setExamples(updatedExamples);
  };

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
              onChange={handleInputEnglish(onChange)}
              className="form-input"
              placeholder="Example in English (meaning)"
              data-test={`examples-${index}-meaning-input`}
            />
          )}
          name={`examples[${index}].meaning`}
          defaultValue={meaning || (formData.examples && formData.examples[index]?.meaning) || ''}
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
        <Box position="absolute">
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
      <IconButton
        colorScheme="red"
        aria-label="Delete Example"
        onClick={() => {
          const updateExamples = [...examples];
          updateExamples.splice(index, 1);
          setExamples(updateExamples);
        }}
        className="ml-3"
        icon={<DeleteIcon />}
      />
    </Box>
  ) : <Spinner />;
};

export default Example;
