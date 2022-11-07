import { Record } from 'react-admin';
import { Control } from 'react-hook-form';
import { DefinitionSchema } from 'src/backend/controllers/utils/interfaces';

interface DefinitionsForm {
  getValues: (value: any) => any,
  cacheForm: (value: any) => void,
  options: any,
  record: Record,
  definitions: DefinitionSchema[],
  setDefinitions: (array) => void,
  errors: any,
  control: Control,
};

export default DefinitionsForm;
