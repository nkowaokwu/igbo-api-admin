import React, { useState, ReactElement } from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
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
      <NavbarWrapper className={currentView === IgboSoundboxViews.HOME ? 'justify-center' : 'justify-start'}>
        {currentView === IgboSoundboxViews.HOME ? (
          <Heading fontFamily="Silka" textAlign="center">
            Igbo Soundbox
          </Heading>
        ) : (
          <Box className="flex flex-row justify-start items-center space-x-4 h-full">
            <Button
              color="green.300"
              variant="ghost"
              leftIcon={<ArrowBackIcon color="green.300" boxSize={4} />}
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
            <Button
              variant="ghost"
              fontFamily="Silka"
              fontWeight="bold"
              color={currentView === IgboSoundboxViews.RECORD ? 'green.300' : 'gray'}
              borderBottomColor={currentView === IgboSoundboxViews.RECORD ? 'green.300' : 'white'}
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
            <Button
              variant="ghost"
              fontFamily="Silka"
              fontWeight="bold"
              color={currentView === IgboSoundboxViews.VERIFY ? 'green.300' : 'gray'}
              borderBottomColor={currentView === IgboSoundboxViews.VERIFY ? 'green.300' : 'white'}
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
          </Box>
        )}
      </NavbarWrapper>
    </>
  );
};

export default Navbar;
