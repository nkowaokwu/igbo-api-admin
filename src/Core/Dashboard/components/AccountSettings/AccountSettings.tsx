import React, { ReactElement } from 'react';
import { UserProfile } from 'src/backend/controllers/utils/interfaces';
import Select from 'react-select';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';
import SettingsLayout from 'src/Core/components/SettingsLayout';

const AccountSettings = ({ user }: { user: UserProfile }): ReactElement => {
  const formOptions = [
    {
      title: 'Name',
      subtitle: 'Enter your full name',
      defaultValue: user.displayName,
    },
    {
      title: 'Languages',
      subtitle: 'Select all the languages you speak',
      defaultValue: [],
      CustomComponent: (
        <Select
          className="flex-1"
          isMulti
          name="languages"
          placeholder="Select the languages you speak"
          options={Object.entries(LanguageLabels).map(([key, value]) => ({ label: value.label, value: key }))}
        />
      ),
    },
    {
      title: 'Birthday',
      subtitle: 'Enter your birthday',
      defaultValue: user.displayName,
    },
  ];
  return <SettingsLayout title="Your Profile" subtitle="Update your profile settings" formOptions={formOptions} />;
};

export default AccountSettings;
