const getEnv = (key: string, defaultValue?: string): string => {
  const nodeEnv = process.env.NODE_ENV || "development";
  const isDevelopment = nodeEnv === "development";

  // If in development and DEV_ version exists, use it
  if (isDevelopment) {
    const devKey = `DEV_${key}`;
    const devValue = process.env[devKey];
    if (devValue !== undefined) {
      return devValue;
    }
  }

  // Otherwise use the regular variable
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${key} is not set`);
    }
    return defaultValue;
  }
  return value;
};

export default getEnv;
