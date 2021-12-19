export const classMethodNotImplError = (methodName: string) => {
  throw new Error(`The ${methodName} should be implemented.`)
};
