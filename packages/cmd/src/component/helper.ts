export const isValidComponentName = (compName: string) =>
  compName && /^[a-zA-Z]+(\-?[a-zA-Z])*$/.test(compName);

export const convertFirstLetterUpper = (str = '') => {
  if (!str || typeof str !== 'string') return;

  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const convertCamelOrPascalName = (name: string, pascal = false) => {
  if (!name || typeof name !== 'string') return name;

  const nameList = name.split('-').filter((_) => _);

  let ret = '';

  nameList.forEach((n, i) => {
    if (i === 0 && !pascal) {
      ret += n;
    } else {
      ret += convertFirstLetterUpper(n);
    }
  });

  return ret;
};
