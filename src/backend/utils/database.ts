import mongoose from 'mongoose';
import * as functions from 'firebase-functions';
import { MONGO_URI } from 'src/backend/services/initializeAdmin';

const config = functions.config();
const CONNECTED = 1;
const DISCONNECTING = 3;
let mongooseConnection: null | mongoose.Connection = null;

/* Opens a connection to MongoDB */
export const connectDatabase = async (): Promise<mongoose.Connection> => new Promise((resolve) => {
  /* Connects to the MongoDB Database */
  if (
    !mongooseConnection
    || (mongooseConnection?.readyState !== CONNECTED && mongooseConnection?.readyState !== DISCONNECTING)
  ) {
    mongooseConnection = mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      poolSize: 50,
      bufferMaxEntries: 0,
      useUnifiedTopology: true,
    });

    mongooseConnection.on('error', console.error.bind(console, '❌ MongoDB connection error:'));
    mongooseConnection.once('open', () => {
      if (config?.runtime?.env === 'production') {
        console.log('🆕 Created a new mongooseConnection.');
        console.log('🗄 Database is connected', process.env.CI, MONGO_URI);
      }
      resolve(mongooseConnection);
    });
  } else {
    if (config?.runtime?.env === 'production') {
      console.log('ℹ️  mongooseConnection has already been initialized and is being reused.');
    }
    resolve(mongooseConnection);
  }
});

/* Closes current connection to MongoDB */
export const disconnectDatabase = (): Promise<void> => new Promise((resolve) => {
  resolve();
  // if (connection.readyState !== DISCONNECTED) {
  //   connection.close();
  //   connection.once('close', () => {
  //     if (config?.runtime?.env === 'production') {
  //       console.log('🗃 Database is connection closed', process.env.CI, MONGO_URI);
  //     }
  //     resolve();
  //   });
  // }
});
