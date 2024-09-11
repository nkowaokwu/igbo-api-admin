import React, { ReactElement } from 'react';
import { Textarea } from '@chakra-ui/react';
import Select from 'react-select';
import { ProjectContext } from 'src/App/contexts/ProjectContext';
import SettingsLayout from 'src/Core/components/SettingsLayout';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';
import LicenseType from 'src/backend/shared/constants/LicenseType';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import { compact } from 'lodash';

const GeneralSettings = (): ReactElement => {
  const project = React.useContext(ProjectContext);

  const formOptions = [
    {
      name: 'title',
      title: 'Name',
      subtitle: 'Name of your project',
      defaultValue: project?.title,
    },
    {
      name: 'description',
      title: 'Description',
      subtitle: 'Describe your project',
      defaultValue: project?.description,
      CustomComponent: (props) => <Textarea {...props} flex={1} placeholder="Describe your project" />,
    },
    {
      name: 'license',
      title: 'License',
      subtitle: 'Copyright license',
      defaultValue: project?.license,
      CustomComponent: (props) => (
        <Select
          {...props}
          className="flex-1"
          placeholder="Select a copyright license"
          options={compact(
            Object.values(LicenseType).map((value) => value !== LicenseType.UNSPECIFIED && { label: value, value }),
          )}
        />
      ),
    },
    {
      name: 'languages',
      title: 'Languages',
      subtitle: 'Select the relevant languages for your project',
      defaultValue: [],
      CustomComponent: (props) => (
        <Select
          {...props}
          className="flex-1"
          isMulti
          placeholder="Select the languages you speak"
          options={compact(
            Object.entries(LanguageLabels).map(
              ([key, value]) => key !== LanguageEnum.UNSPECIFIED && { label: value.label, value: key },
            ),
          )}
        />
      ),
    },
  ];

  const onSubmit = (data) => {
    console.log(data);
  };

  return project ? (
    <SettingsLayout
      title="Your Project"
      subtitle="Configure your project settings"
      formOptions={formOptions}
      onSubmit={onSubmit}
    />
  ) : null;
};

export default GeneralSettings;
