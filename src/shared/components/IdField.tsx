import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Box, Tooltip, useToast } from '@chakra-ui/react';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { IdFieldProps } from '../interfaces';

/* Enables editors to copy document ids */
const IdField = ({ source, record = {} }: IdFieldProps): ReactElement => {
  const toast = useToast();

  const handleCopyId = () => {
    if (navigator) {
      navigator.clipboard.writeText(get(record, source));
      toast({
        title: 'Copied to clipboard 📋',
        description: 'Document id has been copied to your clipboard',
        status: 'info',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Box display="flex" flexDirection="row" alignItems="center" className="space-x-4">
      <span className="MuiTypography-root MuiTypography-body2">{get(record, source)}</span>
      {get(record, source) ? (
        <Tooltip label="Copy document id">
          <FileCopyIcon className="cursor-pointer" onClick={handleCopyId} />
        </Tooltip>
      ) : null}
    </Box>
  );
};

export default IdField;
