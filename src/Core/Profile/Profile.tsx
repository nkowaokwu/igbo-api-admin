import React, { useState, ReactElement } from 'react';
import { Box, Button, Tooltip, useToast } from '@chakra-ui/react';
import { ChevronLeftIcon, EditIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { updateUserProfile } from 'src/shared/UserAPI';
import UserStat from 'src/Core/Dashboard/components/UserStat';
import useFirebaseUid from 'src/hooks/useFirebaseUid';

const Profile = (): ReactElement => {
  const [isEditingUserProfile, setIsEditingUserProfile] = useState(false);
  const uid = useFirebaseUid();
  const toast = useToast();

  const handleOnBack = () => {
    window.location.hash = '#/';
  };

  const handleEditButton = async () => {
    if (isEditingUserProfile) {
      const displayName = (document.querySelector('#user-profile-display-name-input') as HTMLInputElement).value;
      const payload = { displayName };
      try {
        // Save the user profile
        await updateUserProfile(payload);
        toast({
          title: 'Saved changes',
          position: 'top-right',
          variant: 'left-accent',
          description: 'Your profile has been updated',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: 'Unable to save',
          position: 'top-right',
          variant: 'left-accent',
          description: 'An error occurred while updating user profile',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setIsEditingUserProfile(false);
      }
    } else {
      setIsEditingUserProfile(true);
    }
  };

  // Does not save the user's profile changes
  const handleOnCancel = () => {
    setIsEditingUserProfile(false);
  };

  return (
    <Box className="mb-24 p-6">
      <Box className="flex flex-row justify-between items-center">
        <Button variant="ghost" leftIcon={<ChevronLeftIcon boxSize={4} />} onClick={handleOnBack}>
          Back
        </Button>
        <Box className="flex flex-row space-x-3 items-center">
          <Tooltip label={isEditingUserProfile ? 'Save your changes' : 'Edit your profile'}>
            <Button
              variant="primary"
              backgroundColor="primary"
              color="white"
              leftIcon={<EditIcon boxSize={4} />}
              onClick={handleEditButton}
            >
              {isEditingUserProfile ? 'Save' : 'Edit'}
            </Button>
          </Tooltip>
          <Tooltip label="Discard your changes">
            <>
              {isEditingUserProfile ? (
                <Button variant="ghost" leftIcon={<SmallCloseIcon boxSize={4} />} onClick={handleOnCancel}>
                  Cancel
                </Button>
              ) : null}
            </>
          </Tooltip>
        </Box>
      </Box>
      <UserStat isEditing={isEditingUserProfile} uid={uid} />
    </Box>
  );
};

export default Profile;
