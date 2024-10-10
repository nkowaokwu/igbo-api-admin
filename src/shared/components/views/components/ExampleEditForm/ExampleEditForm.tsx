import React, { ReactElement, useState, useEffect } from 'react';
import { get, omit, pick, flow, assign } from 'lodash';
import { Box, Button, Text, chakra, useToast, Tooltip, HStack } from '@chakra-ui/react';
import { PiMagicWandBold } from 'react-icons/pi';
import { Record, useNotify, useRedirect } from 'react-admin';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import { EditFormProps } from 'src/shared/interfaces';
import { getExample, getExampleTranscriptionFeedback } from 'src/shared/API';
import removePayloadFields from 'src/shared/utils/removePayloadFields';
import View from 'src/shared/constants/Views';
import useBeforeWindowUnload from 'src/hooks/useBeforeWindowUnload';
import { Textarea, Input } from 'src/shared/primitives';
import { handleUpdateDocument } from 'src/shared/constants/actionsMap';
import ActionTypes from 'src/shared/constants/ActionTypes';
import useFirebaseUid from 'src/hooks/useFirebaseUid';
// eslint-disable-next-line max-len
import createDefaultExampleFormValues from 'src/shared/components/views/components/WordEditForm/utils/createDefaultExampleFormValues';
import { ExampleTranscriptionFeedbackData } from 'src/backend/controllers/utils/interfaces';
import getRecordLanguages from 'src/shared/utils/getRecordLanguages';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';
import useIsIgboAPIProject from 'src/hooks/useIsIgboAPIProject';
import ExampleTranslationsForm from 'src/shared/components/views/components/ExampleEditForm/components/ExampleTranslationsForm';
import ExampleEditFormResolver from './ExampleEditFormResolver';
import { onCancel, sanitizeArray, sanitizeWith } from '../utils';
import FormHeader from '../FormHeader';
import AssociatedWordsForm from './components/AssociatedWordsForm';
import ExampleAudioPronunciationsForm from './components/ExampleAudioPronunciationsForm';
import NsibidiForm from '../WordEditForm/components/NsibidiForm';

