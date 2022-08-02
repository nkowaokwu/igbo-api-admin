import React, { ReactElement, useEffect, useState } from 'react';
import {
  Box,
  Checkbox,
  Link,
  Text,
  Tooltip,
  Popover,
  PopoverContent,
} from '@chakra-ui/react';
import { ExternalLinkIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { Controller } from 'react-hook-form';
import WordClass from 'src/shared/constants/WordClass';
import { getWords } from 'src/shared/API';
import determineIsAsCompleteAsPossible from 'src/backend/controllers/utils/determineIsAsCompleteAsPossible';
import WordAttributes from 'src/backend/shared/constants/WordAttributes';
import { Input } from 'src/shared/primitives';
import FormHeader from '../../../FormHeader';
import HeadwordInterface from './HeadwordFormInterface';

const SuggestedWords = ({ word } : { word: string }) => {
  const [openWordPopover, setOpenWordPopover] = useState(null);
  const [suggestedWords, setSuggestedWords] = useState([]);
  useEffect(() => {
    (async () => {
      const words = await getWords(word);
      setSuggestedWords(words);
    })();
  }, []);

  return (
    <Box onMouseLeave={() => setOpenWordPopover(null)}>
      <Tooltip
        label={`These are existing word documents. Please check to 
        see if these existing words need to be updated before 
        creating a new word.`}
      >
        <Box className="flex flex-row items-center">
          <Text my={2}>Similar existing words:</Text>
          <InfoOutlineIcon color="gray.600" boxSize={3} className="ml-2" />
        </Box>
      </Tooltip>

      <Box className="flex flex-row flex-wrap">
        {suggestedWords.map(({
          word,
          wordClass,
          definitions,
          id,
        }) => (
          <Box key={`suggested-word-${id}`}>
            <Box
              onMouseEnter={() => setOpenWordPopover(id)}
              className="flex flex-row items-center"
              mr={3}
            >
              <Link
                color="blue.400"
                href={`/words/${id}`}
                target="_blank"
                onMouseEnter={() => setOpenWordPopover(id)}
                mr={1}
              >
                <Text pointerEvents="none">{word}</Text>
              </Link>
              <ExternalLinkIcon color="blue.400" boxSize={3} />
            </Box>
            <Popover
              isOpen={id === openWordPopover}
              placement="bottom"
            >
              <PopoverContent p={5}>
                <Text fontWeight="bold">{word}</Text>
                <Text fontStyle="italic">{WordClass[wordClass]?.label || wordClass}</Text>
                <Box>
                  {definitions.map((definition, index) => (
                    <Text>{`${index + 1}. ${definition}`}</Text>
                  ))}
                </Box>
              </PopoverContent>
            </Popover>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

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
      <Box className="flex flex-col my-2 space-y-2 justify-between items-between">
        <FormHeader
          title="Headword"
          tooltip={`This is the headword that should ideally be in to Standard Igbo.
          Add diacritic marks to denote the tone for the word. 
          All necessary accented characters will appear in the letter popup`}
        />
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
                    isChecked={value}
                    defaultIsChecked={isHeadwordAccented || record.attributes?.[WordAttributes.IS_ACCENTED.value]}
                    ref={ref}
                    data-test={`${WordAttributes.IS_ACCENTED.value}-checkbox`}
                    size="lg"
                  >
                    <span className="font-bold">{WordAttributes.IS_ACCENTED.label}</span>
                  </Checkbox>
                )}
                defaultValue={isHeadwordAccented
                  || record.attributes?.[WordAttributes.IS_ACCENTED.value]
                  || getValues().attributes?.[WordAttributes.IS_ACCENTED.value]}
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
          <Tooltip label="Check this checkbox if this is a newly constructed Igbo word">
            <Box display="flex">
              <Controller
                render={({ onChange, value, ref }) => (
                  <Checkbox
                    onChange={(e) => onChange(e.target.checked)}
                    isChecked={value}
                    defaultIsChecked={record.attributes?.[WordAttributes.IS_CONSTRUCTED_TERM.value]}
                    ref={ref}
                    data-test={`${WordAttributes.IS_CONSTRUCTED_TERM.label}-checkbox`}
                    size="lg"
                  >
                    <span className="font-bold">{WordAttributes.IS_CONSTRUCTED_TERM.label}</span>
                  </Checkbox>
                )}
                defaultValue={record.attribute?.[WordAttributes.IS_CONSTRUCTED_TERM.value]
                  || getValues().attributes?.[WordAttributes.IS_CONSTRUCTED_TERM.value]}
                name={`attributes.${WordAttributes.IS_CONSTRUCTED_TERM.value}`}
                control={control}
              />
            </Box>
          </Tooltip>
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
      <SuggestedWords word={record.word || getValues().word} />
      {errors.word && (
        <p className="error">Word is required</p>
      )}
    </Box>
  );
};

export default HeadwordForm;
