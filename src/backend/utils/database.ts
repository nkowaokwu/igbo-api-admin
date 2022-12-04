import mongoose from 'mongoose';
import * as functions from 'firebase-functions';
import { MONGO_URI } from 'src/backend/services/initializeAdmin';

const config = functions.config();
const DISCONNECTED = 0;

/* Opens a connection to MongoDB */
export const connectDatabase = async (): Promise<mongoose.Connection> => new Promise((resolve) => {
  /* Connects to the MongoDB Database */
  const connection = mongoose.createConnection(MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    poolSize: 10,
    bufferMaxEntries: 0,
    useUnifiedTopology: true,
  });

  connection.on('error', console.error.bind(console, 'connection error:'));
  connection.once('open', () => {
    if (config?.runtime?.env === 'production') {
      console.log('🗄 Database is connected', process.env.CI, MONGO_URI);
    }
    resolve(connection);
  });
});

/* Closes current connection to MongoDB */
export const disconnectDatabase = (connection: mongoose.Connection): Promise<void> => new Promise((resolve) => {
  if (connection.readyState !== DISCONNECTED) {
    connection.close();
    connection.once('close', () => {
      if (config?.runtime?.env === 'production') {
        console.log('🗃 Database is connection closed', process.env.CI, MONGO_URI);
        resolve();
      }
    });
  }
});

export const isConnected = (): boolean => mongoose.connection.readyState !== 0;
