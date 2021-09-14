export interface ServerResponse extends firebase.default.functions.HttpsCallableResult {
  data: {
    success: boolean,
    errors?: ServerErrors,
  };
}

export type ServerErrors = AuthErrors | UserErrors | DocErrors;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CallableFunctionInputs { }
export interface CallableFunctionResponse {
  [key: string]: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EmptyResponse extends CallableFunctionResponse { }

export interface CallableFunction<CallableInputs extends CallableFunctionInputs,
  CallableOutputs extends CallableFunctionResponse> extends firebase.default.functions.HttpsCallable {
  (data: CallableInputs): Promise<ServerResponse & { data: CallableOutputs; }>;
}

export enum AuthErrors {
  INVALID_SIGNUP = 'Your signup failed. You may already have an account',
  NOT_ADMIN = 'Only admin roles are authorized for this task',
  INSUFFICIENT_PERMISSIONS = 'The user does not have the permissions for this task',
  INVALID_LOGIN = 'The username or password is incorrect',
  INVALID_TOKEN = 'Invalid token',
}

export enum UserErrors {
  USER_EXISTS = 'This user you are trying to create already exists',
}

export enum DocErrors {
  NOT_FOUND = 'This document does not exist',
  ID_EXISTS = 'A document with this ID already exists',
}

/**
 * Send an error result to the client
 *
 * @param errors The specific server error
 */
export const errorResponse = (errors: ServerErrors) => ({
  success: false,
  errors,
});

/**
 * Send an erorr result to the client. Mock server response and send to client
 *
 * @param errors The specific server error
 */
export const errorResponseClient = (errors: ServerErrors) => ({
  data: {
    success: false,
    errors,
  },
});

/**
 * Send a success result to the client
 *
 * @param data The data (if any) to send back to the client
 */
export const successResponse = <CallableOutputs extends CallableFunctionResponse>(data?: CallableOutputs) => ({
  success: true,
  ...data,
});

/**
 * Send a success result to the client
 *
 * @param data The data (if any) to send back to the client
 */
export const successResponseClient = <CallableOutputs extends CallableFunctionResponse>(data?: CallableOutputs) => ({
  data: {
    success: true,
    ...data,
  },
});
