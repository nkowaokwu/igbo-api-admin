import React, { ReactElement } from 'react';
import { Button, Divider, Input, Heading, HStack, VStack, Text } from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { useForm, Controller } from 'react-hook-form';

interface FormOption {
  name: string;
  title: string;
  subtitle: string;
  defaultValue: string | any[];
  CustomComponent?: (props: any) => React.JSX.Element;
}

const SettingsLayout = ({
  title,
  subtitle,
  formOptions,
  onSubmit,
  isLoading,
}: {
  title: string;
  subtitle: string;
  formOptions: FormOption[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}): ReactElement => {
  const { register, handleSubmit, control } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack alignItems="start" gap={12} p={4}>
        <HStack alignItems="start" justifyContent="space-between" width="full">
          <VStack alignItems="start">
            <Heading fontSize="2xl">{title}</Heading>
            <Text fontWeight="medium">{subtitle}</Text>
          </VStack>
          <Button type="submit" leftIcon={<EditIcon />} isLoading={isLoading}>
            Save
          </Button>
        </HStack>
        <Divider />
        {formOptions.map(({ name, title, subtitle, defaultValue, CustomComponent }) => (
          <>
            <HStack key={title} justifyContent="space-between" width="full">
              <VStack alignItems="start" flex={1}>
                <Text fontWeight="bold">{title}</Text>
                <Text fontSize="sm" color="gray.500">
                  {subtitle}
                </Text>
              </VStack>
              {CustomComponent ? (
                <Controller
                  name={name}
                  control={control}
                  defaultValue={defaultValue}
                  render={({ field: { onChange, value, ref } }) =>
                    CustomComponent({ name, onChange, defaultValue, value, ref })
                  }
                />
              ) : (
                <Input flex={1} placeholder="Full name" defaultValue={defaultValue} {...register(name)} />
              )}
            </HStack>
            <Divider />
          </>
        ))}
      </VStack>
    </form>
  );
};

export default SettingsLayout;
