/* eslint-disable no-console */
import chalk from 'chalk';
import assign from 'lodash/assign';
import { isProduction } from 'src/backend/config';

const originalTime = assign(console.time);
const originalTimeEnd = assign(console.timeEnd);

// @ts-expect-error
console.green = (...args) => console.log(chalk.green(...args));
// @ts-expect-error
console.blue = (...args) => console.log(chalk.blue(...args));
// @ts-expect-error
console.red = (...args) => console.log(chalk.red(...args));

console.time = (...args) => {
  if (isProduction) {
    originalTime(...args);
  }
};

console.timeEnd = (...args) => {
  if (isProduction) {
    originalTimeEnd(...args);
  }
};
