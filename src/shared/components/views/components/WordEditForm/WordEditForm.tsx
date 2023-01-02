import React, { ReactElement, useState, useEffect } from 'react';
import {
  assign,
  map,
  omit,
  values,
} from 'lodash';
import {
  Box,
  Button,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Record, useNotify, useRedirect } from 'react-admin';
import { useForm, Controller } from 'react-hook-form';
import { Textarea } from 'src/shared/primitives';
import { EditFormProps } from 'src/shared/interfaces';
import View from 'src/shared/constants/Views';
import WordClass from 'src/shared/constants/WordClass';
import { getWord, removePayloadFields } from 'src/shared/API';
import useBeforeWindowUnload from 'src/hooks/useBeforeWindowUnload';
import { Word } from 'src/backend/controllers/utils/interfaces';
import isVerb from 'src/backend/shared/utils/isVerb';
import { handleUpdateDocument } from 'src/shared/constants/actionsMap';
import { invalidRelatedTermsWordClasses } from 'src/backend/controllers/utils/determineIsAsCompleteAsPossible';
import WordAttributes from 'src/backend/shared/constants/WordAttributes';
import WordEditFormResolver from './WordEditFormResolver';
import { sanitizeArray, onCancel } from '../utils';
import DefinitionsForm from './components/DefinitionsForm';
import ExamplesForm from './components/ExamplesForm';
import VariationsForm from './components/VariationsForm';
import StemsForm from './components/StemsForm';
import RelatedTermsForm from './components/RelatedTermsForm';
import HeadwordForm from './components/HeadwordForm';
import TagsForm from './components/TagsForm';
import TensesForm from './components/TensesForm';
import AudioRecorder from '../AudioRecorder';
import CurrentDialectsForms from './components/CurrentDialectForms/CurrentDialectsForms';
import FormHeader from '../FormHeader';

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
    defaultValues: {
      dialects: record?.dialects || [],
      examples: record?.examples
        ? record.examples.map((example) => ({ ...example, pronunciation: example.pronunciation || '' }))
        : [],
      relatedTerms: record.relatedTerms || [],
      stems: record.stems || [],
      nsibidi: record.nsibidi,
      tenses: record.tenses || {},
      attributes: record.attributes || Object.values(WordAttributes).reduce((finalAttributes, attribute) => ({
        ...finalAttributes,
        [attribute.value]: false,
      }), {}),
    },
    ...WordEditFormResolver(),
  });
  const [originalRecord, setOriginalRecord] = useState(null);
  const [definitions, setDefinitions] = useState(record.definitions || [{
    wordClass: '',
    definitions: [''],
    igboDefinitions: [],
    nsibidi: '',
  }]);
  const [examples, setExamples] = useState(record.examples || []);
  const [variations, setVariations] = useState(record.variations || []);
  const [stems, setStems] = useState(record.stems || []);
  const [relatedTerms, setRelatedTerms] = useState(record.relatedTerms || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialects, setDialects] = useState(record.dialects);
  const notify = useNotify();
  const redirect = useRedirect();
  const toast = useToast();
  const options = values(WordClass);
  const watchedWordClasses = definitions.map(({ wordClass }) => wordClass);
  const isAnyDefinitionGroupAVerb = watchedWordClasses.some((watchedWordClass) => isVerb(watchedWordClass));
  const areAllWordClassesInvalidForRelatedTerms = watchedWordClasses.every((watchedWordClass) => (
    invalidRelatedTermsWordClasses.includes(watchedWordClass?.value)));

  /* Gets the original example id and associated words to prepare to send to the API */
  const sanitizeExamples = (examples = []) => {
    const examplesFromIds: NodeListOf<HTMLElement> = document.querySelectorAll('[data-example-id]');
    const originalExamplesFromIds: NodeListOf<HTMLElement> = document.querySelectorAll('[data-original-example-id]');
    const examplesFromAssociatedWords: NodeListOf<HTMLElement> = document.querySelectorAll('[data-associated-words]');
    return examples
      .map(({
        igbo,
        english,
        meaning,
        nsibidi,
        pronunciation,
      }, index) => (
        {
          igbo,
          english,
          nsibidi,
          pronunciation,
          meaning,
          ...(originalExamplesFromIds[index]?.dataset?.originalExampleId
            ? { originalExampleId: originalExamplesFromIds[index]?.dataset?.originalExampleId }
            : {}
          ),
          ...(examplesFromIds[index]?.dataset?.exampleId
            ? { id: examplesFromIds[index]?.dataset?.exampleId }
            : {}
          ),
          associatedWords: examplesFromAssociatedWords[index]?.dataset?.associatedWords.split(','),
        }
      ))
      .filter((example) => example.igbo && example.english);
  };

  /* Prepares the data to be cached */
  const createCacheWordData = (data, record: Record | Word = { id: null, dialects: {} }) => {
    const cleanedData = {
      ...record,
      ...data,
      definitions: (data.definitions || []).map((definition) => ({
        ...definition,
        wordClass: definition.wordClass.value,
        definitions: sanitizeArray(definition.definitions),
      })),
      variations: sanitizeArray(data.variations),
      relatedTerms: sanitizeArray(data.relatedTerms),
      stems: sanitizeArray(data.stems),
      examples: sanitizeExamples(examples),
      pronunciation: getValues().pronunciation || '',
    };
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
          handleUpdateDocument({ resource, record: data });
          notify(`Document successfully ${view === View.CREATE ? 'created' : 'updated'}`, 'info');
          redirect(View.SHOW, '/wordSuggestions', data.id || record.id, { ...data, id: data.id || record.id });
        },
        onFailure: (error: any) => {
          const { body, message, error: errorMessage } = error;
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
      console.log(err);
      setIsSubmitting(false);
    }
  };

  /* Caches the form data with browser cookies */
  const cacheForm = () => {
    const data = getValues();
    const cleanedData = createCacheWordData(data, record);
    localStorage.setItem('igbo-api-admin-form', JSON.stringify(cleanedData));
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

  return (
    <form onChange={cacheForm} onSubmit={handleSubmit(onSubmit)}>
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
              getValues={getValues}
              watch={watch}
            />
            <TagsForm
              errors={errors}
              control={control}
              record={record}
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
                />
              )}
              defaultValue={record.pronunciation}
              name="pronunciation"
              control={control}
            />
            <CurrentDialectsForms
              errors={errors}
              record={record}
              originalRecord={originalRecord}
              control={control}
              getValues={getValues}
              setValue={setValue}
              setDialects={setDialects}
              dialects={dialects}
            />
            <Box className="flex flex-col w-full">
              <StemsForm
                errors={errors}
                stems={stems}
                setStems={setStems}
                control={control}
                setValue={setValue}
                record={record}
              />
            </Box>
          </Box>
        </Box>
      </Box>
      <DefinitionsForm
        getValues={getValues}
        cacheForm={cacheForm}
        options={options}
        record={record}
        definitions={definitions}
        setDefinitions={setDefinitions}
        errors={errors}
        control={control}
      />
      {isAnyDefinitionGroupAVerb ? (
        <TensesForm
          record={record}
          errors={errors}
          control={control}
        />
      ) : null}
      <ExamplesForm
        examples={examples}
        setExamples={setExamples}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
      />
      <Box className={`flex 
        ${!areAllWordClassesInvalidForRelatedTerms ? 'lg:flex-row lg:space-x-3 lg:justify-between' : ''} 
        flex-col`}
      >
        <VariationsForm
          variations={variations}
          setVariations={setVariations}
          control={control}
        />
        {!areAllWordClassesInvalidForRelatedTerms ? (
          <RelatedTermsForm
            errors={errors}
            relatedTerms={relatedTerms}
            setRelatedTerms={setRelatedTerms}
            control={control}
            setValue={setValue}
            record={record}
          />
        ) : null}
      </Box>
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
          defaultValue={record.editorsNotes || getValues().editorsNotes}
          control={control}
        />
        <Controller
          render={(props) => (
            <input {...props} style={{ pointerEvents: 'none', visibility: 'hidden' }} />
          )}
          name="twitterPollId"
          defaultValue={record.twitterPollId}
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
