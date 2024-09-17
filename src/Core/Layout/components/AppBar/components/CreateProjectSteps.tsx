import React, { ReactElement, useState } from 'react';
import { Button, Heading, Input, Text, Textarea, useToast, VStack } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import Select from 'react-select';
import { Controller, useForm } from 'react-hook-form';
import { assign, compact, flow } from 'lodash';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import { postProject } from 'src/shared/ProjectAPI';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';
import { ProjectData } from 'src/backend/controllers/utils/interfaces';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import VisibilityType from 'src/backend/shared/constants/VisibilityType';
import LicenseType from 'src/backend/shared/constants/LicenseType';

const CreateProjectSteps = (): ReactElement => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, control, handleSubmit } = useForm();
  const toast = useToast();

  const transformLanguage = (data) => assign(data, { languages: [data.languages.value || LanguageEnum.UNSPECIFIED] });

  const injectDefaultValues = (data) =>
    assign(data, { status: EntityStatus.ACTIVE, visibility: VisibilityType.PRIVATE, license: LicenseType.UNSPECIFIED });

  const cleanedDataPipeline = flow([transformLanguage, injectDefaultValues]);

  const handleNavigatingToProject = (project: ProjectData) => {
    window.localStorage.setItem(LocalStorageKeys.PROJECT_ID, project.id.toString());
    window.location.href = '#/';
    window.location.reload();
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    const cleanedData = cleanedDataPipeline(data);
    try {
      const project = await postProject(cleanedData);
      handleNavigatingToProject(project);
    } catch (err) {
      toast({
        title: 'Error',
        position: 'top-right',
        variant: 'left-accent',
        description: 'Unable to create your project',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack alignItems="start" width="full">
      <Heading>Let&apos;s create a new project</Heading>
      <Text>A project is your own private workspace where you can collect your own data with your team.</Text>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <VStack alignItems="start" gap={4}>
          <VStack alignItems="start" width="full" gap={2}>
            <Text fontWeight="medium">Title</Text>
            <Input name="title" ref={register} />
          </VStack>
          <VStack alignItems="start" width="full" gap={2}>
            <Text fontWeight="medium">Description</Text>
            <Textarea name="description" ref={register} />
          </VStack>
          <VStack alignItems="start" width="full" gap={2}>
            <Text fontWeight="medium">Languages</Text>
            <Controller
              name="languages"
              control={control}
              render={(props) => (
                <Select
                  {...props}
                  className="w-full"
                  placeholder="Select a language"
                  options={compact(
                    Object.values(LanguageLabels).map((value) => value.value !== LanguageEnum.UNSPECIFIED && value),
                  )}
                />
              )}
            />
          </VStack>
          <Button type="submit" rightIcon={<ArrowForwardIcon />} isLoading={isLoading}>
            Create project
          </Button>
        </VStack>
      </form>
    </VStack>
  );
};

export default CreateProjectSteps;
