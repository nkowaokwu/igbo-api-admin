import React, { ReactElement } from 'react';
import { Select } from '@chakra-ui/react';

const SentenceMetaDataDropdown = ({
  values,
  onChange,
}: {
  values: { value: string; label: string }[];
  onChange: (value: any) => void;
}): ReactElement => (
  <Select placeholder="Select option" onChange={onChange}>
    {values.map(({ value, label }) => (
      <option key={value} value={value}>
        {label}
      </option>
    ))}
  </Select>
);

export default SentenceMetaDataDropdown;
