export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
  omitPassword: () => Omit<UserDocument, "password">;
}

export interface IRegisterResult {
  user: Omit<UserDocument, "password">;
}

export interface ILoginResult {
  user: Omit<UserDocument, "password">;
  accessToken: string;
  expiresAt: number | undefined;
  reportSetting: any;
}
