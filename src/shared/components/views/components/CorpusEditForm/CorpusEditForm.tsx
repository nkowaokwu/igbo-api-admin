import React, { ReactElement, useState, useEffect, FormEvent } from 'react';
import { assign, map, omit } from 'lodash';
import { Box, Button, useToast } from '@chakra-ui/react';
import { Record, useNotify, useRedirect } from 'react-admin';
import { useForm, Controller } from 'react-hook-form';
import { EditFormProps } from 'src/shared/interfaces';
import { getCorpus } from 'src/shared/API';
import removePayloadFields from 'src/shared/utils/removePayloadFields';
import View from 'src/shared/constants/Views';
import useBeforeWindowUnload from 'src/hooks/useBeforeWindowUnload';
import { Textarea, Input } from 'src/shared/primitives';
import actionsMap, { handleUpdateDocument } from 'src/shared/constants/actionsMap';
import Collection from 'src/shared/constants/Collection';
import FilePicker from 'src/shared/primitives/FilePicker';
import uploadToS3 from 'src/shared/utils/uploadToS3';
import ActionTypes from 'src/shared/constants/ActionTypes';
import LabelStudioReact from 'src/shared/components/LabelStudioReact';
import CorpusEditFormResolver from './CorpusEditFormResolver';
import { onCancel } from '../utils';
import FormHeader from '../FormHeader';

const CorpusEditForm = ({
  view,
  record,
  save,
  resource = '',
  history,
  isPreExistingSuggestion,
}: EditFormProps): ReactElement => {
  const {
    getValues,
    setValue,
    control,
    formState: { errors },
    register,
    watch,
  } = useForm({
    defaultValues: {
      ...record,
    },
    ...CorpusEditFormResolver,
    mode: 'onChange',
  });
  const [, setOriginalRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleFileSelect = ({ base64, file, duration }: { base64: string; file?: File; duration: number }) => {
    if (file?.name) {
      setValue('title', file.name);
      setValue('media', base64);
      setMediaFile(file);
    }
    if (duration) {
      setValue('duration', duration);
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
      const preparedData = omit(
        assign(createCacheCorpusData(data, record), {
          approvals: map(record.approvals, (approval) => approval.uid),
          denials: map(record.denials, (denial) => denial.uid),
        }),
        [view === View.CREATE ? 'id' : ''],
      );
      const cleanedData = removePayloadFields(preparedData);
      localStorage.removeItem('igbo-api-admin-form');
      save(cleanedData, View.SHOW, {
        onSuccess: async ({ data }) => {
          if (mediaFile) {
            await uploadToS3({
              collection: Collection.CORPUS_SUGGESTIONS,
              data: { id: data.id, file: mediaFile },
            }).catch(async (err) => {
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
                redirect(View.LIST, `/${Collection.CORPUS_SUGGESTIONS}`);
              }
            });
          }
          handleUpdateDocument({ type: ActionTypes.NOTIFY, resource, record: data });
          setIsSubmitting(false);
          notify(`Document successfully ${view === View.CREATE ? 'created' : 'updated'}`, 'info');
          redirect(View.SHOW, `/${Collection.CORPUS_SUGGESTIONS}`, data.id || record.id, {
            ...data,
            id: data.id || record.id,
          });
        },
        onFailure: (error: any) => {
          const { body, message } = error;
          toast({
            title: 'Error',
            description: body?.error || message || 'An error occurred while corpus suggestion',
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
          setIsSubmitting(false);
        },
      });
    } catch (err) {
      // console.log(err);
      setIsSubmitting(false);
    }
  };

  const handleOnSubmit = (annotations) => {
    const data = {
      ...getValues(),
      annotations,
    };
    onSubmit(data);
  };

  const handleOnUpdate = (annotations) => {
    const data = {
      ...getValues(),
      annotations,
    };
    onSubmit(data);
  };

  useBeforeWindowUnload();

  return (
    <form onSubmit={(e: FormEvent) => e.preventDefault()}>
      <Box className="flex flex-col">
        {record.originalCorpusId || (view === View.CREATE && record.id) ? (
          <>
            <h2 className="form-header">Parent Corpus Id:</h2>
            <Input data-test="original-id" value={record.originalCorpusId || record.id} isDisabled />
          </>
        ) : null}
        <FormHeader title="Title" tooltip="The name of this corpus" />
        <Controller
          render={({ field: props }) => (
            <Input {...props} placeholder="Title of corpus" data-test="title-input" className="mb-2" />
          )}
          name="title"
          control={control}
          defaultValue={record.title || getValues().title || ''}
        />
        {errors.title ? <p className="error">Title is required</p> : null}
        <FilePicker
          url={watchedMedia}
          title={watchedTitle}
          onFileSelect={handleFileSelect}
          name="media"
          type="media"
          register={register}
          errors={errors}
        />
        <LabelStudioReact
          data={watchedMedia}
          annotations={[
            {
              id: record?.id,
              result: record?.annotations || [],
              created_at: record?.createdAt,
              updated_at: record?.updatedAt,
            },
          ]}
          onSubmit={handleOnSubmit}
          onUpdate={handleOnUpdate}
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
          render={({ field: props }) => (
            <Textarea {...props} className="form-textarea" placeholder="Comments" rows={4} />
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
          isDisabled={isSubmitting}
          width="full"
        >
          Cancel
        </Button>
      </Box>
    </form>
  );
};

export default CorpusEditForm;
