import React, { ReactElement } from 'react';
import { Button, VStack, HStack, Input } from '@chakra-ui/react';
import { Control, Controller, useFieldArray, UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { get } from 'lodash';
import Select from 'react-select';
import { LuPlus } from 'react-icons/lu';
import FormHeader from 'src/shared/components/views/components/FormHeader';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';
import { Record } from 'react-admin';
import ExampleAudioPronunciationsForm from 'src/shared/components/views/components/ExampleEditForm/components/ExampleAudioPronunciationsForm';

const ExampleTranslationsForm = ({
  record,
  originalRecord,
  uid,
  errors,
  control,
  setValue,
  getValues,
}: {
  record: Record;
  originalRecord: Record;
  uid: string;
  errors: any;
  control: Control;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
}): ReactElement => {
  const languageOptions = Object.values(LanguageLabels).filter(({ value }) => value !== LanguageEnum.UNSPECIFIED);
  const { fields: translations, append } = useFieldArray({
    control,
    name: 'translations',
  });

  const handleAppendTranslation = () =>
    append({
      language: LanguageEnum.UNSPECIFIED,
      text: '',
      pronunciations: [],
    });

  return (
    <VStack alignItems="start" width="full">
      <FormHeader
        title="Translated text"
        // eslint-disable-next-line max-len
        tooltip="The sentence in multiple languages"
      />
      <VStack alignItems="start" width="full">
        {translations.map((translation, index) => (
          <VStack key={translation.id} alignItems="start" width="full">
            <HStack
              display="flex"
              flexDirection={{ base: 'column', md: 'row' }}
              justifyContent="space-between"
              width="full"
              gap={2}
            >
              <Controller
                render={({ field: props }) => (
                  <Input
                    {...props}
                    placeholder="Translation text in selected language"
                    data-test={`translation-input-${index}`}
                    minWidth="40px"
                    flex={8}
                  />
                )}
                name={`translations.${index}.text`}
                control={control}
                defaultValue={
                  get(record, `translations.${index}.text`) || get(getValues(), `translations.${index}.text`) || ''
                }
              />
              <Controller
                render={({ field: props }) => (
                  <Select
                    {...props}
                    options={languageOptions}
                    styles={{ container: (styles) => ({ ...styles, flex: 2, width: '100%' }) }}
                  />
                )}
                name={`translations.${index}.language`}
                control={control}
              />
            </HStack>
            {get(errors, `translations.${index}.text`) ? <p className="error">Translation text is required</p> : null}
            {get(errors, `translations.${index}.language`) ? <p className="error">Language is required</p> : null}
            <ExampleAudioPronunciationsForm
              control={control}
              record={record}
              originalRecord={originalRecord}
              uid={uid}
              name={`translations.${index}`}
              setValue={setValue}
              getValues={getValues}
            />
          </VStack>
        ))}
        <Button leftIcon={<LuPlus />} variant="primary" my={6} onClick={handleAppendTranslation}>
          Add Sentence Translation
        </Button>
      </VStack>
    </VStack>
  );
};

export default ExampleTranslationsForm;
