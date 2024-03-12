import React, { ReactElement, useEffect, useState } from 'react';
import { get } from 'lodash';
import { Box, Spinner } from '@chakra-ui/react';
import { Controller } from 'react-hook-form';
import { Input } from 'src/shared/primitives';
import network from 'src/utils/dataProvider';
import Collection from 'src/shared/constants/Collection';
import useFirebaseUid from 'src/hooks/useFirebaseUid';
import ResourceConnectionButton from 'src/shared/components/buttons/ResourceConnectionButton';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import AudioRecorder from '../../../../AudioRecorder';
import ExamplesInterface from './ExamplesInterface';
import NsibidiInput from '../../NsibidiForm/NsibidiInput';

const Example = ({ example, index, remove, control, setValue }: ExamplesInterface): ReactElement => {
  const [originalRecord, setOriginalRecord] = useState(null);
  const uid = useFirebaseUid();
  const {
    igbo = '',
    english = '',
    meaning = '',
    pronunciations = [],
    nsibidi = '',
    exampleId = '',
    associatedWords = [],
    originalExampleId,
  } = example;
  const [isExistingExample, setIsExistingExample] = useState(!!originalExampleId);
  const deleteMessage = isExistingExample
    ? `This is an existing example suggestion that is being updated. Clicking this button will NOT
    permanently delete the example sentence, rather it will be archived (saved) but hidden.`
    : 'This is a new example suggestion. Clicking this button will delete it permanently.';

  useEffect(() => {
    setIsExistingExample(!!originalExampleId);
  }, [example]);

  useEffect(() => {
    (async () => {
      setOriginalRecord(
        originalExampleId ? await network.getOne(Collection.EXAMPLES, { id: originalExampleId }) : example,
      );
    })();
  }, []);

  return originalRecord ? (
    <Box className="list-container" key={`${exampleId}-${igbo}-${english}`}>
      <Box
        data-example-id={exampleId}
        data-original-example-id={originalExampleId}
        data-associated-words={associatedWords}
        className="flex flex-col w-full space-y-3"
      >
        <Controller
          render={(props) => (
            <input
              {...props}
              style={{ opacity: 0, pointerEvents: 'none', position: 'absolute' }}
              data-test={`examples-${index}-igbo-id`}
            />
          )}
          name={`examples.${index}.exampleId`}
          defaultValue={exampleId}
          control={control}
        />
        <h3 className="text-gray-700">Igbo:</h3>
        <Controller
          render={(props) => (
            <Input {...props} placeholder="Example in Igbo" data-test={`examples-${index}-igbo-input`} />
          )}
          name={`examples[${index}].igbo`}
          defaultValue={igbo}
          control={control}
        />
        <h3 className="text-gray-700">English:</h3>
        <Controller
          render={(props) => (
            <Input
              {...props}
              placeholder="Example in English (literal)"
              data-test={`examples-${index}-english-input`}
            />
          )}
          name={`examples[${index}].english`}
          defaultValue={english}
          control={control}
        />
        <h3 className="text-gray-700">Meaning:</h3>
        <Controller
          render={(props) => (
            <Input
              {...props}
              placeholder="Example in English (meaning)"
              data-test={`examples-${index}-meaning-input`}
            />
          )}
          name={`examples[${index}].meaning`}
          defaultValue={meaning}
          control={control}
        />
        <h3 className="text-gray-700">Nsịbịdị:</h3>
        <Controller
          render={(props) => (
            <NsibidiInput
              {...props}
              placeholder="Example in Nsịbịdị"
              data-test={`examples-${index}-nsibidi-input`}
              nsibidiFormName={`examples[${index}].nsibidiCharacters`}
              control={control}
            />
          )}
          name={`examples[${index}].nsibidi`}
          defaultValue={nsibidi}
          control={control}
        />
        <input
          style={{ position: 'absolute', pointerEvents: 'none', opacity: 0 }}
          name={`examples[${index}].style.value`}
          ref={control.register}
          defaultValue={get(example, 'style.value') || ExampleStyleEnum.NO_STYLE}
        />
        <input
          style={{ position: 'absolute', pointerEvents: 'none', opacity: 0 }}
          name={`examples[${index}].style.label`}
          ref={control.register}
          defaultValue={get(example, 'style.label') || ExampleStyle[ExampleStyleEnum.NO_STYLE].label}
        />
        {pronunciations?.length ? (
          pronunciations.map((_, pronunciationIndex) => (
            <>
              <input
                style={{ position: 'absolute', pointerEvents: 'none', opacity: 0 }}
                name={`examples[${index}].pronunciations[${pronunciationIndex}].audio`}
                ref={control.register}
                defaultValue={pronunciations[pronunciationIndex]?.audio}
              />
              <input
                style={{ position: 'absolute', pointerEvents: 'none', opacity: 0 }}
                name={`examples[${index}].pronunciations[${pronunciationIndex}].speaker`}
                ref={control.register}
                defaultValue={pronunciations[pronunciationIndex]?.speaker}
              />
            </>
          ))
        ) : (
          <>
            <input
              style={{ position: 'absolute', pointerEvents: 'none', opacity: 0 }}
              name={`examples[${index}].pronunciations[0].audio`}
              ref={control.register}
              defaultValue={pronunciations[0]?.audio}
            />
            <input
              style={{ position: 'absolute', pointerEvents: 'none', opacity: 0 }}
              name={`examples[${index}].pronunciations[0].speaker`}
              ref={control.register}
              defaultValue={pronunciations[0]?.speaker}
            />
          </>
        )}
        {/* Only updates the first audio in the example's pronunciation array */}
        <AudioRecorder
          path="pronunciations[0].audio"
          getFormValues={() => get(control.getValues(), `examples[${index}].pronunciations[0].audio`)}
          setPronunciation={(_, value) => {
            if (!get(control.getValues(), `examples[${index}].pronunciations[0]`)) {
              setValue(`examples[${index}].pronunciations`, [{ audio: value, speaker: uid }]);
            } else {
              setValue(`examples[${index}].pronunciations[0].audio`, value);
              setValue(`examples[${index}].pronunciations[0].speaker`, uid);
            }
          }}
          record={example}
          originalRecord={originalRecord}
          formTitle="Igbo Sentence Recording"
          formTooltip="Record the audio for the Igbo example sentence only one time.
          You are able to record over pre-existing recordings."
        />
      </Box>
      <ResourceConnectionButton
        tooltip={deleteMessage}
        shouldArchive={isExistingExample}
        onClick={() => remove(index)}
      />
    </Box>
  ) : (
    <Spinner />
  );
};

export default Example;
