import React, { ReactElement, useState, useEffect } from 'react';
import { assign, get, omit } from 'lodash';
import { Box, Button, IconButton, Tooltip, useToast } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import Select from 'react-select';
import { useNotify } from 'react-admin';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { EditFormProps } from 'src/shared/interfaces';
import View from 'src/shared/constants/Views';
import removePayloadFields from 'src/shared/utils/removePayloadFields';
import useBeforeWindowUnload from 'src/hooks/useBeforeWindowUnload';
import { handleUpdateDocument } from 'src/shared/constants/actionsMap';
import ActionTypes from 'src/shared/constants/ActionTypes';
import Collections from 'src/shared/constants/Collections';
import { Input } from 'src/shared/primitives';
import WordClass from 'src/backend/shared/constants/WordClass';
import RadicalsForm from 'src/shared/components/views/components/NsibidiCharacterEditForm/components/RadicalsForm/RadicalsForm';
import NsibidiInput from 'src/shared/components/views/components/WordEditForm/components/NsibidiForm/NsibidiInput';
import NsibidiCharacterEditFormResolver from './NsibidiCharacterEditFormResolver';
import { onCancel } from '../utils';
import FormHeader from '../FormHeader';

const NsibidiCharacterEditForm = ({ view, record, save, resource = '', history }: EditFormProps): ReactElement => {
  const { handleSubmit, control, getValues, errors, formState } = useForm({
    defaultValues: {
      ...(record || {}),
      wordClass: {
        label: record.wordClass || '',
        value: record.wordClass || '',
      },
    },
    ...NsibidiCharacterEditFormResolver(),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  const { isDirty } = formState;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    fields: definitions,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'definitions',
  });
  const notify = useNotify();
  const toast = useToast();
  const options = Object.values(WordClass).map(({ nsibidiValue }) => ({ label: nsibidiValue, value: nsibidiValue }));

  const onSubmit = (data) => {
    try {
      setIsSubmitting(true);
      const preparedData = omit(assign(data, { wordClass: data.wordClass.value }), [view === View.CREATE ? 'id' : '']);
      const cleanedData = removePayloadFields(preparedData);
      save(cleanedData, View.SHOW, {
        onSuccess: ({ data }) => {
          setIsSubmitting(false);
          handleUpdateDocument({ type: ActionTypes.NOTIFY, resource, record: data });
          notify(`Document successfully ${view === View.CREATE ? 'created' : 'updated'}`, 'info');

          // Pushing new history state to completely reload the view page with record data
          const wordId = data.id || record.id;
          window.location.hash = `#/${Collections.NSIBIDI_CHARACTERS}/${wordId}/${View.SHOW}`;
        },
        onFailure: (error: any) => {
          const { body, message, error: errorMessage } = error;
          console.log('Saving error', error);
          toast({
            title: 'Error',
            description: body?.error || message || errorMessage || 'An error occurred while saving Nsịbịdị character',
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
        description: 'An error occurred while saving Nsịbịdị character',
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
    <form data-test="nsibidi-character-edit-form" onSubmit={handleSubmit(onSubmit)}>
      <FormHeader
        title="Nsịbịdị"
        tooltip="This field uses the Chinese Unicode to represent its corresponding Nsịbịdị"
      />
      <Controller
        render={(props) => (
          <NsibidiInput
            {...props}
            control={control}
            nsibidiFormName="nsibidi"
            placeholder="Input in Nsịbịdị"
            data-test="nsibidi-input"
            enableSearch={false}
          />
        )}
        name="nsibidi"
        control={control}
        defaultValue={get(record, 'nsibidi') || getValues().nsibidi || ''}
      />
      <FormHeader title="Pronunciation" tooltip="Text representation of the Nsịbịdị pronunciation" />
      <Controller
        render={(props) => (
          <NsibidiInput
            {...props}
            control={control}
            nsibidiFormName="pronunciation"
            placeholder="Nsịbịdị pronunciation"
            data-test="pronunciation-input"
            enableSearch={false}
          />
        )}
        name="pronunciation"
        control={control}
        defaultValue={get(record, 'pronunciation') || getValues().pronunciation || ''}
      />
      {errors.pronunciation && (
        <p className="error">{errors.pronunciation.message || errors.pronunciation[0]?.message}</p>
      )}
      <FormHeader title="Part of Speech" tooltip="Part of speech in Nsịbịdị" />
      <Box data-test="nsibidi-word-class-input-container">
        <Controller
          render={(props) => (
            <Select {...props} options={options} className="akagu" data-test="nsibidi-pronunciation" />
          )}
          name="wordClass"
          control={control}
          defaultValue={get(record, 'wordClass') || getValues().wordClass || ''}
        />
      </Box>
      {errors.wordClass && <p className="error">{errors.wordClass.message || errors.wordClass[0]?.message}</p>}
      <FormHeader title="Definitions" tooltip="Nsịbịdị definitions" />
      {definitions?.length
        ? definitions.map((definition, index) => (
            <Box key={definition.id} className="flex flex-row justify-between items-center space-x-2 my-2">
              <Controller
                render={(props) => (
                  <Input
                    {...props}
                    defaultValue={definition.text}
                    placeholder="Nsịbịdị definition"
                    data-test={`definitions-${index}-input`}
                  />
                )}
                name={`definitions.${index}.text`}
                control={control}
                defaultValue={get(record, `definitions[${index}].text`) || getValues().definitions?.[index]?.text || ''}
              />
              {definitions.length > 1 ? (
                <Tooltip label="Deletes the current definition">
                  <IconButton
                    backgroundColor="red.100"
                    _hover={{
                      backgroundColor: 'red.200',
                    }}
                    aria-label="Delete definition"
                    onClick={() => remove(index)}
                    className="ml-3"
                    icon={(() => (
                      <>🗑</>
                    ))()}
                  />
                </Tooltip>
              ) : null}
            </Box>
          ))
        : null}
      <Button width="full" colorScheme="green" aria-label="Add Definition" onClick={append} leftIcon={<AddIcon />}>
        Add definition
      </Button>
      {errors.definitions && <p className="error">{errors.definitions.message || errors.definitions[0]?.message}</p>}
      <Box className="w-full mt-4">
        <RadicalsForm errors={errors} control={control} record={record} />
      </Box>
      <Box className="form-buttons-container space-y-4 lg:space-y-0 lg:space-x-4">
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
          type="submit"
          colorScheme="green"
          variant="solid"
          isDisabled={!isDirty}
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

export default NsibidiCharacterEditForm;
