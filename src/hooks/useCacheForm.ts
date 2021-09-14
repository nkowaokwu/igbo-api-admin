/* THIS FILE IS DEPRECATED. IT IS NO LONGER USED 06/17/2021 */
import { useEffect } from 'react';
import { capitalize, forIn } from 'lodash';

const useCacheForm = (
  { record, setValue, cacheForm } :
  { record: any, setValue: any, cacheForm: () => void },
  callback: (key: string, value: any) => void = () => {},
): void => {
  useEffect(() => {
    const formData = localStorage.getItem('igbo-api-admin-form');
    const cachedForm = formData ? JSON.parse(formData) : {};
    if (cachedForm?.id === record.id) {
      forIn(cachedForm, (value, key) => {
        if (key === 'wordClass') {
          setValue(key, { label: capitalize(value), value });
        } else {
          setValue(key, value);
        }
        callback(key, value);
      });
    } else {
      cacheForm();
    }
  }, []);
};

export default useCacheForm;
