export default class EncodeError extends Error {
  public readonly name = 'EncodeError';

  constructor(...params: any[]) {
    super(...params);

    Error.captureStackTrace(this, EncodeError);
  }
}
