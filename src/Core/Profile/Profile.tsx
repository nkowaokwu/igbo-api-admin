import React, { useState, ReactElement, useEffect } from 'react';
import { Box, Button, Tooltip, useToast } from '@chakra-ui/react';
import { ChevronLeftIcon, EditIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { getAuth } from 'firebase/auth';
import { getUserProfile, updateUserProfile } from 'src/shared/UserAPI';
import UserStat from 'src/Core/Dashboard/components/UserStat';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';
import { UserProfile } from 'src/backend/controllers/utils/interfaces';
import { merge } from 'lodash';

const auth = getAuth();
const Profile = (): ReactElement => {
  const [isEditingUserProfile, setIsEditingUserProfile] = useState(false);
  const [user, setUser] = useState<UserProfile>();
  const [isLoading, setIsLoading] = useState(false);
  const {
    currentUser: { uid },
  } = auth;
  const toast = useToast();

  const handleOnBack = () => {
    window.location.hash = '#/';
  };

  const handleEditButton = async () => {
    if (isEditingUserProfile) {
      setIsLoading(true);
      const displayName = (document.querySelector('#user-profile-display-name-input') as HTMLInputElement).value;
      const age = parseInt((document.querySelector('#user-profile-age-input') as HTMLInputElement).value || '-1', 10);
      const dialect = (document.querySelector('#user-dialect-input') as HTMLSelectElement).value as DialectEnum;
      const gender = (document.querySelector('#user-gender-input') as HTMLSelectElement).value as GenderEnum;

      const payload = { displayName, age, dialects: [dialect], gender };
      try {
        // Save the user profile
        const savedProfile = await updateUserProfile({ userId: uid, userProfile: payload });
        setUser(merge(user, savedProfile));
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
        setIsLoading(false);
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

  useEffect(() => {
    getUserProfile(uid).then(setUser);
  }, []);

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
              isLoading={isLoading}
            >
              {isEditingUserProfile ? 'Save' : 'Edit'}
            </Button>
          </Tooltip>
          <Tooltip label="Discard your changes">
            <>
              {isEditingUserProfile ? (
                <Button
                  variant="ghost"
                  leftIcon={<SmallCloseIcon boxSize={4} />}
                  onClick={handleOnCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              ) : null}
            </>
          </Tooltip>
        </Box>
      </Box>
      {user ? <UserStat isEditing={isEditingUserProfile} user={user} /> : null}
    </Box>
  );
};

export default Profile;
