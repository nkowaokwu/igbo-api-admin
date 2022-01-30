/* Renders the date in a correct format */
export const determineDate = (updatedOn: string | number): string | Date => {
  if (!updatedOn) {
    return 'N/A';
  }
  return new Date(updatedOn).toLocaleString();
};
