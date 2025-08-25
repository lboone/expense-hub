import {
  ExtractJwt,
  Strategy as JwtStrategy,
  type StrategyOptions,
} from "passport-jwt";

import passport from "passport";
import Env from "../config/env.config";
import { findByIdUserService } from "../services/user.service";

interface JwtPayload {
  userId: string;
}

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: Env.JWT_SECRET,
  audience: ["user"],
  algorithms: ["HS256"],
};

passport.use(
  new JwtStrategy(options, async (payload: JwtPayload, done) => {
    try {
      if (!payload.userId)
        return done(null, false, { message: "Invalid token payload" });

      const user = await findByIdUserService(payload.userId);
      if (!user) return done(null, false, { message: "User not found" });

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

export const passportAuthenticatedJwt = passport.authenticate("jwt", {
  session: false,
});
