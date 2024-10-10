import React, { ReactElement, useState, useEffect } from 'react';
import { assign, get, omit } from 'lodash';
import { Box, Button, useToast } from '@chakra-ui/react';
import { useNotify } from 'react-admin';
import { Controller, useForm } from 'react-hook-form';
import { EditFormProps } from 'src/shared/interfaces';
import View from 'src/shared/constants/Views';
import removePayloadFields from 'src/shared/utils/removePayloadFields';
import useBeforeWindowUnload from 'src/hooks/useBeforeWindowUnload';
import { handleUpdateDocument } from 'src/shared/constants/actionsMap';
import ActionTypes from 'src/shared/constants/ActionTypes';
import Collections from 'src/shared/constants/Collection';
// eslint-disable-next-line max-len
import RadicalsForm from 'src/shared/components/views/components/NsibidiCharacterEditForm/components/RadicalsForm/RadicalsForm';
import NsibidiInput from 'src/shared/components/views/components/WordEditForm/components/NsibidiForm/NsibidiInput';
// eslint-disable-next-line max-len
import CharacterAttributesForm from 'src/shared/components/views/components/NsibidiCharacterEditForm/components/CharacterAttributesForm';
import NsibidiCharacterAttributeEnum from 'src/backend/shared/constants/NsibidiCharacterAttributeEnum';
import createDefaultNsibidiCharacterFormValues from 'src/shared/components/views/components/WordEditForm/utils/createDefaultNsibidiCharacterFormValues';
import NsibidiCharacterEditFormResolver from './NsibidiCharacterEditFormResolver';
import { onCancel } from '../utils';
import FormHeader from '../FormHeader';

const NsibidiCharacterEditForm = ({ view, record, save, resource = '', history }: EditFormProps): ReactElement => {
  const {
    handleSubmit,
    control,
    getValues,
    formState: { isDirty, errors },
  } = useForm({
    defaultValues: createDefaultNsibidiCharacterFormValues(record),
    ...NsibidiCharacterEditFormResolver(),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const notify = useNotify();
  const toast = useToast();

  const onSubmit = (data) => {
    try {
      setIsSubmitting(true);
      const preparedData = omit(assign(data), [view === View.CREATE ? 'id' : '']);
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
          // console.log('Saving error', error);
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
      // console.log('Caught saving error', err);
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
      <Box className="flex flex-col lg:flex-row justify-between items-start">
        <Box className="flex flex-col flex-1">
          <CharacterAttributesForm record={record} getValues={getValues} control={control} />
          <Controller
            render={({ field: props }) => (
              <NsibidiInput
                {...props}
                control={control}
                nsibidiFormName="nsibidi"
                placeholder="Input in Nsịbịdị"
                data-test="nsibidi-input"
                enableSearch={false}
                showLegacy={get(getValues(), `attributes.${NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS}`)}
              />
            )}
            name="nsibidi"
            control={control}
            defaultValue={get(record, 'nsibidi') || getValues().nsibidi || ''}
          />
        </Box>
      </Box>
      {!get(getValues(), `attributes[${NsibidiCharacterAttributeEnum.IS_RADICAL}]`) ? (
        <Box className="w-full mt-4">
          <RadicalsForm errors={errors} control={control} record={record} />
        </Box>
      ) : null}
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
          variant="primary"
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
