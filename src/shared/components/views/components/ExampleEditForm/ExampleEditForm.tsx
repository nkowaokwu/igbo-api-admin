import React, { ReactElement, useState, useEffect } from 'react';
import {
  assign,
  map,
  omit,
} from 'lodash';
import { Box, Button, useToast } from '@chakra-ui/react';
import { Record, useNotify, useRedirect } from 'react-admin';
import { useForm, Controller } from 'react-hook-form';
import { EditFormProps } from 'src/shared/interfaces';
import { getExample } from 'src/shared/API';
import View from 'src/shared/constants/Views';
import useBeforeWindowUnload from 'src/hooks/useBeforeWindowUnload';
import useCacheForm from 'src/hooks/useCacheForm';
import { Textarea, Input } from 'src/shared/primitives';
import ExampleEditFormResolver from './ExampleEditFormResolver';
import { onCancel, sanitizeArray } from '../utils';
import FormHeader from '../FormHeader';
import AssociatedWordsForm from './components/AssociatedWordsForm';
import AudioRecorder from '../AudioRecorder';

const ExampleEditForm = ({
  view,
  record,
  save,
  resource = '',
  history,
  isPreExistingSuggestion,
}: EditFormProps) : ReactElement => {
  const {
    handleSubmit,
    getValues,
    setValue,
    control,
    errors,
  } = useForm({
    defaultValues: record,
    ...ExampleEditFormResolver,
  });
  const [originalRecord, setOriginalRecord] = useState(null);
  const [associatedWords, setAssociatedWords] = useState(
    record?.associatedWords?.length ? record.associatedWords : [''],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notify = useNotify();
  const redirect = useRedirect();
  const toast = useToast();

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
      associatedWords: sanitizeArray(data.associatedWords),
    };
    return cleanedData;
  };

  /* Combines the approvals, denials, and cached form data to
   * send to the backend
   */
  const onSubmit = (data) => {
    setIsSubmitting(true);
    const cleanedData = omit(assign(
      {
        ...record,
        ...data,
      },
      createCacheExampleData(data, record),
      {
        approvals: map(record.approvals, (approval) => approval.uid),
        denials: map(record.denials, (denial) => denial.uid),
      },
    ), [view === View.CREATE ? 'id' : '']);
    localStorage.removeItem('igbo-api-admin-form');
    save(cleanedData, View.SHOW, {
      onSuccess: ({ data }) => {
        setIsSubmitting(false);
        notify(`Document successfully ${view === View.CREATE ? 'created' : 'updated'}`, 'info');
        redirect(View.SHOW, '/exampleSuggestions', data.id || record.id, { ...data, id: data.id || record.id });
      },
      onFailure: (error: any) => {
        const { body } = error;
        toast({
          title: 'Error',
          description: body?.error || error,
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
        setIsSubmitting(false);
      },
    });
  };

  /* Caches the form data with browser cookies */
  const cacheForm = () => {
    const data = getValues();
    const cleanedData = createCacheExampleData(data, record);
    localStorage.setItem('igbo-api-admin-form', JSON.stringify(cleanedData));
  };

  useBeforeWindowUnload();
  useCacheForm({ record, setValue, cacheForm });

  return (
    <form onChange={cacheForm} onSubmit={handleSubmit(onSubmit)}>
      <Box className="flex flex-col">
        {record.originalExampleId || (view === View.CREATE && record.id) ? (
          <>
            <h2 className="form-header">Origin Example Id:</h2>
            <Input
              className="form-input"
              data-test="original-id"
              value={record.originalExampleId || record.id}
              isDisabled
            />
          </>
        ) : null }
        <Box className="w-full lg:w-1/2 flex flex-col">
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
            defaultValue={record.pronunciation}
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
              className="form-input"
              placeholder="Please"
              data-test="igbo-input"
            />
          )}
          name="igbo"
          control={control}
          defaultValue={record.igbo || getValues().igbo}
        />
        {errors.igbo && (
          <p className="error">Igbo is required</p>
        )}
      </Box>
      <Box className="flex flex-col">
        <FormHeader
          title="English"
          tooltip="The example sentence in English"
        />
        <Controller
          render={(props) => (
            <Input
              {...props}
              className="form-input"
              placeholder="Bia"
              data-test="english-input"
            />
          )}
          name="english"
          control={control}
          defaultValue={record.english || getValues().english}
        />
        {errors.english && (
          <p className="error">English is required</p>
        )}
      </Box>
      <Box className="mt-2">
        <AssociatedWordsForm
          errors={errors}
          associatedWords={associatedWords}
          setAssociatedWords={setAssociatedWords}
          control={control}
          setValue={setValue}
          record={record}
        />
      </Box>
      <Box className="flex flex-col">
        <FormHeader
          title="Editor Comments"
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
              defaultValue={record.userComments}
            />
          )}
          name="userComments"
          defaultValue={record.userComments}
          control={control}
        />
      </Box>
      <Box className="flex flex-row items-center form-buttons-container space-y-4 lg:space-x-4">
        <Button
          className="mt-3 lg:my-0"
          backgroundColor="gray.300"
          onClick={() => onCancel({ view, resource, history })}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          colorScheme="green"
          variant="solid"
          className="m-0"
          isLoading={isSubmitting}
          loadingText={view === View.CREATE ? 'Submitting' : 'Updating'}
        >
          {view === View.CREATE ? 'Submit' : 'Update'}
        </Button>
      </Box>
    </form>
  );
};

export default ExampleEditForm;
