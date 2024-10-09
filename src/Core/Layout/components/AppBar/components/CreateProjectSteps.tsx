import React, { ReactElement, useState } from 'react';
import { Button, Heading, Input, Link, Text, Textarea, useToast, VStack } from '@chakra-ui/react';
import { ArrowForwardIcon, ExternalLinkIcon } from '@chakra-ui/icons';
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
import ProjectLabels from 'src/backend/shared/constants/ProjectLabels';
import ProjectType from 'src/backend/shared/constants/ProjectType';
import CreateProjectResolver from './CreateProjectResolver';

const transformTypes = (data) => assign(data, { types: compact(data.types.map((type) => type.value)) });
const transformLanguage = (data) =>
  assign(data, { languages: compact(data.languages.map((language) => language.value)) });
const injectDefaultValues = (data) =>
  assign(data, { status: EntityStatus.ACTIVE, visibility: VisibilityType.PRIVATE, license: LicenseType.UNSPECIFIED });

const CreateProjectSteps = (): ReactElement => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      types: [],
      languages: [],
      license: null,
    },
    ...CreateProjectResolver(),
    mode: 'onChange',
  });
  const toast = useToast();

  const cleanedDataPipeline = flow([transformTypes, transformLanguage, injectDefaultValues]);

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
            <Input name="title" {...register('title')} />
            {errors.title && <Text className="error">Project title is required</Text>}
          </VStack>
          <VStack alignItems="start" width="full" gap={2}>
            <Text fontWeight="medium">Description</Text>
            <Textarea name="description" {...register('description')} />
          </VStack>
          {errors.description && <Text className="error">Project description is required</Text>}
          <VStack alignItems="start" width="full" gap={2}>
            <Text fontWeight="medium">Project types</Text>
            <Controller
              name="types"
              control={control}
              render={({ field: props }) => (
                <Select
                  {...props}
                  isMulti
                  className="w-full"
                  placeholder="Select all relevant project types"
                  defaultValue={ProjectLabels.TEXT_AUDIO_ANNOTATION}
                  options={compact(
                    Object.values(ProjectLabels).map((value) => value.value !== ProjectType.UNSPECIFIED && value),
                  )}
                />
              )}
            />
          </VStack>
          {errors.types && <Text className="error">At least one project type is required</Text>}
          <VStack alignItems="start" width="full" gap={2}>
            <Text fontWeight="medium">Languages</Text>
            <Controller
              name="languages"
              control={control}
              render={({ field: props }) => (
                <Select
                  {...props}
                  isMulti
                  className="w-full"
                  placeholder="Select a language"
                  options={compact(
                    Object.values(LanguageLabels).map((value) => value.value !== LanguageEnum.UNSPECIFIED && value),
                  )}
                />
              )}
            />
          </VStack>
          {errors.languages && <Text className="error">At least one language type is required</Text>}
          <VStack alignItems="start" width="full" gap={2}>
            <Text fontWeight="medium">License</Text>
            <Text fontSize="xs" color="gray.600">
              Learn more about copyright licenses{' '}
              <Link href="https://pitt.libguides.com/copyright/licenses" target="_blank" textDecoration="underline">
                here
                <ExternalLinkIcon />
              </Link>
              .
            </Text>
            <Controller
              name="license"
              control={control}
              render={({ field: props }) => (
                <Select
                  {...props}
                  className="w-full"
                  placeholder="Select a language"
                  options={compact(
                    Object.values(LicenseType)
                      .filter((license) => license !== LicenseType.UNSPECIFIED)
                      .map((value) => ({ label: value, value })),
                  )}
                />
              )}
            />
          </VStack>
          {errors.license && <Text className="error">A license is required.</Text>}
          <Button type="submit" rightIcon={<ArrowForwardIcon />} isLoading={isLoading}>
            Create project
          </Button>
        </VStack>
      </form>
    </VStack>
  );
};

export default CreateProjectSteps;
