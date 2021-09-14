import React, { ReactElement, useState, useEffect } from 'react';
import {
  assign,
  map,
  omit,
} from 'lodash';
import { Box, Button, useToast } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { Record, useNotify, useRedirect } from 'react-admin';
import { useForm, Controller } from 'react-hook-form';
import ExampleEditFormSchemaResolver from './schema';
import { onCancel, sanitizeArray } from '../utils';
import { EditFormProps } from '../../../../interfaces';
import View from '../../../../constants/Views';
import useBeforeWindowUnload from '../../../../../hooks/useBeforeWindowUnload';
import useCacheForm from '../../../../../hooks/useCacheForm';
import { Textarea, Input } from '../../../../primitives';
import FormHeader from '../FormHeader';

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
    ...ExampleEditFormSchemaResolver,
  });
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
  }, []);

  /* Grabs the user form data that will be cached */
  const createCacheExampleData = (data: any, record: Record = { id: null }) => {
    const cleanedData = {
      ...record,
      ...data,
      associatedWords: sanitizeArray(data.associatedWords || []),
    };
    return cleanedData;
  };

  /* Combines the approvals, denials, and cached form data to
   * send to the backend
   */
  const onSubmit = (data) => {
    setIsSubmitting(true);
    const cleanedData = omit(assign({
      ...record,
      ...data,
      approvals: map(record.approvals, (approval) => approval.uid),
      denials: map(record.denials, (denial) => denial.uid),
    }, createCacheExampleData(data, record)), [view === View.CREATE ? 'id' : '']);
    localStorage.removeItem('igbo-api-admin-form');
    save(cleanedData, View.SHOW, {
      onSuccess: ({ data }) => {
        notify(`Document successfully ${view === View.CREATE ? 'created' : 'updated'}`);
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
          <span className="error">Igbo is required</span>
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
          <span className="error">English is required</span>
        )}
      </Box>
      <Box className="flex items-center my-5 w-full justify-between">
        <FormHeader
          title="Associated Word Ids"
          tooltip={`The id of a word that is found in this example sentence. 
          Adding word ids enables interlinking between words and example sentences`}
        />
        <Button
          className="h-12 px-3"
          colorScheme="teal"
          aria-label="Add Associated Word Id"
          onClick={() => {
            const updateAssociatedWords = [...associatedWords];
            updateAssociatedWords.push('');
            setAssociatedWords(updateAssociatedWords);
          }}
        >
          Add Associated Word Id
        </Button>
      </Box>
      {associatedWords.map((associatedWord, index) => (
        <>
          <Box className="list-container">
            <h3 className="text-xl text-gray-600 mr-2">{`${index + 1}.`}</h3>
            <Controller
              render={(props) => (
                <Input
                  {...props}
                  className="form-input"
                  placeholder="Associated Word Id"
                  data-test={`associated-words-${index}-input`}
                />
              )}
              name={`associatedWords[${index}]`}
              defaultValue={associatedWord}
              control={control}
            />
            {index ? (
              <Button
                colorScheme="red"
                aria-label="Delete Associated Word Id"
                onClick={() => {
                  const updateAssociatedWords = [...associatedWords];
                  updateAssociatedWords.splice(index, 1);
                  setAssociatedWords(updateAssociatedWords);
                }}
                className="ml-3"
                leftIcon={<DeleteIcon />}
              >
                Delete
              </Button>
            ) : null}
          </Box>
        </>
      ))}
      {errors.associatedWords && (
        <span className="error">An associated word Id is required</span>
      )}
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
          colorScheme="teal"
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
