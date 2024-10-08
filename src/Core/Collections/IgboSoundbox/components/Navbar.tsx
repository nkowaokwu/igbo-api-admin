import React, { useState, ReactElement } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import IgboSoundboxViews from 'src/shared/constants/IgboSoundboxViews';
import ConfirmModal from 'src/shared/components/ConfirmModal';
import { ArrowBackIcon } from '@chakra-ui/icons';
import NavbarWrapper from '../../components/NavbarWrapper';

const Navbar = ({
  currentView,
  setCurrentView,
  isDirty,
}: {
  currentView: IgboSoundboxViews;
  setCurrentView: React.Dispatch<React.SetStateAction<IgboSoundboxViews>>;
  isDirty: boolean;
}): ReactElement => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [nextView, setNextView] = useState(null);

  const withConfirmation = (selectedView) => () => {
    if (isDirty) {
      setIsConfirmOpen(true);
      setNextView(selectedView);
    } else {
      setCurrentView(selectedView);
    }
  };

  const handleOnConfirm = () => {
    setCurrentView(nextView);
    setNextView(null);
    setIsConfirmOpen(false);
  };

  return (
    <>
      <ConfirmModal
        isOpen={isConfirmOpen}
        confirmColorScheme="blue"
        title="Are you sure you want to leave?"
        confirm="Leave page"
        cancel="Cancel"
        onConfirm={handleOnConfirm}
        onClose={() => setIsConfirmOpen(false)}
      >
        <Text>Leaving this page without submitting your work will lead to your current work to be lost.</Text>
      </ConfirmModal>
      <NavbarWrapper className="justify-start">
        <Box className="flex flex-row justify-start items-center space-x-4 h-full">
          <Button
            color="blue.500"
            variant="ghost"
            leftIcon={<ArrowBackIcon color="blue.500" boxSize={4} />}
            onClick={withConfirmation(IgboSoundboxViews.HOME)}
            fontWeight="bold"
            fontFamily="Silka"
            _hover={{
              backgroundColor: 'white',
            }}
            _active={{
              backgroundColor: 'white',
            }}
            _focus={{
              backgroundColor: 'white',
            }}
          >
            Back
          </Button>
          {currentView === IgboSoundboxViews.RECORD ? (
            <Button
              variant="ghost"
              fontFamily="Silka"
              fontWeight="bold"
              color="blue.500"
              borderBottomColor="blue.500"
              borderBottomWidth="2px"
              height="full"
              backgroundColor="white"
              borderRadius="none"
              outline="none"
              boxShadow="none"
              onClick={withConfirmation(IgboSoundboxViews.RECORD)}
              _hover={{
                backgroundColor: 'white',
              }}
              _active={{
                backgroundColor: 'white',
              }}
              _focus={{
                backgroundColor: 'white',
              }}
            >
              Record audio
            </Button>
          ) : null}
          {currentView === IgboSoundboxViews.VERIFY ? (
            <Button
              variant="ghost"
              fontFamily="Silka"
              fontWeight="bold"
              color="blue.500"
              borderBottomColor="blue.500"
              borderBottomWidth="2px"
              height="full"
              backgroundColor="white"
              borderRadius="none"
              outline="none"
              boxShadow="none"
              onClick={withConfirmation(IgboSoundboxViews.VERIFY)}
              _hover={{
                backgroundColor: 'white',
              }}
              _active={{
                backgroundColor: 'white',
              }}
              _focus={{
                backgroundColor: 'white',
              }}
            >
              Verify
            </Button>
          ) : null}
          {currentView === IgboSoundboxViews.TRANSLATE ? (
            <Button
              variant="ghost"
              fontFamily="Silka"
              fontWeight="bold"
              color="blue.500"
              borderBottomColor="blue.500"
              borderBottomWidth="2px"
              height="full"
              backgroundColor="white"
              borderRadius="none"
              outline="none"
              boxShadow="none"
              onClick={withConfirmation(IgboSoundboxViews.VERIFY)}
              _hover={{
                backgroundColor: 'white',
              }}
              _active={{
                backgroundColor: 'white',
              }}
              _focus={{
                backgroundColor: 'white',
              }}
            >
              Translate
            </Button>
          ) : null}
        </Box>
      </NavbarWrapper>
    </>
  );
};

export default Navbar;
