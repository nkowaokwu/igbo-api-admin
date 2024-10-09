import mongoose from 'mongoose';
import * as functions from 'firebase-functions/v1';
import { MONGO_URI } from 'src/backend/services/initializeAdmin';

const config = functions.config();
const DISCONNECTED = 0;
const mongooseConnection = mongoose.connection;

/* Opens a connection to MongoDB */
export const connectDatabase = async (): Promise<mongoose.Connection> =>
  new Promise((resolve) => {
    /* Connects to the MongoDB Database */
    if (mongooseConnection?.readyState === DISCONNECTED) {
      // console.time('Create MongoDB connection');
      mongoose.connect(MONGO_URI);

      mongooseConnection.on('error', console.error.bind(console, '❌ MongoDB connection error:'));
      mongooseConnection.once('open', () => {
        // console.timeEnd('Create MongoDB connection');
        if (config?.runtime?.env === 'production') {
          // console.log('🆕 Created a new mongooseConnection.');
          // console.log('🗄 Database is connected', process.env.CI, MONGO_URI);
        }
        resolve(mongooseConnection);
      });
    } else {
      if (config?.runtime?.env === 'production') {
        // console.log('ℹ️  mongooseConnection has already been initialized and is being reused.');
      }
      resolve(mongooseConnection);
    }
  });

/* Closes current connection to MongoDB */
export const disconnectDatabase = (): Promise<void> =>
  new Promise((resolve) => {
    resolve();
    // if (mongooseConnection.readyState !== DISCONNECTED) {
    //   mongooseConnection.close();
    //   mongooseConnection.once('close', () => {
    //     if (config?.runtime?.env === 'production') {
    //       // console.log('🗃 Database is connection closed', process.env.CI, MONGO_URI);
    //     }
    //     resolve();
    //   });
    // }
  });
