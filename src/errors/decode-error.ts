export default class DecodeError extends Error {
  public readonly name = 'DecodeError';

  constructor(...params: any[]) {
    super(...params);

    Error.captureStackTrace(this, DecodeError);
  }
}