const ExampleEditForm = ({
  view,
  record,
  save,
  resource = '',
  history,
  isPreExistingSuggestion,
}: EditFormProps): ReactElement => {
  const style = pick(
    Object.values(ExampleStyle).find(({ value }) => value === record.style),
    ['value', 'label'],
  ) || { value: '', label: '' };
  const {
    handleSubmit,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: createDefaultExampleFormValues(record),
    ...ExampleEditFormResolver,
    mode: 'onChange',
  });

  const [originalRecord, setOriginalRecord] = useState(null);
  const [exampleTranscriptionFeedback, setExampleTranscriptionFeedback] = useState<ExampleTranscriptionFeedbackData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notify = useNotify();
  const redirect = useRedirect();
  const toast = useToast();
  const options = Object.values(ExampleStyle).map(({ value, label }) => ({ value, label }));
  const languageOptions = Object.values(LanguageLabels).filter(({ value }) => value !== LanguageEnum.UNSPECIFIED);
  const uid = useFirebaseUid();
  const isIgboAPIProject = useIsIgboAPIProject();
  const { sourceLanguage } = getRecordLanguages(record);

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

      const exampleTranscriptionFeedbackRecord = await getExampleTranscriptionFeedback(`${record.id}`);
      setExampleTranscriptionFeedback(exampleTranscriptionFeedbackRecord);
    })();
  }, []);

  /** Sanitizes the data to match the form data schema */
  const sanitizeData = (rawData: Record) => {
    const data = assign(rawData);
    data.source = {
      language: get(data, 'source.language.value') || LanguageEnum.UNSPECIFIED,
      text: get(data, 'source.text') || '',
      pronunciations: (get(data, 'source.pronunciations') || []).map((pronunciation) =>
        omit(pronunciation, ['review', 'id', 'approvals', 'denials']),
      ),
    };
    data.translations = (get(data, 'translations') || []).map(
      ({ language = LanguageLabels.UNSPECIFIED, text = '', pronunciations }) => ({
        language: language.value,
        text,
        pronunciations: (pronunciations || []).map((pronunciation) =>
          omit(pronunciation, ['review', 'id', 'approvals', 'denials']),
        ),
      }),
    );
    data.associatedDefinitionsSchemas = sanitizeArray(record.associatedDefinitionsSchemas || []);
    data.style = data.style?.value;
    data.associatedWords = sanitizeWith(data.associatedWords || []);
    data.nsibidiCharacters = sanitizeWith(data.nsibidiCharacters || []);

    return data;
  };

  /** Pipeline that handles cleaning data before sending to backend */
  const cleanDataPipeline = flow([removePayloadFields, sanitizeData]);

  /** Combines the approvals, denials, and cached form data to send to the backend */
  const onSubmit = (data) => {
    try {
      setIsSubmitting(true);
      const omitKeys = [view === View.CREATE ? 'id' : '', 'type'];

      const preparedData = omit(assign(record, data), omitKeys);
      const cleanedData = cleanDataPipeline(preparedData);
      localStorage.removeItem('igbo-api-admin-form');
      save(cleanedData, View.SHOW, {
        onSuccess: ({ data }) => {
          setIsSubmitting(false);
          handleUpdateDocument({ type: ActionTypes.NOTIFY, resource, record: data });
          notify(`Document successfully ${view === View.CREATE ? 'created' : 'updated'}`, 'info');
          redirect(View.SHOW, '/exampleSuggestions', data.id || record.id, { ...data, id: data.id || record.id });
        },
        onFailure: (err: any) => {
          const { body, message, error } = err;
          toast({
            title: 'Error',
            description: body?.error || error || message || 'An error occurred while saving example suggestion',
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
          setIsSubmitting(false);
        },
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Unable to submit sentence',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
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
      <Box className="space-y-4">
        <Box className="flex flex-col">
          {record.originalExampleId || (view === View.CREATE && record.id) ? (
            <>
              <h2 className="form-header">Parent Example Id:</h2>
              <Input data-test="original-id" value={record.originalExampleId || record.id} isDisabled />
            </>
          ) : null}
          <FormHeader title="Source text" tooltip={`The example sentence in ${sourceLanguage}`} />
          <Box
            {...(exampleTranscriptionFeedback?.humanTranscription
              ? {
                  rounded: 'md',
                  borderColor: 'green.300',
                  borderWidth: '1px',
                  backgroundColor: 'green.100',
                  padding: '4',
                  className: 'space-y-2',
                }
              : {})}
          >
            <HStack
              display="flex"
              flexDirection={{ base: 'column', md: 'row' }}
              justifyContent="space-between"
              width="full"
              gap={2}
            >
              <Controller
                render={({ field: props }) => (
                  <Input {...props} placeholder={`Text in ${sourceLanguage}`} data-test="igbo-input" flex={8} />
                )}
                name="source.text"
                control={control}
                defaultValue={get(record, 'source.text') || get(getValues(), 'source.text') || ''}
              />
              <Controller
                render={({ field: props }) => (
                  <Select
                    {...props}
                    options={languageOptions}
                    styles={{ container: (styles) => ({ ...styles, flex: 2, width: '100%' }) }}
                  />
                )}
                name="source.language"
                control={control}
              />
            </HStack>
            <ExampleAudioPronunciationsForm
              control={control}
              record={record}
              originalRecord={originalRecord}
              uid={uid}
              name="source"
              setValue={setValue}
              getValues={getValues}
            />
            {get(errors, 'source.pronunciations') ? (
              <p className="error">{get(errors, 'source.pronunciations.message')}</p>
            ) : null}
            {exampleTranscriptionFeedback?.humanTranscription ? (
              <Box className="flex flex-row justify-between items-center">
                <Tooltip
                  placement="bottom-start"
                  label="The user who recorded the audio in this suggestion from the 
            IgboSpeech website also suggested this as the correct transcription. Before
            accepting, please review the Dictionary Editing Standards guide."
                >
                  <Text className="flex flex-row items-center space-x-2" cursor="default">
                    <PiMagicWandBold fill="var(--chakra-colors-purple-500)" />
                    <chakra.span color="purple.600" fontWeight="bold">
                      Suggested by human:
                    </chakra.span>
                    <chakra.span>{exampleTranscriptionFeedback.humanTranscription}</chakra.span>
                  </Text>
                </Tooltip>
                <Button
                  variant="ghost"
                  onClick={() => setValue('igbo', exampleTranscriptionFeedback.humanTranscription)}
                  _hover={{
                    backgroundColor: 'transparent',
                  }}
                  _active={{
                    backgroundColor: 'transparent',
                  }}
                  _focus={{
                    backgroundColor: 'transparent',
                  }}
                >
                  <Text color="purple.600" _hover={{ color: 'purple.700' }}>
                    Use suggestion
                  </Text>
                </Button>
              </Box>
            ) : null}
          </Box>
          {get(errors, 'source.text') ? <p className="error">Source text is required</p> : null}
          {get(errors, 'source.language') ? <p className="error">{`${sourceLanguage} is required`}</p> : null}
        </Box>
        <ExampleTranslationsForm
          record={record}
          originalRecord={originalRecord}
          uid={uid}
          errors={errors}
          control={control}
          setValue={setValue}
          getValues={getValues}
        />
        {isIgboAPIProject ? (
          <Box className="flex flex-col">
            <FormHeader
              title="Meaning"
              tooltip="This field showcases the meaning of the sentence - typically for proverbs"
            />
            <Controller
              render={({ field: props }) => (
                <Input {...props} placeholder="Conceptual meaning of the original text" data-test="meaning-input" />
              )}
              name="meaning"
              control={control}
              defaultValue={record.meaning || getValues().meaning || ''}
            />
            {errors.meaning ? <p className="error">{errors.meaning.message}</p> : null}
          </Box>
        ) : null}
        {isIgboAPIProject ? (
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
                  render={({ field: props }) => <Select {...props} options={options} />}
                  name="style"
                  control={control}
                  defaultValue={style}
                />
              </Box>
              {errors.style ? <p className="error">{errors.style.message}</p> : null}
            </Box>
          </Box>
        ) : null}
        <Box className="flex flex-col">
          <NsibidiForm control={control} errors={errors} name="nsibidi" getValues={getValues} />
          <Box className="mt-2">
            <AssociatedWordsForm errors={errors} control={control} record={record} />
          </Box>
          {isIgboAPIProject ? (
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
          ) : null}
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
            <Button
              data-test="example-submit-button"
              type="submit"
              variant="primary"
              className="m-0"
              isLoading={isSubmitting}
              loadingText={view === View.CREATE ? 'Submitting' : 'Updating'}
              width="full"
            >
              {view === View.CREATE ? 'Submit' : 'Update'}
            </Button>
          </Box>
        </Box>
      </Box>
    </form>
  );
};

export default ExampleEditForm;
