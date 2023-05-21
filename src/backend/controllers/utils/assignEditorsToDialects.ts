import { assign } from 'lodash';
import * as Interfaces from './interfaces';

const assignEditorsToDialects = ({
  clientData,
  compareData,
  userId,
} : {
  clientData: Interfaces.WordSuggestion,
  compareData: Interfaces.Word | Interfaces.WordSuggestion,
  userId: string,
}): Interfaces.WordClientData => {
  const updatedData = assign(clientData);
  if (!updatedData.dialects) {
    updatedData.dialects = [];
  }
  // Sets all newly created dialects' editor to the current user
  // if the word suggestion doesn't come from an existing word document
  if (!compareData) {
    updatedData.dialects = (clientData?.dialects || []).map((dialect) => ({
      ...dialect,
      editor: userId,
    }));
    return updatedData;
  }

  updatedData.dialects.forEach((_, index) => {
    const wordDialect = compareData.dialects[index];

    if (!wordDialect) {
      updatedData.dialects[index].editor = userId;
    } else {
      updatedData.dialects[index].editor = wordDialect?.editor;
    }
  });

  return updatedData;
};

export default assignEditorsToDialects;
