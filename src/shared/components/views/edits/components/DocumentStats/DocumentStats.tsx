import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import EditDocumentStats from '../EditDocumentStats';
import DocumentStatsInterface from './DocumentStatsInterface';

/** Shows all document stats */
const DocumentStats = ({ approvals, denials }: DocumentStatsInterface): ReactElement => (
  <Box className="flex flex-col lg:flex-row flex-auto justify-between items-start">
    {approvals && denials ? <EditDocumentStats approvals={approvals} denials={denials} /> : null}
  </Box>
);

export default DocumentStats;
