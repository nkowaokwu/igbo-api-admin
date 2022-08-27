import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import Select from 'react-select';
import { Controller } from 'react-hook-form';
import WordTags from 'src/backend/shared/constants/WordTags';
import FormHeader from '../../../FormHeader';
import TagsInterface from './TagsFormInterface';

const TagsForm = ({ errors, control, record }: TagsInterface): ReactElement => {
  const handleMultiSelectTags = (callback) => (selectedTags = []) => {
    callback((selectedTags || []).map(({ value }) => value));
  };

  const generateDefaultTags = () => {
    if (record?.tags) {
      return record.tags.map((tag) => WordTags[tag.toUpperCase()]);
    }
    return [];
  };

  return (
    <Box className="flex flex-col w-full">
      <Box className="flex flex-col my-2 space-y-2 justify-between items-between">
        <FormHeader
          title="Tags"
          tooltip="Select tags that are associated with the word."
        />
        <Box
          className="w-full"
        >
          <Controller
            render={({ onChange, ref }) => (
              <Select
                ref={ref}
                onChange={handleMultiSelectTags(onChange)}
                options={Object.values(WordTags)}
                defaultValue={generateDefaultTags()}
                isMulti
              />
            )}
            name="tags"
            control={control}
          />
        </Box>
      </Box>
      {errors.tags ? (
        <p className="error relative">{errors.tags.message}</p>
      ) : null}
    </Box>
  );
};

export default TagsForm;
