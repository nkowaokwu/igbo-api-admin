import React, { ReactElement, useState, useEffect } from 'react';
import {
  assign,
  map,
  omit,
  compact,
} from 'lodash';
import {
  Box,
  Button,
  ListItem,
  Text,
  UnorderedList,
  chakra,
  useToast,
} from '@chakra-ui/react';
import { Record, useNotify, useRedirect } from 'react-admin';
import { useForm, Controller } from 'react-hook-form';
import { EditFormProps } from 'src/shared/interfaces';
import { getCorpus, removePayloadFields } from 'src/shared/API';
import View from 'src/shared/constants/Views';
import useBeforeWindowUnload from 'src/hooks/useBeforeWindowUnload';
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
  let selectionIndex = textareaElement.selectionStart;
  const secondHalf = textareaElement.value.substr(selectionIndex, textareaElement.value.length);
  if (textareaElement.value[selectionIndex] !== '\n') {
    selectionIndex = secondHalf.indexOf('\n') + selectionIndex;
  }

  const textLines = textareaElement.value.substr(0, selectionIndex).split('\n');

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
    watch,
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
  const watchedMedia = watch('media');
  const watchedTitle = watch('title');
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
      if (record.originalCorpusId) {
        setOriginalRecord(await getCorpus(record.originalCorpusId));
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
    if (currentLine.startsWith('[') || currentLine.endsWith(']')) {
      const validTimes = compact(currentLine.split(/[[\]-]/));
      const time = validTimes[0];
      if (time && time.length === time.replace(/:/g, '').length + 2) {
        const seconds = convertToSeconds(time);
        if (typeof seconds === 'number') {
          setSeekTime(seconds);
        }
      }
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
      const preparedData = omit(assign(
        createCacheCorpusData(data, record),
        {
          approvals: map(record.approvals, (approval) => approval.uid),
          denials: map(record.denials, (denial) => denial.uid),
        },
      ), [view === View.CREATE ? 'id' : '']);
      const cleanedData = removePayloadFields(preparedData);
      localStorage.removeItem('igbo-api-admin-form');
      save(cleanedData, View.SHOW, {
        onSuccess: async ({ data }) => {
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
          handleUpdateDocument({ resource, record: data });
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
          const { body, message } = error;
          toast({
            title: 'Error',
            description: body?.error || message || 'An error occurred while corpus example suggestion',
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box className="flex flex-col">
        {record.originalCorpusId || (view === View.CREATE && record.id) ? (
          <>
            <h2 className="form-header">Parent Corpus Id:</h2>
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
      <Box className="flex flex-col justify-between items-start">
        <FilePicker
          url={watchedMedia}
          title={watchedTitle}
          onFileSelect={handleFileSelect}
          seekTime={seekTime}
          name="media"
          register={register}
          errors={errors}
        />
        <Text fontSize="xs" color="gray.600">
          <chakra.span fontSize="md" fontWeight="bold">Note: </chakra.span>
          The audio seek will automatically jump to timestamp highlighted in your transcription 😉
        </Text>
        <Box className="flex flex-col w-full">
          <FormHeader
            title="Transcript"
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
                placeholder={`[00:00:00-00:00:10]
Nke a bụ ahịrịokwu Igbo

[00:00:12-00:00:15]
Nke a bụ ahịrịokwu Igbo`}
                data-test="body-input"
              />
            )}
            name="body"
            control={control}
            defaultValue={record.body || getValues().body}
          />
          <Box className="flex flex-col lg:flex-row space-y-2 lg:space-x-4">
            <Box>
              <Text className="italic" fontSize="xs" color="gray.600" my={2}>
                Please transcribe Igbo text sentence by sentence according to the following pattern:
              </Text>
              <Text fontFamily="monospace" fontSize="xs" color="gray.600">
                [01:22:23-01:22:25]
              </Text>
              <Text fontFamily="monospace" fontSize="xs" color="gray.600">
                Nke a bụ ahịrịokwu Igbo
              </Text>
              <Text fontFamily="monospace" fontSize="xs" color="gray.600">
                [01:22:26-01:22:29]
              </Text>
              <Text fontFamily="monospace" fontSize="xs" color="gray.600">
                Nke a bụ ahịrịokwu Igbo
              </Text>
            </Box>
            <Box>
              <Text fontWeight="bold" color="gray.600" fontSize="sm">
                Please read:
              </Text>
              <UnorderedList fontSize="xs">
                <ListItem>
                  Each sentence will be prepended with a timestamp in the format of [HH:MM:SS]
                  <UnorderedList>
                    <ListItem>
                      &quot;HH&quot; are the hours
                    </ListItem>
                    <ListItem>
                      &quot;MM&quot; are the minutes
                    </ListItem>
                    <ListItem>
                      &quot;SS&quot; are the seconds
                    </ListItem>
                  </UnorderedList>
                </ListItem>
                <ListItem>
                  You do
                  <chakra.span fontWeight="bold"> NOT </chakra.span>
                  need to add a period to the sentence.
                </ListItem>
                <ListItem>
                  When you hear a different voice, that must be transcribed as its own sentence.
                </ListItem>
              </UnorderedList>
            </Box>
          </Box>
          {errors.body ? (
            <p className="error">Transcription is required</p>
          ) : null}
        </Box>
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
