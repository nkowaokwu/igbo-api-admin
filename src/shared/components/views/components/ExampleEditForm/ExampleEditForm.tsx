import React, {
  ReactElement,
  useState,
  useEffect,
  useRef,
} from 'react';
import {
  assign,
  map,
  noop,
  omit,
  pick,
  set,
} from 'lodash';
import {
  Box,
  Button,
  Tooltip,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
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
import useFirebaseUid from 'src/hooks/useFirebaseUid';
import DeleteAudioPronunciationAlert from 'src/shared/components/DeleteAudioPronunciationAlert';
import Collections from 'src/shared/constants/Collections';
import ExamplePronunciation from 'src/shared/components/ExamplePronunciation';
import ExampleEditFormResolver from './ExampleEditFormResolver';
import { onCancel, sanitizeArray } from '../utils';
import FormHeader from '../FormHeader';
import AssociatedWordsForm from './components/AssociatedWordsForm';
import NsibidiInput from '../WordEditForm/components/NsibidiForm/NsibidiInput';

const ExampleEditForm = ({
  view,
  record,
  save,
  resource = Collections.EXAMPLE_SUGGESTIONS,
  history,
  isPreExistingSuggestion,
}: EditFormProps) : ReactElement => {
  const [pronunciations, setPronunciations] = useState<{ audio: '', speaker: '' }[]>([]);
  const [pronunciationIndex, setPronunciationIndex] = useState(-1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const addSentenceRecordingRef = useRef<HTMLButtonElement>(null);
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
    },
    ...ExampleEditFormResolver,
  });
  const [originalRecord, setOriginalRecord] = useState(null);
  const [associatedWords, setAssociatedWords] = useState(
    record?.associatedWords?.length ? record.associatedWords : [''],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firebaseUid, setFirebaseUid] = useState('');
  const notify = useNotify();
  const redirect = useRedirect();
  const toast = useToast();
  const options = Object.values(ExampleStyle).map(({ value, label }) => ({ value, label }));
  useFirebaseUid(setFirebaseUid);

  const handleOpenAlert = (index) => {
    setPronunciationIndex(index);
    onOpen();
  };

  const handleCloseAlert = () => {
    setPronunciationIndex(-1);
    onClose();
  };

  // Removes the specified audio pronunciation
  const handleDeletePronunciation = () => {
    const updatedPronunciations = [...pronunciations];
    updatedPronunciations.splice(pronunciationIndex, 1);
    setPronunciations(updatedPronunciations);
    handleCloseAlert();
  };

  // Sets the currently selected audio
  const handleSetPronunciation = (formValuePath: string, audioValue: string) => {
    const updatedPronunciations = { pronunciations: [...pronunciations] };
    const updatedValue = {
      audio: audioValue,
      speaker: firebaseUid,
    };
    set(updatedPronunciations, formValuePath, updatedValue);
    setPronunciations(updatedPronunciations.pronunciations);
  };

  // Updates local state
  const handleAddPronunciation = () => {
    const updatedPronunciations = [...pronunciations];
    updatedPronunciations.push({ audio: '', speaker: '' });
    setPronunciations(updatedPronunciations);
  };

  /* Grabs the user form data that will be cached */
  const createCacheExampleData = (data: any, record: Record = { id: null }) => {
    const cleanedData = {
      ...record,
      ...data,
      associatedDefinitionsSchemas: sanitizeArray(record.associatedDefinitionsSchemas || []),
      style: data.style.value,
      associatedWords: sanitizeArray(data.associatedWords),
      pronunciations,
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

  // Initializes local state from provided variable
  useEffect(() => {
    if (Array.isArray(record?.pronunciations)) {
      setPronunciations(record?.pronunciations);
    }
  }, []);

  return (
    <>
      <DeleteAudioPronunciationAlert
        isOpen={isOpen}
        onConfirm={handleDeletePronunciation}
        onClose={handleCloseAlert}
        cancelRef={addSentenceRecordingRef}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box className="flex flex-col">
          {record.originalExampleId || (view === View.CREATE && record.id) ? (
            <>
              <h2 className="form-header">Parent Example Id:</h2>
              <Input
                data-test="original-id"
                value={record.originalExampleId || record.id}
                onChange={noop}
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
        <Box className="flex flex-col">
          <FormHeader
            title="Nsịbịdị"
            tooltip="This field is for the Nsịbịdị representation of the sentence"
          />
          <Controller
            render={(props) => (
              <NsibidiInput {...props} />
            )}
            name="nsibidi"
            control={control}
            defaultValue={record.nsibidi || getValues().nsibidi || ''}
          />
          {errors.nsibidi ? (
            <p className="error">{errors.nsibidi.message}</p>
          ) : null}
        </Box>
        <Box className="space-y-2 w-full mt-2">
          <Tooltip label="This will add another sentence audio recording for the same example sentence.">
            <Button width="full" colorScheme="green" onClick={handleAddPronunciation}>Add sentence recording</Button>
          </Tooltip>
          <Box className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pronunciations.map((pronunciation, index) => (
              <ExamplePronunciation
                key={pronunciation.audio}
                pronunciation={pronunciation}
                index={index}
                onOpenAlert={handleOpenAlert}
                setPronunciation={handleSetPronunciation}
                example={{ ...record, pronunciations }}
                originalRecord={originalRecord}
              />
            ))}
          </Box>
        </Box>
        <Box className="mt-2">
          <AssociatedWordsForm
            errors={errors}
            associatedWords={associatedWords}
            setAssociatedWords={setAssociatedWords}
            control={control}
            setValue={setValue}
            record={record}
            resource={resource}
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
    </>
  );
};

export default ExampleEditForm;
