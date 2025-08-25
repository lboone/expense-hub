import { UserDocument } from "./user.type";

declare global {
  namespace Express {
    interface User extends UserDocument {
      _id?: any;
    }
  }
}
