export class EmailAlreadyInUseError extends Error {
  constructor(message = 'Email already registered') {
    super(message);
    this.name = 'EmailAlreadyInUseError';
  }
}
