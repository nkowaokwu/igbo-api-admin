import React, { ReactElement, useState, useEffect } from 'react';
import {
  assign,
  compact,
  get,
  map,
  omit,
  uniqBy,
} from 'lodash';
import {
  Box,
  Button,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Record, useNotify } from 'react-admin';
import { useForm, Controller } from 'react-hook-form';
import { Textarea } from 'src/shared/primitives';
import { EditFormProps } from 'src/shared/interfaces';
import View from 'src/shared/constants/Views';
import { getWord } from 'src/shared/API';
import removePayloadFields from 'src/shared/utils/removePayloadFields';
import useBeforeWindowUnload from 'src/hooks/useBeforeWindowUnload';
import { ExampleClientData, Word } from 'src/backend/controllers/utils/interfaces';
import isVerb from 'src/backend/shared/utils/isVerb';
import { handleUpdateDocument } from 'src/shared/constants/actionsMap';
import { invalidRelatedTermsWordClasses } from 'src/backend/controllers/utils/determineIsAsCompleteAsPossible';
import ActionTypes from 'src/shared/constants/ActionTypes';
import Collections from 'src/shared/constants/Collections';
import WordEditFormResolver from './WordEditFormResolver';
import { sanitizeWith, sanitizeExamples, onCancel } from '../utils';
import DefinitionsForm from './components/DefinitionsForm';
import ExamplesForm from './components/ExamplesForm';
import VariationsForm from './components/VariationsForm';
import StemsForm from './components/StemsForm';
import RelatedTermsForm from './components/RelatedTermsForm';
import HeadwordForm from './components/HeadwordForm';
import TagsForm from './components/TagsForm';
import FrequencyForm from './components/FrequencyForm';
import TensesForm from './components/TensesForm';
import AudioRecorder from '../AudioRecorder';
import CurrentDialectsForms from './components/CurrentDialectForms/CurrentDialectsForms';
import FormHeader from '../FormHeader';
import createDefaultWordFormValues from './utils/createDefaultWordFormValues';

type FormData = {
  definitions: any[],
  variations: { text: string }[],
  relatedTerms: { id: string }[],
  stems: { id: string }[],
  examples: ExampleClientData[],
  tags: string[],
};

