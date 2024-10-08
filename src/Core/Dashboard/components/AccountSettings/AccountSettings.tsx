import React, { ReactElement, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import Select from 'react-select';
import { assign, compact, pick, flow } from 'lodash';
// import DatePicker from 'react-date-picker';
import { UserProfile } from 'src/backend/controllers/utils/interfaces';
import SettingsLayout from 'src/Core/components/SettingsLayout';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';
import Gender from 'src/backend/shared/constants/Gender';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';
import { updateUserProfile } from 'src/shared/UserAPI';
import { putUserProjectPermission } from 'src/shared/ProjectAPI';

// <DatePicker onChange={setBirthday} value={birthday} />

const AccountSettings = ({ user, triggerRefetch }: { user: UserProfile; triggerRefetch: () => void }): ReactElement => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const formOptions = [
    {
      name: 'displayName',
      title: 'Name',
      subtitle: 'Enter your full name',
      defaultValue: user.displayName,
    },
    {
      name: 'languages',
      title: 'Languages',
      subtitle: 'Select all the languages you speak',
      defaultValue: user?.languages?.map?.((language) => LanguageLabels[language]),
      CustomComponent: (props) => (
        <Select
          {...props}
          className="flex-1"
          isMulti
          placeholder="Select the languages you speak"
          options={compact(
            Object.values(LanguageLabels).map(
              (languageLabel) => languageLabel.value !== LanguageEnum.UNSPECIFIED && languageLabel,
            ),
          )}
        />
      ),
    },
    {
      name: 'gender',
      title: 'Gender',
      subtitle: 'Select your gender',
      defaultValue: Gender[user?.gender] || Gender.UNSPECIFIED,
      CustomComponent: (props) => (
        <Select
          {...props}
          className="flex-1"
          placeholder="Select your gender"
          options={compact(Object.values(Gender).map((gender) => gender.value !== GenderEnum.UNSPECIFIED && gender))}
        />
      ),
    },
  ];

  const transformGender = (data) => assign(data, { gender: data.gender?.value || GenderEnum.UNSPECIFIED });

  const transformLanguages = (data) =>
    assign(data, { languages: (data?.languages || []).map((language) => language.value || LanguageEnum.UNSPECIFIED) });

  const cleanedDataPipeline = flow([transformGender, transformLanguages]);

  const onSubmit = async (data) => {
    const firebasePayload = pick(data, ['displayName']);
    const userProjectPermissionPayload = pick(data, ['gender', 'languages']);
    const cleanedUserProjectPermissionPayload = cleanedDataPipeline(userProjectPermissionPayload);

    setIsLoading(false);
    try {
      await updateUserProfile({ userProfile: firebasePayload });
    } catch (err) {
      setIsLoading(false);
      toast({
        title: 'Error',
        position: 'top-right',
        variant: 'left-accent',
        description: 'Unable to save your profile information',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
    try {
      await putUserProjectPermission(cleanedUserProjectPermissionPayload);
      await triggerRefetch();
      toast({
        title: 'Success',
        position: 'top-right',
        variant: 'left-accent',
        description: 'Your profile has been saved',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        position: 'top-right',
        variant: 'left-accent',
        description: 'Unable to save your profile information',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SettingsLayout
      title="Your Profile"
      subtitle="Update your profile settings"
      formOptions={formOptions}
      onSubmit={onSubmit}
      isLoading={isLoading}
    />
  );
};

export default AccountSettings;
