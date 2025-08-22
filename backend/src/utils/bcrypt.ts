import bcrypt from "bcrypt";

export const hashPassword = async (
  password: string,
  saltRounds: number = 10
): Promise<string> => await bcrypt.hash(password, saltRounds);

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => await bcrypt.compare(password, hashedPassword);
