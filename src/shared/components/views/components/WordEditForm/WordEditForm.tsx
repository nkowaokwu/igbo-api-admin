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
import { Textarea } from '../../../../primitives';
import WordEditFormResolver from './WordEditFormResolver';
import { sanitizeArray, onCancel } from '../utils';
import { EditFormProps } from '../../../../interfaces';
import View from '../../../../constants/Views';
import WordClass from '../../../../constants/WordClass';
import { getWord } from '../../../../API';
import useBeforeWindowUnload from '../../../../../hooks/useBeforeWindowUnload';
import { Word, WordDialect } from '../../../../../backend/controllers/utils/interfaces';
import DefinitionsForm from './components/DefinitionsForm';
import VariationsForm from './components/VariationsForm';
import StemsForm from './components/StemsForm';
import SynonymsForm from './components/SynonymsForm';
import AntonymsForm from './components/AntonymsForm';
import PartOfSpeechForm from './components/PartOfSpeechForm';
import HeadwordForm from './components/HeadwordForm';
import NsibidiForm from './components/NsibidiForm';
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
  } = useForm({
    defaultValues: {
      dialects: record.dialects,
      examples: record.examples,
      wordClass: {
        label: WordClass[record.wordClass]?.label || '[UPDATE PART OF SPEECH]',
        value: WordClass[record.wordClass]?.value || null,
      },
      synonyms: record.synonyms || [],
      antonyms: record.antonyms || [],
      stems: record.stems || [],
      nsibidi: record.nsibidi,
    },
    ...WordEditFormResolver(),
  });
  const [originalRecord, setOriginalRecord] = useState(null);
  const [definitions, setDefinitions] = useState(record.definitions || ['']);
  const [examples, setExamples] = useState(record.examples || []);
  const [variations, setVariations] = useState(record.variations || []);
  const [stems, setStems] = useState(record.stems || []);
  const [synonyms, setSynonyms] = useState(record.synonyms || []);
  const [antonyms, setAntonyms] = useState(record.antonyms || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialects, setDialects] = useState(Object.entries(record.dialects || {}).map(([word, value]) => (
    { ...value, word }
  )));
  const notify = useNotify();
  const redirect = useRedirect();
  const toast = useToast();
  const options = values(WordClass);

  /* Gets the original example id and associated words to prepare to send to the API */
  const sanitizeExamples = (examples = []) => {
    const examplesFromIds: NodeListOf<HTMLElement> = document.querySelectorAll('[data-example-id]');
    const originalExamplesFromIds: NodeListOf<HTMLElement> = document.querySelectorAll('[data-original-example-id]');
    const examplesFromAssociatedWords: NodeListOf<HTMLElement> = document.querySelectorAll('[data-associated-words]');
    return examples
      .map(({ igbo, english }, index) => (
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
      synonyms: sanitizeArray(data.synonyms),
      antonyms: sanitizeArray(data.antonyms),
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
            />
            <NsibidiForm
              control={control}
              record={record}
              getValues={getValues}
            />
            <PartOfSpeechForm
              errors={errors}
              control={control}
              getValues={getValues}
              cacheForm={cacheForm}
              options={options}
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
          </Box>
        </Box>
        <Box className="flex flex-col lg:flex-row space-x-0 lg:space-x-6 lg:mt-3">
          <Box className="w-full lg:w-1/2">
            <DefinitionsForm
              definitions={definitions}
              setDefinitions={setDefinitions}
              errors={errors}
              control={control}
            />
          </Box>
          <Box className="flex flex-col w-full lg:w-1/2">
            <VariationsForm
              variations={variations}
              setVariations={setVariations}
              control={control}
            />
            <StemsForm
              errors={errors}
              stems={stems}
              setStems={setStems}
              control={control}
              setValue={setValue}
              record={record}
            />
            <SynonymsForm
              errors={errors}
              synonyms={synonyms}
              setSynonyms={setSynonyms}
              control={control}
              setValue={setValue}
              record={record}
            />
            <AntonymsForm
              errors={errors}
              antonyms={antonyms}
              setAntonyms={setAntonyms}
              control={control}
              setValue={setValue}
              record={record}
            />
          </Box>
        </Box>
      </Box>
      <ExamplesForm
        examples={examples}
        setExamples={setExamples}
        getValues={getValues}
        control={control}
      />
      {/*
        * Must use record.dialects in order for all dialects to render on first pain
        * in order for react-hook-form to initialize all their values in the form.
        */}
      <Box className="flex flex-row justify-between items-center">
        <FormHeader
          title="Current Dialects"
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
            />
          )}
          name="userComments"
          defaultValue={record.userComments || getValues().userComments}
          control={control}
        />
      </Box>
      <Box className="form-buttons-container space-y-4 lg:space-y-0 lg:space-x-4">
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
          isLoading={isSubmitting}
          loadingText={view === View.CREATE ? 'Submitting' : 'Updating'}
        >
          {view === View.CREATE ? 'Submit' : 'Update'}
        </Button>
      </Box>
    </form>
  );
};

export default WordEditForm;
