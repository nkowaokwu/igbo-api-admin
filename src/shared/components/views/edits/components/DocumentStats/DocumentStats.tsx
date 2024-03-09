import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import EditDocumentStats from '../EditDocumentStats';
import DocumentIds from '../DocumentIds';
import DocumentStatsInterface from './DocumentStatsInterface';

/** Shows all document stats */
const DocumentStats = ({
  collection,
  originalId,
  record,
  id,
  approvals,
  denials,
  title,
}: DocumentStatsInterface): ReactElement => (
  <Box className="flex flex-col lg:flex-row flex-auto justify-between items-start">
    <DocumentIds collection={collection} originalId={originalId} record={record} id={id} title={title} />
    {approvals && denials ? <EditDocumentStats approvals={approvals} denials={denials} /> : null}
  </Box>
);

export default DocumentStats;
