import { Record } from 'react-admin';

interface DocumentStats {
  record: Record;
  collection?: string;
  showFull: boolean;
}

export default DocumentStats;
