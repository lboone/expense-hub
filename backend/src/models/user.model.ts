import { model, Schema } from "mongoose";
import { comparePassword, hashPassword } from "../utils/bcrypt";

const userSchema = new Schema<User.IDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, select: true, required: true },
    profilePicture: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashPassword(this.password);
    }
  }
  next();
});

userSchema.methods.omitPassword = function (): Omit<
  User.IDocument,
  "password"
> {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return comparePassword(password, this.password);
};

const UserModel = model<User.IDocument>("User", userSchema);

export default UserModel;
