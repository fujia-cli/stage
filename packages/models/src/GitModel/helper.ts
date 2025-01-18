export const classMethodNotImplError = (methodName: string) => {
  throw new Error(`The ${methodName} should be implemented.`)
};

export const isValidCommitMsg = (msg: string) => {
  return /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)\:\s.+$/.test(msg);
};
