import { Control } from 'react-hook-form';

interface DefinitionsForm {
  definitions: string[],
  setDefinitions: (array) => void,
  errors: any,
  control: Control,
};

export default DefinitionsForm;
