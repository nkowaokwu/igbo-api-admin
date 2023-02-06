import { Record } from 'react-admin';
import Collections from 'src/shared/constants/Collections';
import Views from 'src/shared/constants/Views';

interface Select {
  collection: Collections,
  label: string,
  permissions: { role: string },
  record: Record,
  resource: string,
  push: (value: string) => any,
  view?: Views,
}

export default Select;
