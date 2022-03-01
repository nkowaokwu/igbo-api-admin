/* Renders the date in a correct format */
export const determineDate = (updatedAt: string | number): string | Date => {
  if (!updatedAt) {
    return 'N/A';
  }
  return new Date(updatedAt).toLocaleString();
};
