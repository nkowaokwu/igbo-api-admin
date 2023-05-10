import React, { ReactElement } from 'react';
import {
  Text,
  Tooltip,
  useToast,
  chakra,
} from '@chakra-ui/react';
import { Input } from 'src/shared/primitives';
import Collections from 'src/shared/constants/Collections';
import { getNsibidiCharacter } from 'src/shared/API';
import NsibidiCharacters from './NsibidiCharacters';

const NsibidiInput = React.forwardRef((props : {
  value?: string
  onChange: (value: any) => void,
  placeholder?: string,
  'data-test'?: string,
  defaultValue?: string,
  append: (value: any) => void,
  remove: (index: number) => void,
  nsibidiCharacterIds: { id: string }[],
}, ref): ReactElement => {
  const {
    value,
    placeholder = 'i.e. 貝名, 貝è捧捧, 和硝',
    'data-test': dataTest = 'nsibidi-input',
    append,
    remove,
    nsibidiCharacterIds = [],
  } = props;
  const toast = useToast();

  const updateNsibidiCharacters = (nsibidiCharacterId) => {
    // Avoids appending an Nsibidi character that's already in the array
    if (!nsibidiCharacterIds.find(({ id }) => id === nsibidiCharacterId)) {
      append({ id: nsibidiCharacterId });
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
        title: 'Unable to add stem',
        description: 'There was an error .',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Input
        {...props}
        ref={ref}
        searchApi
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
          <Text className=" mt-2">
            {'Rendered Nsịbịdị: '}
            <chakra.span className="akagu">{value}</chakra.span>
          </Text>
        </Tooltip>
      ) : null}
      <NsibidiCharacters
        nsibidiCharacterIds={nsibidiCharacterIds}
        updateNsibidiCharacters={updateNsibidiCharacters}
        remove={remove}
      />
    </>
  );
});

export default NsibidiInput;
