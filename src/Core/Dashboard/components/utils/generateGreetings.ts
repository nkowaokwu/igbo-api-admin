import moment from 'moment';

const generateGreetings = (): string => {
  const currentHour = parseInt(moment().format('HH'), 10);

  if (currentHour >= 3 && currentHour < 12) {
    return 'Good morning';
  }
  if (currentHour >= 12 && currentHour < 15) {
    return 'Good afternoon';
  }
  if (currentHour >= 15 && currentHour < 20) {
    return 'Good evening';
  }
  if (currentHour >= 20 || currentHour < 3) {
    return 'Good evening';
  }
  return 'Hello';
};

export default generateGreetings;
