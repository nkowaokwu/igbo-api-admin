import moment from 'moment';

/* Renders the date in a correct format */
export const determineDate = (date: string | number | Date): string | Date => {
  if (!date) {
    return 'N/A';
  }
  return moment(date).format('MMMM DD, YYYY @ H:mm a');
};
