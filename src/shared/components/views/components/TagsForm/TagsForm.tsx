import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Box } from '@chakra-ui/react';
import Select from 'react-select';
import { Controller } from 'react-hook-form';
import WordTags from 'src/backend/shared/constants/WordTags';
import FormHeader from '../FormHeader';
import TagsInterface from './TagsFormInterface';

const TagsForm = ({ errors, control }: TagsInterface): ReactElement => {
  const tags = get(control.getValues(), 'tags');

  return (
    <Box className="flex flex-col w-full">
      <Box className="flex flex-col my-2 space-y-2 justify-between items-between">
        <FormHeader title="Tags" tooltip="Select tags that are associated with the document." />
        <Box className="w-full" data-test="tags-input-container">
          <Controller
            render={({ onChange, ref }) => (
              <Select ref={ref} onChange={onChange} options={Object.values(WordTags)} value={tags} isMulti />
            )}
            name="tags"
            control={control}
          />
        </Box>
      </Box>
      {errors.tags ? <p className="error relative">{errors.tags[0]?.message || errors.tags.message}</p> : null}
    </Box>
  );
};

export default TagsForm;
