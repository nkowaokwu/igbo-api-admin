import { Record, Identifier } from 'react-admin';
import Collection from 'src/shared/constants/Collection';

interface DocumentStats {
  collection: Collection;
  originalId?: string;
  record: Record;
  id: Identifier;
  approvals?: string[];
  denials?: string[];
  title?: string;
}
export default DocumentStats;
