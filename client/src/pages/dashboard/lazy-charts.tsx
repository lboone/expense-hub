import { Loader } from "lucide-react";
import { lazy, Suspense } from "react";

// Lazy load chart components
const DashboardDataChart = lazy(() => import("./dashboard-data-chart"));
const ExpensePieChart = lazy(() => import("./expense-pie-chart"));

// Chart loading fallback
const ChartLoader = () => (
  <div className="flex items-center justify-center h-48 w-full">
    <div className="flex flex-col items-center gap-2">
      <Loader className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading chart...</p>
    </div>
  </div>
);

// Lazy chart wrapper components
export const LazyDashboardDataChart = (props: Record<string, unknown>) => (
  <Suspense fallback={<ChartLoader />}>
    <DashboardDataChart {...props} />
  </Suspense>
);

export const LazyExpensePieChart = (props: Record<string, unknown>) => (
  <Suspense fallback={<ChartLoader />}>
    <ExpensePieChart {...props} />
  </Suspense>
);
