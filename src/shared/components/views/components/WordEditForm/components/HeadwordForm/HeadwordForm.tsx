import React, { ReactElement } from 'react';
import { Box, Checkbox, Tooltip } from '@chakra-ui/react';
import { Controller } from 'react-hook-form';
import determineIsAsCompleteAsPossible from 'src/backend/controllers/utils/determineIsAsCompleteAsPossible';
import { Input } from 'src/shared/primitives';
import FormHeader from '../../../FormHeader';
import HeadwordInterface from './HeadwordFormInterface';

const HeadwordForm = ({
  errors,
  control,
  record,
  getValues,
}: HeadwordInterface): ReactElement => {
  const isHeadwordAccented = (record.word || '').normalize('NFD').match(/(?!\u0323)[\u0300-\u036f]/g);
  const isAsCompleteAsPossible = determineIsAsCompleteAsPossible(record);
  return (
    <Box className="flex flex-col w-full">
      <Box className="flex flex-col lg:flex-row my-4 lg:my-0 space-y-2 lg:space-y-0 justify-between items-between">
        <FormHeader
          title="Headword"
          tooltip={`This is the headword that should ideally be in to Standard Igbo.
          Add diacritic marks to denote the tone for the word. 
          All necessary accented characters will appear in the letter popup`}
        />
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
        >
          <Controller
            render={({ onChange, value, ref }) => (
              <Checkbox
                onChange={(e) => onChange(e.target.checked)}
                isChecked={value}
                defaultIsChecked={record.isStandardIgbo}
                ref={ref}
                data-test="isStandardIgbo-checkbox"
                size="lg"
              >
                <span className="font-bold">Is Standard Igbo</span>
              </Checkbox>
            )}
            defaultValue={record.isStandardIgbo || getValues().isStandardIgbo}
            name="isStandardIgbo"
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
                    isChecked={value}
                    defaultIsChecked={isHeadwordAccented && record.isAccented}
                    ref={ref}
                    data-test="isAccented-checkbox"
                    size="lg"
                  >
                    <span className="font-bold">Is Accented</span>
                  </Checkbox>
                )}
                defaultValue={isHeadwordAccented && (record.isAccented || getValues().isAccented)}
                name="isAccented"
                control={control}
              />
            </Box>
          </Tooltip>
          {errors.isAccented ? (
            <p className="error relative">Is Accented must be selected</p>
          ) : null}
        </Box>
      </Box>
      <Controller
        render={(props) => (
          <Input
            {...props}
            className="form-input"
            placeholder="i.e. biko, igwe, mmiri"
            data-test="word-input"
          />
        )}
        name="word"
        control={control}
        defaultValue={record.word || getValues().word}
      />
      {errors.word && (
        <p className="error">Word is required</p>
      )}
    </Box>
  );
};

export default HeadwordForm;
