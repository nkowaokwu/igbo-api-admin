import { Heading, HStack, Input, Text, VStack } from '@chakra-ui/react';
import React, { ReactElement } from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import FilterConfigType from 'src/backend/shared/constants/FilterConfigType';
import { FilterConfig } from 'src/shared/components/FiltersModal/configs/filterConfigInterfaces';

const RenderConfigPanel = ({
  config,
  view,
  onChange,
  values,
}: {
  config: FilterConfig[];
  view: string;
  onChange: (value: { key: string; value: any }) => void;
  values: Record<string, any>;
}): ReactElement => {
  const currentConfig = config.find((c) => c.title === view);

  return currentConfig ? (
    <VStack width="full" alignItems="start">
      <HStack width="full" justifyContent="space-between" alignItems="flex-start">
        <VStack alignItems="start" gap={1} width="width">
          <Heading fontSize="lg" fontFamily="body" p={0} textAlign="left">
            {currentConfig.title}
          </Heading>
          <Text>{currentConfig.subtitle}</Text>
        </VStack>
        {currentConfig.icon}
      </HStack>
      {currentConfig.sections.map(({ title, key, type, placeholder, options, fetch }) => (
        <>
          <Heading fontSize="md" fontFamily="body" p={0} textAlign="left" color="gray.600">
            {title}
          </Heading>
          {(() => {
            switch (type) {
              case FilterConfigType.FREE_TEXT:
                return (
                  <Input
                    placeholder={placeholder}
                    onChange={(e) => onChange({ key, value: e.target.value })}
                    value={values[key] || ''}
                  />
                );
              case FilterConfigType.ASYNC_MULTI_SELECT:
                return (
                  <AsyncSelect
                    isMulti
                    loadOptions={fetch}
                    cacheOptions
                    styles={{ container: (styles) => ({ ...styles, width: '100%' }) }}
                    onChange={(value) => onChange({ key, value })}
                    value={values[key] || []}
                    noOptionsMessage={() => <></>}
                  />
                );
              case FilterConfigType.MULTI_SELECT:
                return (
                  <Select
                    isMulti
                    options={options || []}
                    styles={{ container: (styles) => ({ ...styles, width: '100%' }) }}
                    onChange={(value) => onChange({ key, value })}
                    value={values[key] || []}
                  />
                );
              case FilterConfigType.SINGLE_SELECT:
                return (
                  <Select
                    options={options || []}
                    styles={{ container: (styles) => ({ ...styles, width: '100%' }) }}
                    onChange={(value) => onChange({ key, value })}
                    value={values[key] || null}
                  />
                );
              default:
                return null;
            }
          })()}
        </>
      ))}
    </VStack>
  ) : null;
};

export default RenderConfigPanel;
