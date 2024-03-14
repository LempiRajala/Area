import { maxDiceValue, maxGameFieldSide } from "./const";

export type ValidationResult = { error: Array<Error> }

export const errIncorrectGameFieldSize = new Error('Game field value is incorrect');
export const errTooBigFieldSize = new Error('Game field size is too big');
export const errTooSmallFieldSize = new Error('Game field size is too small');

export const validateGameFieldSize = (value: number) => {
  const errors: Array<Error> = [];
  if(!Number.isFinite(value)) {
    errors.push(errIncorrectGameFieldSize);
  }

  if(value < maxDiceValue) {
    errors.push(errTooSmallFieldSize);
  }

  if(value > maxGameFieldSide) {
    errors.push(errTooBigFieldSize);
  }

  return { errors };
}