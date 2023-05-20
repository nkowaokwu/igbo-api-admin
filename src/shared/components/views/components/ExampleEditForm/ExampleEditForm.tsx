import React, { ReactElement, useState, useEffect } from 'react';
import {
  assign,
  map,
  omit,
  pick,
} from 'lodash';
import { Box, Button, useToast } from '@chakra-ui/react';
import { Record, useNotify, useRedirect } from 'react-admin';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import { EditFormProps } from 'src/shared/interfaces';
import { getExample } from 'src/shared/API';
import removePayloadFields from 'src/shared/utils/removePayloadFields';
import View from 'src/shared/constants/Views';
import useBeforeWindowUnload from 'src/hooks/useBeforeWindowUnload';
import { Textarea, Input } from 'src/shared/primitives';
import { handleUpdateDocument } from 'src/shared/constants/actionsMap';
import ActionTypes from 'src/shared/constants/ActionTypes';
import ExampleEditFormResolver from './ExampleEditFormResolver';
import { onCancel, sanitizeArray, sanitizeWith } from '../utils';
import FormHeader from '../FormHeader';
import AssociatedWordsForm from './components/AssociatedWordsForm';
import AudioRecorder from '../AudioRecorder';
import NsibidiForm from '../WordEditForm/components/NsibidiForm';

