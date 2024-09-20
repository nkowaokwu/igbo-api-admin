import React, { ReactElement, useState } from 'react';
import { Textarea, useToast } from '@chakra-ui/react';
import Select from 'react-select';
import { ProjectContext } from 'src/App/contexts/ProjectContext';
import SettingsLayout from 'src/Core/components/SettingsLayout';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';
import LicenseType from 'src/backend/shared/constants/LicenseType';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import { assign, compact, flow } from 'lodash';
import { putCurrentProject } from 'src/shared/ProjectAPI';

const GeneralSettings = (): ReactElement => {
  const [isLoading, setIsLoading] = useState(false);
  const project = React.useContext(ProjectContext);
  const toast = useToast();

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
      defaultValue: { label: project?.license, value: project?.license },
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
      defaultValue: project?.languages?.map((language) => LanguageLabels[language] || LanguageLabels.UNSPECIFIED),
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

  const transformLicense = (data) => assign(data, { license: data?.license?.value || LicenseType.UNSPECIFIED });

  const transformLanguages = (data) =>
    assign(data, { languages: (data?.languages || []).map((language) => language.value || LanguageEnum.UNSPECIFIED) });

  const cleanedDataPipeline = flow([transformLicense, transformLanguages]);

  const onSubmit = async (rawData) => {
    const data = cleanedDataPipeline(rawData);
    try {
      await putCurrentProject(data);

      toast({
        title: 'Saved changes',
        position: 'top-right',
        variant: 'left-accent',
        description: 'Project settings saved',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        position: 'top-right',
        variant: 'left-accent',
        description: 'Unable to save project settings',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return project ? (
    <SettingsLayout
      title="Your Project"
      subtitle="Configure your project settings"
      formOptions={formOptions}
      onSubmit={onSubmit}
      isLoading={isLoading}
    />
  ) : null;
};

export default GeneralSettings;
