import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Box, Tooltip, useToast } from '@chakra-ui/react';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import copyToClipboard from '../utils/copyToClipboard';
import { IdFieldProps } from '../interfaces';

/* Enables editors to copy document ids */
const IdField = ({ source, record = { id: null } }: IdFieldProps): ReactElement => {
  const toast = useToast();

  const handleCopyId = () => {
    copyToClipboard({
      copyText: get(record, source),
      successMessage: 'Document id has been copied to your clipboard',
    }, toast);
  };

  return (
    <Box display="flex" flexDirection="row" alignItems="center" className="space-x-4">
      <span className="MuiTypography-root MuiTypography-body2">{get(record, source)}</span>
      {get(record, source) ? (
        <Tooltip label="Copy document id">
          <FileCopyIcon className="cursor-pointer" style={{ height: 20 }} onClick={handleCopyId} />
        </Tooltip>
      ) : null}
    </Box>
  );
};

export default IdField;