const WordEditForm = ({
  view,
  record,
  save,
  resource = '',
  history,
  isPreExistingSuggestion,
} : EditFormProps) : ReactElement => {
  /* Injected empty dialects object for new suggestions */
  if (!record?.dialects) {
    record.dialects = [];
  };
  if (record.examples) {
    record.examples.sort((prev, next) => prev.igbo.localeCompare(next.igbo));
  }

  const {
    handleSubmit,
    getValues,
    setValue,
    control,
    errors,
    watch,
  } = useForm({
    defaultValues: createDefaultWordFormValues(record),
    ...WordEditFormResolver(),
  });
  watch('definitions');
  const [originalRecord, setOriginalRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialects, setDialects] = useState(record.dialects);
  const [warningMessage, setWarningMessage] = useState('');
  const notify = useNotify();
  const toast = useToast();
  const watchedWordClasses = compact((get(getValues(), 'definitions') || []).map(({ wordClass }) => wordClass?.value));
  const isAnyDefinitionGroupAVerb = watchedWordClasses.some((watchedWordClass) => isVerb(watchedWordClass));
  const areAllWordClassesInvalidForRelatedTerms = watchedWordClasses.every((watchedWordClass) => (
    invalidRelatedTermsWordClasses.includes(watchedWordClass?.value)));

  const handleWarningMessage = (e) => {
    setWarningMessage((record?.word || '') !== e.target.value
      ? 'A change in the headword has been detected. Please consider re-recording the audio to match.'
      : '');
  };

  /* Gets tag values */
  const sanitizeTags = (tags: Word['tags']) => (
    tags.map(({ value }) => value)
  );

  /* Prepares the data to be cached */
  const createCacheWordData = (data: FormData, record: Record | Word = { id: null, dialects: {} }) => {
    const cleanedData = omit({
      ...record,
      ...data,
      definitions: (data.definitions || []).map((definition) => ({
        ...definition,
        wordClass: definition.wordClass.value,
        definitions: sanitizeWith(definition.definitions, 'text'),
        nsibidiCharacters: sanitizeWith(definition.nsibidiCharacters || []),
      })),
      variations: sanitizeWith(data.variations || [], 'text'),
      relatedTerms: sanitizeWith(uniqBy(data.relatedTerms || [], 'id')),
      stems: sanitizeWith(uniqBy(data.stems || [], 'id')),
      examples: sanitizeExamples(data.examples || []),
      pronunciation: getValues().pronunciation || '',
      tags: sanitizeTags(data.tags || []),
    }, ['crowdsourcing']);
    return cleanedData;
  };

  /* Combines the approvals, denials, and cached form data to
   * send to the backend
   */
  const onSubmit = (data) => {
    try {
      setIsSubmitting(true);
      const preparedData = omit(assign(createCacheWordData(data, record), {
        approvals: map(record.approvals, (approval) => approval.uid),
        denials: map(record.denials, (denial) => denial.uid),
      }), [view === View.CREATE ? 'id' : '']);
      const cleanedData = removePayloadFields(preparedData);
      localStorage.removeItem('igbo-api-admin-form');
      save(cleanedData, View.SHOW, {
        onSuccess: ({ data }) => {
          setIsSubmitting(false);
          handleUpdateDocument({ type: ActionTypes.NOTIFY, resource, record: data });
          notify(`Document successfully ${view === View.CREATE ? 'created' : 'updated'}`, 'info');

          // Pushing new history state to completely reload the view page with record data
          const wordId = data.id || record.id;
          window.location.hash = `#/${Collections.WORD_SUGGESTIONS}/${wordId}/${View.SHOW}`;
        },
        onFailure: (error: any) => {
          const { body, message, error: errorMessage } = error;
          console.log('Saving error', error);
          toast({
            title: 'Error',
            description: body?.error || message || errorMessage || 'An error occurred while saving word suggestion',
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
          setIsSubmitting(false);
        },
      });
    } catch (err) {
      console.log('Caught saving error', err);
      toast({
        title: 'Error',
        description: 'An error occurred while saving word suggestion',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      setIsSubmitting(false);
    }
  };

  useBeforeWindowUnload();
  useEffect(() => {
    (async () => {
      if (record.originalWordId) {
        setOriginalRecord(await getWord(record.originalWordId));
      }
    })();
  }, []);
  useEffect(() => {
    if (isPreExistingSuggestion) {
      toast({
        title: 'Pre-existing Word Suggestion',
        description: "We've redirected you to a pre-existing word suggestion, to avoid suggestion duplication.",
        status: 'info',
        duration: 9000,
        isClosable: true,
      });
    }
  }, []);

  /* Scroll back to the top to let the editor know an error occurred */
  useEffect(() => {
    if (Object.keys(errors || {}).length) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [errors]);

  return (
    <form data-test="word-edit-form" onSubmit={handleSubmit(onSubmit)}>
      <Box className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
        {record.originalWordId && view === View.CREATE ? (
          <Box>
            <Heading as="h2" className="form-header">Parent Word Id:</Heading>
            <a
              className="link"
              data-test="original-id"
              href={`#/words/${record.originalWordId || record.id}/show`}
            >
              <Text fontFamily="monospace">
                {record.originalWordId || record.id}
              </Text>
            </a>
          </Box>
        ) : null }
      </Box>

      <Box className="w-full">
        <Box className="flex flex-col lg:flex-row space-x-0 lg:space-x-4">
          <Box className="flex flex-col w-full lg:w-1/2">
            <HeadwordForm
              errors={errors}
              control={control}
              record={record}
              watch={watch}
              onChange={handleWarningMessage}
            />
          </Box>
          <Box className="w-full lg:w-1/2 flex flex-col">
            <Controller
              render={() => (
                <AudioRecorder
                  path="headword"
                  getFormValues={getValues}
                  setPronunciation={setValue}
                  record={record}
                  originalRecord={originalRecord}
                  warningMessage={warningMessage}
                />
              )}
              defaultValue={record.pronunciation || ''}
              name="pronunciation"
              control={control}
            />
            <TagsForm
              errors={errors}
              control={control}
              record={record}
            />
            <FrequencyForm
              errors={errors}
              control={control}
              record={record}
            />
          </Box>
        </Box>
      </Box>

      <Box className="mb-10">
        <DefinitionsForm errors={errors} control={control} record={record} />
        {isAnyDefinitionGroupAVerb ? (
          <TensesForm
            record={record}
            errors={errors}
            control={control}
          />
        ) : null}
      </Box>

      <Tabs variant="enclosed" colorScheme="green">
        <TabList>
          <Tab>Dialects</Tab>
          <Tab>Examples</Tab>
          <Tab>Connected Terms</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <CurrentDialectsForms
              errors={errors}
              record={record}
              originalRecord={originalRecord}
              control={control}
              setDialects={setDialects}
              dialects={dialects}
            />
          </TabPanel>
          <TabPanel>
            <ExamplesForm control={control} />
          </TabPanel>
          <TabPanel>
            <Box className="grid grid-flow-row grid-cols-1 lg:grid-cols-2 gap-4">
              <StemsForm
                errors={errors}
                control={control}
                record={record}
              />
              <VariationsForm control={control} />
              {!areAllWordClassesInvalidForRelatedTerms.length || !areAllWordClassesInvalidForRelatedTerms ? (
                <RelatedTermsForm
                  errors={errors}
                  control={control}
                  record={record}
                />
              ) : null}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
      {/*
        * Must use record.dialects in order for all dialects to render on first pain
        * in order for react-hook-form to initialize all their values in the form.
        */}
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
          defaultValue={record.editorsNotes || getValues().editorsNotes || ''}
          control={control}
        />
        <Controller
          render={(props) => (
            <input {...props} style={{ pointerEvents: 'none', visibility: 'hidden' }} />
          )}
          name="twitterPollId"
          defaultValue={record.twitterPollId || ''}
          control={control}
        />
      </Box>
      <Box className="form-buttons-container space-y-4 lg:space-y-0 lg:space-x-4">
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

export default WordEditForm;
