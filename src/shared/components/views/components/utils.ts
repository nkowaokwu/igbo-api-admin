import { compact, trim, map } from 'lodash';
import View from '../../../constants/Views';

/* Removes white space from arrays that contains spaces */
export const sanitizeArray = (items = []) : string[] => compact(map(items, (item) => trim(item)));

export const onCancel = ({ view, resource, history }: { view: string, resource: string, history: any }): any => {
  localStorage.removeItem('igbo-api-admin-form');
  return view === View.CREATE ? history.push(`/${resource}`) : history.push(View.SHOW);
};
