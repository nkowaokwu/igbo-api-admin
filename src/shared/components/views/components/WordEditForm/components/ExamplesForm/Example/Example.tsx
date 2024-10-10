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
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import getRecordLanguages from 'src/shared/utils/getRecordLanguages';
import AudioRecorder from '../../../../AudioRecorder';
import ExamplesInterface from './ExamplesInterface';
import NsibidiInput from '../../NsibidiForm/NsibidiInput';

const Example = ({ example, index, remove, control, setValue, getValues }: ExamplesInterface): ReactElement => {
  const [originalRecord, setOriginalRecord] = useState(null);
  const uid = useFirebaseUid();
  const {
    source = { language: LanguageEnum.UNSPECIFIED, text: '', pronunciations: [] },
    translations = [{ language: LanguageEnum.UNSPECIFIED, text: '', pronunciations: [] }],
    meaning = '',
    nsibidi = '',
    associatedWords = [],
    exampleId = '',
    originalExampleId,
  } = example;
  const [isExistingExample, setIsExistingExample] = useState(!!originalExampleId);
  const { sourceLanguage, destinationLanguage } = getRecordLanguages(example);
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
    <Box className="list-container" key={`${exampleId}-${get(source, 'text')}-${get(translations, '0.text')}`}>
      <Box
        data-example-id={exampleId}
        data-original-example-id={originalExampleId}
        data-associated-words={associatedWords}
        className="flex flex-col w-full space-y-3"
      >
        <Controller
          render={({ field: props }) => (
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
        <h3 className="text-gray-700">{`${sourceLanguage}:`}</h3>
        <Controller
          render={({ field: props }) => (
            <Input {...props} placeholder={`Example in ${sourceLanguage}`} data-test={`examples-${index}-igbo-input`} />
          )}
          name={`examples[${index}].source.text`}
          defaultValue={get(source, 'text')}
          control={control}
        />
        <h3 className="text-gray-700">{`${destinationLanguage}:`}</h3>
        <Controller
          render={({ field: props }) => (
            <Input
              {...props}
              placeholder="Example in English (literal)"
              data-test={`examples-${index}-english-input`}
            />
          )}
          name={`examples[${index}].translations.0.text`}
          defaultValue={get(source, 'translations.0.text')}
          control={control}
        />
        <h3 className="text-gray-700">Meaning:</h3>
        <Controller
          render={({ field: props }) => (
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
          render={({ field: props }) => (
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
        {source.pronunciations?.length ? (
          source.pronunciations.map((_, pronunciationIndex) => (
            <>
              <input
                style={{ position: 'absolute', pointerEvents: 'none', opacity: 0 }}
                name={`examples[${index}].source.pronunciations[${pronunciationIndex}].audio`}
                ref={control.register}
                defaultValue={source.pronunciations[pronunciationIndex]?.audio}
              />
              <input
                style={{ position: 'absolute', pointerEvents: 'none', opacity: 0 }}
                name={`examples[${index}].source.pronunciations[${pronunciationIndex}].speaker`}
                ref={control.register}
                defaultValue={source.pronunciations[pronunciationIndex]?.speaker}
              />
            </>
          ))
        ) : (
          <>
            <input
              style={{ position: 'absolute', pointerEvents: 'none', opacity: 0 }}
              name={`examples[${index}].pronunciations[0].audio`}
              ref={control.register}
              defaultValue={source.pronunciations[0]?.audio}
            />
            <input
              style={{ position: 'absolute', pointerEvents: 'none', opacity: 0 }}
              name={`examples[${index}].pronunciations[0].speaker`}
              ref={control.register}
              defaultValue={source.pronunciations[0]?.speaker}
            />
          </>
        )}
        {/* Only updates the first audio in the example's pronunciation array */}
        <AudioRecorder
          path="pronunciations[0].audio"
          getFormValues={() => get(getValues(), `examples[${index}].pronunciations[0].audio`)}
          setPronunciation={(_, value) => {
            if (!get(getValues(), `examples[${index}].pronunciations[0]`)) {
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
