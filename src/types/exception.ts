export class CMException extends Error {
  code: number;
  msg: string;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.msg = message;
  }
}
