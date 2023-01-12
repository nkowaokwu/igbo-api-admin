import React, { ReactElement } from 'react';
import { Box, Checkbox, Tooltip } from '@chakra-ui/react';
import { Controller } from 'react-hook-form';
import WordAttributes from 'src/backend/shared/constants/WordAttributes';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

const HeadwordAttributes = ({
  record,
  getValues,
  errors,
  control,
  isHeadwordAccented,
  isAsCompleteAsPossible,
  isConstructedPollTerm,
} : {
  record: Interfaces.Word,
  errors: { [key: string]: { [key: string]: string } }
  getValues: () => any,
  control: any,
  isHeadwordAccented: boolean,
  isAsCompleteAsPossible: boolean,
  isConstructedPollTerm: boolean,
}): ReactElement => (
  <Box
    className="w-full grid grid-flow-row grid-cols-2 gap-4 px-3"
  >
    <Controller
      render={({ onChange, value, ref }) => (
        <Checkbox
          onChange={(e) => onChange(e.target.checked)}
          isChecked={value}
          defaultIsChecked={record.attributes?.[WordAttributes.IS_STANDARD_IGBO.value]}
          ref={ref}
          data-test={`${WordAttributes.IS_STANDARD_IGBO.value}-checkbox`}
          size="lg"
        >
          <span className="font-bold">{WordAttributes.IS_STANDARD_IGBO.label}</span>
        </Checkbox>
      )}
      defaultValue={record.attributes?.[WordAttributes.IS_STANDARD_IGBO.value]
        || getValues().attributes?.[WordAttributes.IS_STANDARD_IGBO.value]}
      name={`attributes.${WordAttributes.IS_STANDARD_IGBO.value}`}
      control={control}
    />
    <Tooltip
      label={!isAsCompleteAsPossible ? 'Unable to mark as complete until all necessary fields are filled' : ''}
    >
      <Box display="flex">
        <Controller
          render={({ onChange, value, ref }) => (
            <Checkbox
              onChange={(e) => onChange(e.target.checked)}
              isChecked={!!value}
              defaultIsChecked={!!(isHeadwordAccented
                || record.attributes?.[WordAttributes.IS_ACCENTED.value])}
              ref={ref}
              data-test={`${WordAttributes.IS_ACCENTED.value}-checkbox`}
              size="lg"
            >
              <span className="font-bold">{WordAttributes.IS_ACCENTED.label}</span>
            </Checkbox>
          )}
          defaultValue={!!(isHeadwordAccented
            || record.attributes?.[WordAttributes.IS_ACCENTED.value]
            || getValues().attributes?.[WordAttributes.IS_ACCENTED.value])}
          name={`attributes.${WordAttributes.IS_ACCENTED.value}`}
          control={control}
        />
      </Box>
    </Tooltip>
    {errors.attributes?.isAccented ? (
      <p className="error relative">Is Accented must be selected</p>
    ) : null}
    <Tooltip label="Check this checkbox if this word is considered casual slang">
      <Box display="flex">
        <Controller
          render={({ onChange, value, ref }) => (
            <Checkbox
              onChange={(e) => onChange(e.target.checked)}
              isChecked={value}
              defaultIsChecked={record.attributes?.[WordAttributes.IS_SLANG.value]}
              ref={ref}
              data-test={`${WordAttributes.IS_SLANG.label}-checkbox`}
              size="lg"
            >
              <span className="font-bold">{WordAttributes.IS_SLANG.label}</span>
            </Checkbox>
          )}
          defaultValue={record.attribute?.[WordAttributes.IS_SLANG.value]
            || getValues().attributes?.[WordAttributes.IS_SLANG.value]}
          name={`attributes.${WordAttributes.IS_SLANG.value}`}
          control={control}
        />
      </Box>
    </Tooltip>
    <Tooltip
      label={isConstructedPollTerm
        ? 'This checkbox is automatically checked since it\'s a constructed term that comes from a Twitter poll'
        : 'Check this checkbox if this is a newly coined, aka constructed, Igbo word'}
    >
      <Box display="flex">
        <Controller
          render={({ onChange, value, ref }) => (
            <Checkbox
              onChange={(e) => onChange(e.target.checked)}
              isChecked={isConstructedPollTerm || value}
              defaultIsChecked={
                isConstructedPollTerm
                || record.attributes?.[WordAttributes.IS_CONSTRUCTED_TERM.value]
              }
              isDisabled={isConstructedPollTerm}
              ref={ref}
              data-test={`${WordAttributes.IS_CONSTRUCTED_TERM.label}-checkbox`}
              size="lg"
            >
              <span className="font-bold">{WordAttributes.IS_CONSTRUCTED_TERM.label}</span>
            </Checkbox>
          )}
          defaultValue={isConstructedPollTerm || record.attribute?.[WordAttributes.IS_CONSTRUCTED_TERM.value]
            || getValues().attributes?.[WordAttributes.IS_CONSTRUCTED_TERM.value]}
          name={`attributes.${WordAttributes.IS_CONSTRUCTED_TERM.value}`}
          control={control}
        />
      </Box>
    </Tooltip>
    <Tooltip label="Check this checkbox if this word is borrowed from another language">
      <Box display="flex">
        <Controller
          render={({ onChange, value, ref }) => (
            <Checkbox
              onChange={(e) => onChange(e.target.checked)}
              isChecked={value}
              defaultIsChecked={record.attributes?.[WordAttributes.IS_BORROWED_TERM.value]}
              ref={ref}
              data-test={`${WordAttributes.IS_BORROWED_TERM.label}-checkbox`}
              size="lg"
            >
              <span className="font-bold">{WordAttributes.IS_BORROWED_TERM.label}</span>
            </Checkbox>
          )}
          defaultValue={record.attribute?.[WordAttributes.IS_BORROWED_TERM.value]
            || getValues().attributes?.[WordAttributes.IS_BORROWED_TERM.value]}
          name={`attributes.${WordAttributes.IS_BORROWED_TERM.value}`}
          control={control}
        />
      </Box>
    </Tooltip>
    <Tooltip
      label="Check this checkbox if this word is a word stem.
      Checking this box will ignore the Word Stems area on this form."
    >
      <Box display="flex">
        <Controller
          render={({ onChange, value, ref }) => (
            <Checkbox
              onChange={(e) => onChange(e.target.checked)}
              isChecked={value}
              defaultIsChecked={record.attributes?.[WordAttributes.IS_STEM.value]}
              ref={ref}
              data-test={`${WordAttributes.IS_STEM.label}-checkbox`}
              size="lg"
            >
              <span className="font-bold">{WordAttributes.IS_STEM.label}</span>
            </Checkbox>
          )}
          defaultValue={record.attribute?.[WordAttributes.IS_STEM.value]
            || getValues().attributes?.[WordAttributes.IS_STEM.value]}
          name={`attributes.${WordAttributes.IS_STEM.value}`}
          control={control}
        />
      </Box>
    </Tooltip>
    <Tooltip
      label="Check this checkbox if this word is a commonly or frequently used word."
    >
      <Box display="flex">
        <Controller
          render={({ onChange, value, ref }) => (
            <Checkbox
              onChange={(e) => onChange(e.target.checked)}
              isChecked={value}
              defaultIsChecked={record.attributes?.[WordAttributes.IS_COMMON.value]}
              ref={ref}
              data-test={`${WordAttributes.IS_COMMON.label}-checkbox`}
              size="lg"
            >
              <span className="font-bold">{WordAttributes.IS_COMMON.label}</span>
            </Checkbox>
          )}
          defaultValue={record.attribute?.[WordAttributes.IS_COMMON.value]
            || getValues().attributes?.[WordAttributes.IS_COMMON.value]}
          name={`attributes.${WordAttributes.IS_COMMON.value}`}
          control={control}
        />
      </Box>
    </Tooltip>
  </Box>
);

export default HeadwordAttributes;
