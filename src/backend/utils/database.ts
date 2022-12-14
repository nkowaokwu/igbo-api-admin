import mongoose from 'mongoose';
import * as functions from 'firebase-functions';
import { MONGO_URI } from 'src/backend/services/initializeAdmin';

const config = functions.config();
const DISCONNECTED = 0;

/* Opens a connection to MongoDB */
export const connectDatabase = async (): Promise<mongoose.Connection> => new Promise((resolve) => {
  /* Connects to the MongoDB Database */
  if (config?.runtime?.env === 'production') {
    console.time('Create MongoDB connection');
  }
  const mongooseConnection = mongoose.createConnection(MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    poolSize: 20,
    bufferMaxEntries: 0,
    useUnifiedTopology: true,
  });

  mongooseConnection.on('error', console.error.bind(console, '❌ MongoDB connection error:'));
  mongooseConnection.once('open', () => {
    if (config?.runtime?.env === 'production') {
      console.timeEnd('Create MongoDB connection');
      console.log('🆕 Created a new mongooseConnection.');
      console.log('🗄 Database is connected', process.env.CI, MONGO_URI);
    }
    resolve(mongooseConnection);
  });
});

/* Closes current connection to MongoDB */
export const disconnectDatabase = (mongooseConnection: mongoose.Connection): Promise<void> => new Promise((resolve) => {
  if (mongooseConnection.readyState !== DISCONNECTED) {
    mongooseConnection.close();
    mongooseConnection.once('close', () => {
      if (config?.runtime?.env === 'production') {
        console.log('🗃 Database is connection closed', process.env.CI, MONGO_URI);
      }
      resolve();
    });
  }
});
