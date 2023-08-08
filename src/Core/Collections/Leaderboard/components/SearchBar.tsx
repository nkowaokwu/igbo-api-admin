import React from 'react';
import { ChakraProps, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import * as Icons from '../../iconography';

type Props = {
  className?: string;
  onChange: (p: { value: string }) => void;
  styles?: ChakraProps['sx'];
  value?: string;
};

export const SearchBar: React.FC<Props> = ({ className, onChange, styles }) => {
  const handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ value: target.value });
  };

  return (
    <InputGroup marginBottom={4} marginTop={4}>
      <Input
        className={className}
        sx={styles}
        backgroundColor="transparent"
        border="1px solid gray.400"
        type="text"
        placeholder="Search"
        onChange={handleChange}
      />
      <InputRightElement>
        <Icons.Maginifier stroke="gray.600" />
      </InputRightElement>
    </InputGroup>
  );
};
