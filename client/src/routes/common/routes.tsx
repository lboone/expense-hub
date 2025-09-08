import { lazy } from "react";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "./routePath";

// Lazy load authentication pages
const SignIn = lazy(() => import("@/pages/auth/sign-in.tsx"));
const SignUp = lazy(() => import("@/pages/auth/sign-up.tsx"));

// Lazy load protected pages
const Dashboard = lazy(() => import("@/pages/dashboard/index.tsx"));
const Transactions = lazy(() => import("@/pages/transactions/index.tsx"));
const Reports = lazy(() => import("@/pages/reports/index.tsx"));
const Settings = lazy(() => import("@/pages/settings/index.tsx"));

// Lazy load settings sub-pages
const Account = lazy(() => import("@/pages/settings/account.tsx"));
const Appearance = lazy(() => import("@/pages/settings/appearance.tsx"));
const Billing = lazy(() => import("@/pages/settings/billing.tsx"));

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
