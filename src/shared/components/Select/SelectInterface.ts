import { Record } from 'react-admin';

interface Select {
  collection: string,
  label: string,
  permissions: { role: string },
  record: Record,
  resource: string,
  push: (value: string) => any,
  view?: string,
}

export default Select;
