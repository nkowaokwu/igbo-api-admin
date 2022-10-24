import React, { ReactElement, useState, useEffect } from 'react';
import { assign, map, omit } from 'lodash';
import {
  Box,
  Button,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Record, useNotify, useRedirect } from 'react-admin';
import { useForm, Controller } from 'react-hook-form';
import { EditFormProps } from 'src/shared/interfaces';
import { getExample } from 'src/shared/API';
import View from 'src/shared/constants/Views';
import useBeforeWindowUnload from 'src/hooks/useBeforeWindowUnload';
import useCacheForm from 'src/hooks/useCacheForm';
import { Textarea, Input } from 'src/shared/primitives';
import actionsMap, { handleUpdateDocument } from 'src/shared/constants/actionsMap';
import Collection from 'src/shared/constants/Collections';
import FilePicker from 'src/shared/primitives/FilePicker';
import uploadToS3 from 'src/shared/utils/uploadToS3';
import CorpusEditFormResolver from './CorpusEditFormResolver';
import { onCancel } from '../utils';
import FormHeader from '../FormHeader';

const convertToSeconds = (hms: string) => {
  const a = hms.split(':'); // split it at the colons
  // minutes are worth 60 seconds. Hours are worth 60 minutes.
  const seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
  return seconds;
};

const getLineNumberAndColumnIndex = (textareaElement): string => {
  const textLines = textareaElement.value.substr(0, textareaElement.selectionStart).split('\n');
  // const currentLineNumber = textLines.length;
  // const currentColumnIndex = textLines[textLines.length - 1].length;
  return textLines[textLines.length - 1];
};

const CorpusEditForm = ({
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
    register,
  } = useForm({
    defaultValues: {
      ...record,
    },
    ...CorpusEditFormResolver,
  });
  const [, setOriginalRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seekTime, setSeekTime] = useState(0);
  const [mediaFile, setMediaFile] = useState<File>(null);
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

  const handleFileSelect = ({ file, duration } : { file?: File, duration: number }) => {
    if (file?.name) {
      setValue('title', file.name);
      setMediaFile(file);
    }
    if (duration) {
      setValue('duration', duration);
    }
  };

  const handleTextSelection = (e) => {
    const currentLine = getLineNumberAndColumnIndex(e.target);
    if (currentLine.startsWith('[') && currentLine.endsWith(']')) {
      const seconds = convertToSeconds(currentLine.substring(1, currentLine.length - 1));
      setSeekTime(seconds);
    }
  };

  /* Grabs the user form data that will be cached */
  const createCacheCorpusData = (data: any, record: Record = { id: null }) => {
    const cleanedData = {
      ...record,
      ...data,
    };
    return cleanedData;
  };

  /* Combines the approvals, denials, and cached form data to
   * send to the backend
   */
  const onSubmit = (data) => {
    setIsSubmitting(true);
    try {
      const cleanedData = omit(assign(
        { ...record, ...data },
        createCacheCorpusData(data, record),
        {
          approvals: map(record.approvals, (approval) => approval.uid),
          denials: map(record.denials, (denial) => denial.uid),
        },
      ), [view === View.CREATE ? 'id' : '']);
      localStorage.removeItem('igbo-api-admin-form');
      save(cleanedData, View.SHOW, {
        onSuccess: async ({ data }) => {
          handleUpdateDocument({ resource, record: data });
          if (mediaFile) {
            await uploadToS3({ id: data.id, file: mediaFile })
              .catch(async (err) => {
                toast({
                  title: 'Error',
                  description: err.message,
                  status: 'error',
                  duration: 4000,
                  isClosable: true,
                });
                if (view === View.CREATE) {
                  // Deleting the corpus suggestion if unable to upload media
                  await actionsMap.Delete.executeAction({ record: data, resource: Collection.CORPUS_SUGGESTIONS });
                  redirect(
                    View.LIST,
                    `/${Collection.CORPUS_SUGGESTIONS}`,
                  );
                }
              });
          }
          setIsSubmitting(false);
          notify(`Document successfully ${view === View.CREATE ? 'created' : 'updated'}`, 'info');
          redirect(
            View.SHOW,
            `/${Collection.CORPUS_SUGGESTIONS}`,
            data.id || record.id,
            { ...data, id: data.id || record.id },
          );
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
    } catch (err) {
      console.log(err);
      setIsSubmitting(false);
    }
  };

  /* Caches the form data with browser cookies */
  const cacheForm = () => {
    const data = getValues();
    const cleanedData = createCacheCorpusData(data, record);
    localStorage.setItem('igbo-api-admin-form', JSON.stringify(cleanedData));
  };

  useBeforeWindowUnload();
  useCacheForm({ record, setValue, cacheForm });

  return (
    <form onChange={cacheForm} onSubmit={handleSubmit(onSubmit)}>
      <Box className="flex flex-col">
        {record.originalCorpusId || (view === View.CREATE && record.id) ? (
          <>
            <h2 className="form-header">Origin Corpus Id:</h2>
            <Input
              className="form-input"
              data-test="original-id"
              value={record.originalCorpusId || record.id}
              isDisabled
            />
          </>
        ) : null }
        <FormHeader
          title="Title"
          tooltip="The name of this corpus"
        />
        <Controller
          render={(props) => (
            <Input
              {...props}
              className="form-input"
              placeholder="Title of corpus"
              data-test="title-input"
            />
          )}
          name="title"
          control={control}
          defaultValue={record.title || getValues().title}
        />
        {errors.title ? (
          <p className="error">Title is required</p>
        ) : null}
      </Box>
      <Box className="flex flex-col-reverse lg:flex-row justify-between items-start space-x-6">
        <Box className="flex flex-col w-full lg:w-1/2">
          <FormHeader
            title="Body"
            tooltip="This is the transcription of the associated media."
          />
          <Controller
            render={(props) => (
              <Textarea
                {...props}
                rows={20}
                style={{
                  fontFamily: 'monospace',
                  width: '100%',
                }}
                onSelect={handleTextSelection}
                placeholder="[00:00:00] Provide transcription sentence by sentence"
                data-test="body-input"
              />
            )}
            name="body"
            control={control}
            defaultValue={record.body || getValues().body}
          />
          <Text className="italic" fontSize="sm" color="gray.600" my={2}>
            The goal of transcription is to transcribe Igbo text sentence by sentence.
            Each sentence will be prepended with a timestamp in the format of [HH:MM:SS],
            where &quot;HH&quot; are the hours, &quot;MM&quot; are the minutes, and &quot;SS&quot; are the seconds. For
            example, [01:22:23] will be the timestamp for the second that was spoke at the
            first hour, twenty second minute, and twenty third hour.
          </Text>
          {errors.body ? (
            <p className="error">Transcription is required</p>
          ) : null}
        </Box>
        <FilePicker
          onFileSelect={handleFileSelect}
          seekTime={seekTime}
          name="media"
          register={register}
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
              defaultValue={record.editorsNotes}
            />
          )}
          name="editorsNotes"
          defaultValue={record.editorsNotes}
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

export default CorpusEditForm;
