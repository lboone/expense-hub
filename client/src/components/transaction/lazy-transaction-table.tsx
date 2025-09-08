import { Loader } from "lucide-react";
import { lazy, Suspense } from "react";

// Lazy load the transaction table component
const TransactionTable = lazy(
  () => import("@/components/transaction/transaction-table")
);

// Table loading fallback
const TableLoader = () => (
  <div className="flex items-center justify-center h-64 w-full">
    <div className="flex flex-col items-center gap-2">
      <Loader className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading transactions...</p>
    </div>
  </div>
);

// Lazy table wrapper component
export const LazyTransactionTable = (props: {
  pageSize?: number;
  isShowPagination?: boolean;
}) => (
  <Suspense fallback={<TableLoader />}>
    <TransactionTable {...props} />
  </Suspense>
);

export default LazyTransactionTable;
