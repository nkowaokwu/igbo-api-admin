import React, { ReactElement } from 'react';
import { Button, Heading, Input, Text, Textarea, VStack } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import Select from 'react-select';
import { Controller, useForm } from 'react-hook-form';
import { compact } from 'lodash';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';

const CreateProjectSteps = (): ReactElement => {
  const { register, control, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <VStack alignItems="start" maxWidth="700px">
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
                  placeholder="Select a copyright license"
                  options={compact(
                    Object.values(LanguageLabels).map((value) => value.value !== LanguageEnum.UNSPECIFIED && value),
                  )}
                />
              )}
            />
          </VStack>
          <Button type="submit" rightIcon={<ArrowForwardIcon />}>
            Create project
          </Button>
        </VStack>
      </form>
    </VStack>
  );
};

export default CreateProjectSteps;
