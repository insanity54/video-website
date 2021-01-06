
const envImport = (name) => {
  const uem = (name) => `${name}  must be defined in env, but it was undefined.`
  if (typeof process.env[name] === 'undefined') throw new Error(uem(name));
  return process.env[name];
}

module.exports = envImport;
