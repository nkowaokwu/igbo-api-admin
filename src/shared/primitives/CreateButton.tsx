import React, { ReactElement } from 'react';
import { Button } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const CreateButton = ({ basePath }: { basePath: string }): ReactElement => (
  <Button
    leftIcon={<AddIcon />}
    onClick={() => {
      window.location.hash = `#${basePath}/create`;
    }}
    aria-label="Create"
    variant="primary"
  >
    Create
  </Button>
);

export default CreateButton;
