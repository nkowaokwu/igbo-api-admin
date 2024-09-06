import React, { ReactElement } from 'react';
import { noop } from 'lodash';
import { Box, Text, Tooltip, useToast, chakra } from '@chakra-ui/react';
import { Control, useFieldArray } from 'react-hook-form';
import { Input } from 'src/shared/primitives';
import Collections from 'src/shared/constants/Collection';
import { getNsibidiCharacter } from 'src/shared/API';
import LegacyAkaguFont from 'src/backend/shared/constants/LegacyAkaguFont';
import NsibidiCharacters from './NsibidiCharacters';

const NsibidiInput = React.forwardRef(
  (
    props: {
      value?: string;
      onChange: (value: any) => void;
      placeholder?: string;
      'data-test'?: string;
      defaultValue?: string;
      nsibidiFormName: string;
      control: Control;
      enableSearch?: boolean;
      showLegacy?: boolean;
    },
    ref,
  ): ReactElement => {
    const {
      value = '',
      placeholder = 'i.e. 貝名, 貝è捧捧, 和硝',
      'data-test': dataTest = 'nsibidi-input',
      nsibidiFormName,
      control,
      enableSearch = true,
      showLegacy = false,
    } = props;
    const toast = useToast();

    const {
      fields: nsibidiCharacterIds,
      append,
      remove,
    } = enableSearch
      ? useFieldArray({
          control,
          name: nsibidiFormName,
        })
      : { fields: [], append: noop, remove: noop };

    const updateNsibidiCharacters = (nsibidiCharacterId) => {
      // Avoids appending an Nsibidi character that's already in the array
      if (!nsibidiCharacterIds.find(({ text }) => text === nsibidiCharacterId)) {
        append({ text: nsibidiCharacterId });
      }
    };

    const handleAddNsibidiCharacter = async (userInput = value) => {
      try {
        const canAddNsibidiCharacter = !value.includes(userInput);
        if (canAddNsibidiCharacter) {
          const nsibidiCharacter = await getNsibidiCharacter(userInput);
          updateNsibidiCharacters(nsibidiCharacter.id);
        } else {
          throw new Error('Invalid word id');
        }
      } catch (err) {
        toast({
          title: 'Unable to add Nsịbịdị',
          description: 'There was an error.',
          status: 'warning',
          duration: 4000,
          isClosable: true,
        });
      }
    };

    return (
      <Box className="space-y-4">
        <Input
          {...props}
          ref={ref}
          searchApi={enableSearch}
          collection={Collections.NSIBIDI_CHARACTERS}
          placeholder={placeholder}
          data-test={dataTest}
          onSelect={(e) => handleAddNsibidiCharacter(e.id)}
        />
        {value ? (
          <Tooltip
            label="The rendered script is the final Nsịbịdị that will be shown to users"
            placement="bottom-start"
          >
            <Box className="flex flex-row items-center space-x-3 mt-2">
              <Text>
                {'Rendered Nsịbịdị: '}
                <chakra.span className="akagu">{value}</chakra.span>
              </Text>
              {showLegacy ? (
                <Text>
                  {'Legacy Nsịbịdị Characters: '}
                  {Object.values(LegacyAkaguFont).map((legacyFont) => (
                    <chakra.span className={legacyFont}>{value}</chakra.span>
                  ))}
                </Text>
              ) : null}
            </Box>
          </Tooltip>
        ) : null}
        {enableSearch ? (
          <NsibidiCharacters
            nsibidiCharacterIds={nsibidiCharacterIds}
            remove={remove}
            control={control}
            nsibidiFormName={nsibidiFormName}
          />
        ) : null}
      </Box>
    );
  },
);

export default NsibidiInput;