const ExampleEditForm = ({
  view,
  record,
  save,
  resource = '',
  history,
  isPreExistingSuggestion,
}: EditFormProps) : ReactElement => {
  const style = pick(Object.values(ExampleStyle).find(({ value }) => value === record.style), ['value', 'label'])
    || { value: '', label: '' };
  const {
    handleSubmit,
    getValues,
    setValue,
    control,
    errors,
  } = useForm({
    defaultValues: {
      ...record,
      style,
      nsibidiCharacters: (record?.nsibidiCharacters || []).map((nsibidiCharacterId) => ({ id: nsibidiCharacterId })),
      associatedWords: (record?.associatedWords || []).map((associatedWordId) => ({ id: associatedWordId })),
    },
    ...ExampleEditFormResolver,
  });
  const [originalRecord, setOriginalRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notify = useNotify();
  const redirect = useRedirect();
  const toast = useToast();
  const options = Object.values(ExampleStyle).map(({ value, label }) => ({ value, label }));

  useEffect(() => {
    if (isPreExistingSuggestion) {
      toast({
        title: 'Pre-existing Example Suggestion',
        description: "We've redirected you to a pre-existing example suggestion, to avoid suggestion duplication.",
        status: 'info',
        duration: 9000,
        isClosable: true,
      });
    }
    (async () => {
      if (record.originalExampleId) {
        setOriginalRecord(await getExample(record.originalExampleId));
      }
    })();
  }, []);

  /* Grabs the user form data that will be cached */
  const createCacheExampleData = (data: any, record: Record = { id: null }) => {
    const cleanedData = {
      ...record,
      ...data,
      associatedDefinitionsSchemas: sanitizeArray(record.associatedDefinitionsSchemas || []),
      style: data.style.value,
      associatedWords: sanitizeWith(data.associatedWords || []),
      nsibidiCharacters: sanitizeWith(data.nsibidiCharacters || []),
    };
    return cleanedData;
  };

  /* Combines the approvals, denials, and cached form data to
   * send to the backend
   */
  const onSubmit = (data) => {
    try {
      setIsSubmitting(true);
      const preparedData = omit(assign(
        {
          ...record,
          ...data,
        },
        createCacheExampleData(data, record),
        {
          approvals: map(record.approvals, (approval) => approval.uid),
          denials: map(record.denials, (denial) => denial.uid),
        },
      ), [view === View.CREATE ? 'id' : '', 'type']);
      const cleanedData = removePayloadFields(preparedData);
      localStorage.removeItem('igbo-api-admin-form');
      save(cleanedData, View.SHOW, {
        onSuccess: ({ data }) => {
          setIsSubmitting(false);
          handleUpdateDocument({ type: ActionTypes.NOTIFY, resource, record: data });
          notify(`Document successfully ${view === View.CREATE ? 'created' : 'updated'}`, 'info');
          redirect(View.SHOW, '/exampleSuggestions', data.id || record.id, { ...data, id: data.id || record.id });
        },
        onFailure: (err: any) => {
          const { body, message } = err;
          toast({
            title: 'Error',
            description: body?.error || message || 'An error occurred while saving example suggestion',
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
          setIsSubmitting(false);
        },
      });
    } catch (err) {
      console.log(err);
      setIsSubmitting(false);
    }
  };

  useBeforeWindowUnload();

  /* Scroll back to the top to let the editor know an error occurred */
  useEffect(() => {
    if (Object.keys(errors || {}).length) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [errors]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box className="flex flex-col">
        {record.originalExampleId || (view === View.CREATE && record.id) ? (
          <>
            <h2 className="form-header">Parent Example Id:</h2>
            <Input
              data-test="original-id"
              value={record.originalExampleId || record.id}
              isDisabled
            />
          </>
        ) : null}
        <Box
          className="w-full flex flex-col lg:flex-row justify-between
          items-center space-y-4 lg:space-y-0 lg:space-x-6"
        >
          <Box className="flex flex-col w-full">
            <FormHeader
              title="Sentence Style"
              tooltip="Select the style or figure of speech that this sentence is using."
            />
            <Box data-test="sentence-style-input-container">
              <Controller
                render={(props) => (
                  <Select
                    {...props}
                    options={options}
                  />
                )}
                name="style"
                control={control}
                defaultValue={style}
              />
            </Box>
            {errors.style ? (
              <p className="error">{errors.style.message}</p>
            ) : null}
          </Box>
          <Controller
            render={() => (
              <AudioRecorder
                path="headword"
                getFormValues={getValues}
                setPronunciation={setValue}
                record={record}
                originalRecord={originalRecord}
                formTitle="Igbo Sentence Recording"
                formTooltip="Record the audio for the Igbo example sentence only one time.
                You are able to record over pre-existing recordings."
              />
            )}
            defaultValue={record.pronunciation || ''}
            name="pronunciation"
            control={control}
          />
        </Box>
        <FormHeader
          title="Igbo"
          tooltip="The example sentence in Standard Igbo"
        />
        <Controller
          render={(props) => (
            <Input
              {...props}
              placeholder="Biko"
              data-test="igbo-input"
            />
          )}
          name="igbo"
          control={control}
          defaultValue={record.igbo || getValues().igbo || ''}
        />
        {errors.igbo ? (
          <p className="error">Igbo is required</p>
        ) : null}
      </Box>
      <Box className="flex flex-col">
        <FormHeader
          title="English"
          tooltip="The example sentence in English. This is the the literal English translation of the Igbo sentence."
        />
        <Controller
          render={(props) => (
            <Input
              {...props}
              placeholder="Please"
              data-test="english-input"
            />
          )}
          name="english"
          control={control}
          defaultValue={record.english || getValues().english || ''}
        />
        {errors.english ? (
          <p className="error">English is required</p>
        ) : null}
      </Box>
      <Box className="flex flex-col">
        <FormHeader
          title="Meaning"
          tooltip="This field showcases the meaning of the sentence - typically for proverbs"
        />
        <Controller
          render={(props) => (
            <Input
              {...props}
              placeholder="Please"
              data-test="english-input"
            />
          )}
          name="meaning"
          control={control}
          defaultValue={record.meaning || getValues().meaning || ''}
        />
        {errors.meaning ? (
          <p className="error">{errors.meaning.message}</p>
        ) : null}
      </Box>
      <NsibidiForm
        control={control}
        errors={errors}
        name="nsibidi"
      />
      <Box className="mt-2">
        <AssociatedWordsForm
          errors={errors}
          control={control}
          record={record}
        />
      </Box>
      <Box className="flex flex-col">
        <FormHeader
          title="Editor's Comments"
          tooltip={`Leave a comment for other editors to read to 
          understand your reasoning behind your change. 
          Leave your name on your comment!`}
        />
        <Controller
          render={(props) => (
            <Textarea
              {...props}
              className="form-textarea"
              placeholder="Comments"
              rows={8}
            />
          )}
          name="editorsNotes"
          defaultValue={record.editorsNotes || ''}
          control={control}
        />
      </Box>
      <Box className="flex flex-row items-center form-buttons-container space-y-4 lg:space-y-0 lg:space-x-4">
        <Button
          className="mt-3 lg:my-0"
          backgroundColor="gray.300"
          onClick={() => onCancel({ view, resource, history })}
          disabled={isSubmitting}
          width="full"
        >
          Cancel
        </Button>
        <Button
          data-test="example-submit-button"
          type="submit"
          colorScheme="green"
          variant="solid"
          className="m-0"
          isLoading={isSubmitting}
          loadingText={view === View.CREATE ? 'Submitting' : 'Updating'}
          width="full"
        >
          {view === View.CREATE ? 'Submit' : 'Update'}
        </Button>
      </Box>
    </form>
  );
};

export default ExampleEditForm;
