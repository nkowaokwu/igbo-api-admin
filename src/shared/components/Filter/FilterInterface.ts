import { FilterProps } from 'react-admin';

interface Filter extends FilterProps {
  resource?: string,
};

export default Filter;
