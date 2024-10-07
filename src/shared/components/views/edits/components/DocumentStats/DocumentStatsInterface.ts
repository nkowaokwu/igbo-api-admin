import { Record } from 'react-admin';
import Collection from 'src/shared/constants/Collection';

interface DocumentStats {
  collection: Collection;
  record: Record;
  approvals?: string[];
  denials?: string[];
}
export default DocumentStats;
