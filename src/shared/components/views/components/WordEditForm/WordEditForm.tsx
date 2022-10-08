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
  useToast,
} from '@chakra-ui/react';
import { Record, useNotify, useRedirect } from 'react-admin';
import { useForm, Controller } from 'react-hook-form';
import { Textarea } from 'src/shared/primitives';
import { EditFormProps } from 'src/shared/interfaces';
import View from 'src/shared/constants/Views';
import WordClass from 'src/shared/constants/WordClass';
import { getWord } from 'src/shared/API';
import useBeforeWindowUnload from 'src/hooks/useBeforeWindowUnload';
import { Word, WordDialect } from 'src/backend/controllers/utils/interfaces';
import isVerb from 'src/backend/shared/utils/isVerb';
import { handleUpdateDocument } from 'src/shared/constants/actionsMap';
import { invalidRelatedTermsWordClasses } from 'src/backend/controllers/utils/determineIsAsCompleteAsPossible';
import WordEditFormResolver from './WordEditFormResolver';
import { sanitizeArray, onCancel } from '../utils';
import DefinitionsForm from './components/DefinitionsForm';
import VariationsForm from './components/VariationsForm';
import StemsForm from './components/StemsForm';
import RelatedTermsForm from './components/RelatedTermsForm';
import PartOfSpeechForm from './components/PartOfSpeechForm';
import HeadwordForm from './components/HeadwordForm';
import TagsForm from './components/TagsForm';
import NsibidiForm from './components/NsibidiForm';
import TensesForm from './components/TensesForm';
import ExamplesForm from './components/ExamplesForm';
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
    record.dialects = {};
  };
  const {
    handleSubmit,
    getValues,
    setValue,
    control,
    errors,
    watch,
  } = useForm({
    defaultValues: {
      dialects: record.dialects,
      examples: record?.examples
        ? record.examples.map((example) => ({ ...example, pronunciation: example.pronunciation || '' }))
        : [],
      wordClass: {
        label: WordClass[record.wordClass]?.label || '[UPDATE PART OF SPEECH]',
        value: WordClass[record.wordClass]?.value || null,
      },
      relatedTerms: record.relatedTerms || [],
      stems: record.stems || [],
      nsibidi: record.nsibidi,
      tenses: record.tenses || {},
    },
    ...WordEditFormResolver(),
  });
  const [originalRecord, setOriginalRecord] = useState(null);
  const [definitions, setDefinitions] = useState(record.definitions || ['']);
  const [examples, setExamples] = useState(record.examples || []);
  const [variations, setVariations] = useState(record.variations || []);
  const [stems, setStems] = useState(record.stems || []);
  const [relatedTerms, setRelatedTerms] = useState(record.relatedTerms || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialects, setDialects] = useState(Object.entries(record.dialects || {}).map(([word, value]) => (
    { ...value, word }
  )));
  const notify = useNotify();
  const redirect = useRedirect();
  const toast = useToast();
  const options = values(WordClass);
  const watchWordClass = watch('wordClass');

  /* Gets the original example id and associated words to prepare to send to the API */
  const sanitizeExamples = (examples = []) => {
    const examplesFromIds: NodeListOf<HTMLElement> = document.querySelectorAll('[data-example-id]');
    const originalExamplesFromIds: NodeListOf<HTMLElement> = document.querySelectorAll('[data-original-example-id]');
    const examplesFromAssociatedWords: NodeListOf<HTMLElement> = document.querySelectorAll('[data-associated-words]');
    return examples
      .map(({ igbo, english, pronunciation }, index) => (
        {
          igbo,
          english,
          ...(originalExamplesFromIds[index]?.dataset?.originalExampleId
            ? { originalExampleId: originalExamplesFromIds[index]?.dataset?.originalExampleId }
            : {}
          ),
          ...(examplesFromIds[index]?.dataset?.exampleId
            ? { id: examplesFromIds[index]?.dataset?.exampleId }
            : {}
          ),
          associatedWords: examplesFromAssociatedWords[index]?.dataset?.associatedWords.split(','),
          pronunciation,
        }
      ))
      .filter((example) => example.igbo && example.english);
  };

  /* Prepares dialects to include all required keys (dialectal word) for Mongoose schema validation */
  const prepareDialects = (): { dialects: { [key: string]: WordDialect } } => {
    const formDialects = getValues().dialects || {};
    return (
      dialects.reduce((finalDialects, dialect) => (
        /* The pronunciation, variations, and dialect are required for Mongoose schema validation */
        {
          ...finalDialects,
          [dialect.word]: {
            dialects: Array.from(new Set([
              ...(finalDialects?.[dialect.word]?.dialects || []),
              ...dialect.dialects,
            ])),
            variations: Array.from(new Set([
              ...(finalDialects?.[dialect.word]?.variations || []),
              ...dialect.variations,
            ])),
            pronunciation: !finalDialects?.[dialect.word]?.pronunciation
              ? formDialects[dialect.word]?.pronunciation
              : '',
          },
        }
      ), {})
    );
  };

  /* Prepares the data to be cached */
  const createCacheWordData = (data, record: Record | Word = { id: null, dialects: {} }) => {
    const dialects = prepareDialects() || {};
    const cleanedData = {
      ...record,
      ...data,
      dialects,
      definitions: sanitizeArray(data.definitions),
      variations: sanitizeArray(data.variations),
      relatedTerms: sanitizeArray(data.relatedTerms),
      stems: sanitizeArray(data.stems),
      examples: sanitizeExamples(data.examples),
      wordClass: data.wordClass.value,
      pronunciation: getValues().pronunciation || '',
    };
    return cleanedData;
  };

  /* Combines the approvals, denials, and cached form data to
   * send to the backend
   */
  const onSubmit = (data) => {
    setIsSubmitting(true);
    const cleanedData = omit(assign(createCacheWordData(data, record), {
      approvals: map(record.approvals, (approval) => approval.uid),
      denials: map(record.denials, (denial) => denial.uid),
    }), [view === View.CREATE ? 'id' : '']);
    localStorage.removeItem('igbo-api-admin-form');
    save(cleanedData, View.SHOW, {
      onSuccess: ({ data }) => {
        setIsSubmitting(false);
        handleUpdateDocument({ resource, record: data });
        notify(`Document successfully ${view === View.CREATE ? 'created' : 'updated'}`, 'info');
        redirect(View.SHOW, '/wordSuggestions', data.id || record.id, { ...data, id: data.id || record.id });
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
            <h2 className="form-header">Origin Word Id:</h2>
            <a
              className="link"
              data-test="original-id"
              href={`#/words/${record.originalWordId || record.id}/show`}
            >
              {record.originalWordId || record.id}
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
            <PartOfSpeechForm
              errors={errors}
              control={control}
              getValues={getValues}
              cacheForm={cacheForm}
              options={options}
              record={record}
            />
            <TagsForm
              errors={errors}
              control={control}
              record={record}
            />
            <NsibidiForm
              control={control}
              record={record}
              getValues={getValues}
            />
            <Box className="flex flex-col lg:flex-row space-x-0 lg:space-x-6 lg:mt-3">
              <Box className="w-full">
                <DefinitionsForm
                  definitions={definitions}
                  setDefinitions={setDefinitions}
                  errors={errors}
                  control={control}
                />
                {isVerb(watchWordClass.value) ? (
                  <TensesForm
                    record={record}
                    errors={errors}
                    control={control}
                  />
                ) : null}
              </Box>
            </Box>
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
            <Box className="flex flex-row justify-between items-center">
              <FormHeader
                title="Dialectal Variations"
                tooltip="These are the dialectal (sound) variations with the current word."
              />
            </Box>
            <CurrentDialectsForms
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
      <ExamplesForm
        examples={examples}
        setExamples={setExamples}
        getValues={getValues}
        setValue={setValue}
        control={control}
      />
      <VariationsForm
        variations={variations}
        setVariations={setVariations}
        control={control}
      />
      {!invalidRelatedTermsWordClasses.includes(watchWordClass.value) ? (
        <RelatedTermsForm
          errors={errors}
          relatedTerms={relatedTerms}
          setRelatedTerms={setRelatedTerms}
          control={control}
          setValue={setValue}
          record={record}
        />
      ) : null}
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
          defaultValue={record.userComments || getValues().userComments}
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
