import React, { ReactElement } from 'react';
import { Box, Select, Text } from '@chakra-ui/react';

const SentenceMetaDataDropdown = ({
  values,
  onChange,
  defaultValue,
  title,
  description,
}: {
  values: { value: string; label: string }[];
  onChange: (value: any) => void;
  defaultValue: string;
  title: string;
  description: string;
}): ReactElement => (
  <Box mt={2}>
    <Text fontWeight="bold">{title}</Text>
    <Text fontSize="sm" color="gray.400" fontStyle="italic" mb="2">
      {description}
    </Text>
    <Select placeholder="Select option" onChange={onChange} defaultValue={defaultValue}>
      {values.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Select>
  </Box>
);

export default SentenceMetaDataDropdown;
