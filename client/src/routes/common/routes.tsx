import { lazy } from "react";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "./routePath";

// Lazy load authentication pages
const SignIn = lazy(() => import("@/pages/auth/sign-in"));
const SignUp = lazy(() => import("@/pages/auth/sign-up"));

// Lazy load protected pages
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Transactions = lazy(() => import("@/pages/transactions"));
const Reports = lazy(() => import("@/pages/reports"));
const Settings = lazy(() => import("@/pages/settings"));

// Lazy load settings sub-pages
const Account = lazy(() => import("@/pages/settings/account"));
const Appearance = lazy(() => import("@/pages/settings/appearance"));
const Billing = lazy(() => import("@/pages/settings/billing"));

export const authenticationRoutePaths = [
  { path: AUTH_ROUTES.SIGN_IN, element: <SignIn /> },
  { path: AUTH_ROUTES.SIGN_UP, element: <SignUp /> },
];

export const protectedRoutePaths = [
  { path: PROTECTED_ROUTES.OVERVIEW, element: <Dashboard /> },
  { path: PROTECTED_ROUTES.TRANSACTIONS, element: <Transactions /> },
  { path: PROTECTED_ROUTES.REPORTS, element: <Reports /> },
  {
    path: PROTECTED_ROUTES.SETTINGS,
    element: <Settings />,
    children: [
      { index: true, element: <Account /> }, // Default route
      { path: PROTECTED_ROUTES.SETTINGS, element: <Account /> },
      { path: PROTECTED_ROUTES.SETTINGS_APPEARANCE, element: <Appearance /> },
      { path: PROTECTED_ROUTES.SETTINGS_BILLING, element: <Billing /> },
    ],
  },
];
