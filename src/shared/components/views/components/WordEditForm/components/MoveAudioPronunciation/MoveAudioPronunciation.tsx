import React, { ReactElement, useState } from 'react';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  Text,
  useToast,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import Dialect from '../../../../../../../backend/shared/constants/Dialects';
import ConfirmModal from '../../../../../ConfirmModal';
import MoveAudioPronunciationInterface from './MoveAudioPronunciationInterface';

const standardIgboLabel = 'Standard Igbo';
const options = [{ value: 'headword', label: standardIgboLabel }, ...Object.values(Dialect)];
const MoveAudioPronunciation = ({
  fromDialect,
  pronunciation,
  setPronunciation,
  updateSelectedDialects = () => {},
}: MoveAudioPronunciationInterface): ReactElement => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toDialect, setToDialect] = useState(null);
  const toast = useToast();
  const fromLabel = fromDialect === 'headword' ? standardIgboLabel : Dialect[fromDialect]?.label;
  const toLabel = toDialect === 'headword' ? standardIgboLabel : Dialect[toDialect]?.label;

  const moveAudioPronunciation = () => {
    setPronunciation(fromDialect === 'headword'
      ? 'pronunciation'
      : `dialects.${fromDialect}.pronunciation`, undefined);
    setPronunciation(toDialect === 'headword'
      ? 'pronunciation'
      : `dialects.${toDialect}.pronunciation`, pronunciation);
    setIsConfirmOpen(false);
    setToDialect(null);
    updateSelectedDialects(toDialect);
    return toast({
      title: 'Moving Audio Pronunciation',
      description: `You have moved the audio pronunciation from ${fromLabel} to ${toLabel}`,
      status: 'info',
      duration: 9000,
      isClosable: true,
    });
  };

  const handleMovingAudio = (value) => {
    if (pronunciation) {
      setIsConfirmOpen(true);
      return setToDialect(value);
    }
    return toast({
      title: 'No Audio Pronunciation',
      description: 'No audio pronunciation to move, try recording audio first',
      status: 'warning',
      duration: 9000,
      isClosable: true,
    });
  };

  return (
    <>
      <Menu closeOnSelect={false}>
        <MenuButton
          as={Button}
          variant="outline"
          colorScheme="blue"
          rightIcon={<ChevronDownIcon />}
          data-test="dialect-move-menu"
          disabled={!pronunciation}
        >
          Move to dialect...
        </MenuButton>
        <MenuList minWidth="240px">
          <MenuOptionGroup title="Dialects" onChange={handleMovingAudio}>
            {options.filter(({ value }) => value !== fromDialect).map(({ value, label }) => (
              <MenuItemOption key={`${value}-move-audio`} value={value}>
                {label}
              </MenuItemOption>

            ))}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
      <ConfirmModal
        isOpen={!!isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setToDialect(null);
        }}
        onConfirm={moveAudioPronunciation}
        confirm="Move Audio"
        confirmColorScheme="blue"
        cancel="Cancel"
        title="Move Audio Pronunciation"
      >
        <Text>
          {'Moving an audio pronunciation will take the audio recording to '}
          <span className="font-bold">{`${toLabel} `}</span>
          {'and erase it from '}
          <span className="font-bold">{`${fromLabel}. `}</span>
          {`This change can be undone 
          by clicking on the 'Reset Recording' button for both 
          dialects involved in the move.`}
        </Text>
      </ConfirmModal>
    </>
  );
};

export default MoveAudioPronunciation;
