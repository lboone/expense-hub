import { DataTable } from "@/components/data-table";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { _TRANSACTION_TYPE, _TransactionType } from "@/constant";
import {
  useBulkDeleteTransactionMutation,
  useGetAllTransactionsQuery,
} from "@/features/transaction/transactionAPI";
import useDebouncedSearch from "@/hooks/use-debounce-search";
import { useState } from "react";
import { toast } from "sonner";
import { transactionColumns } from "./column";

type FilterType = {
  type?: _TransactionType | undefined;
  recurringStatus?: "RECURRING" | "NON_RECURRING" | undefined;
  pageNumber?: number;
  pageSize?: number;
};

const TransactionTable = (props: {
  pageSize?: number;
  isShowPagination?: boolean;
}) => {
  const [filter, setFilter] = useState<FilterType>({
    type: undefined,
    recurringStatus: undefined,
    pageNumber: 1,
    pageSize: props.pageSize || 10,
  });

  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [pendingBulkDeleteIds, setPendingBulkDeleteIds] = useState<string[]>(
    []
  );

  const { debouncedTerm, setSearchTerm } = useDebouncedSearch("", {
    delay: 500,
  });

  const [bulkDeleteTransaction, { isLoading: isBulkDeleting }] =
    useBulkDeleteTransactionMutation();

  const { data, isFetching } = useGetAllTransactionsQuery({
    keyword: debouncedTerm,
    type: filter.type,
    recurringStatus: filter.recurringStatus,
    pageNumber: filter.pageNumber,
    pageSize: filter.pageSize,
  });

  const transactions = data?.data?.transactions || [];
  const paginations = data?.data?.pagination || {
    pageSize: 0,
    pageNumber: 0,
    totalCount: 0,
    totalPages: 0,
  };

  const pagination = {
    totalItems: paginations?.totalCount || 0,
    totalPages: paginations?.totalPages || 0,
    pageNumber: filter.pageNumber,
    pageSize: filter.pageSize,
  };

  const handleSearch = (value: string) => {
    console.log(debouncedTerm);
    setSearchTerm(value);
  };

  const handleFilterChange = (filters: Record<string, string>) => {
    const { type, frequently } = filters;
    setFilter((prev) => ({
      ...prev,
      type: type as _TransactionType,
      recurringStatus: frequently as "RECURRING" | "NON_RECURRING",
    }));
  };

  const handlePageChange = (pageNumber: number) => {
    setFilter((prev) => ({ ...prev, pageNumber }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilter((prev) => ({ ...prev, pageSize }));
  };

  const handleBulkDelete = (transactionIds: string[]) => {
    setPendingBulkDeleteIds(transactionIds);
    setShowBulkDeleteDialog(true);
  };

  const executeBulkDelete = () => {
    bulkDeleteTransaction(pendingBulkDeleteIds)
      .unwrap()
      .then(() => {
        toast.success(
          `${pendingBulkDeleteIds.length} transactions deleted successfully`
        );
        setShowBulkDeleteDialog(false);
        setPendingBulkDeleteIds([]);
      })
      .catch((error) => {
        toast.error(error.data?.message || "Failed to delete transactions");
      });
  };

  return (
    <>
      <DataTable
        data={transactions} //transactions
        columns={transactionColumns}
        searchPlaceholder="Search transactions..."
        isLoading={isFetching}
        isBulkDeleting={isBulkDeleting}
        isShowPagination={props.isShowPagination}
        pagination={pagination}
        filters={[
          {
            key: "type",
            label: "All Types",
            options: [
              { value: _TRANSACTION_TYPE.INCOME, label: "Income" },
              { value: _TRANSACTION_TYPE.EXPENSE, label: "Expense" },
            ],
          },
          {
            key: "frequently",
            label: "Frequently",
            options: [
              { value: "RECURRING", label: "Recurring" },
              { value: "NON_RECURRING", label: "Non-Recurring" },
            ],
          },
        ]}
        onSearch={handleSearch}
        onPageChange={(pageNumber) => handlePageChange(pageNumber)}
        onPageSizeChange={(pageSize) => handlePageSizeChange(pageSize)}
        onFilterChange={(filters) => handleFilterChange(filters)}
        onBulkDelete={handleBulkDelete}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showBulkDeleteDialog}
        setIsOpen={setShowBulkDeleteDialog}
        title="Are you sure you want to delete these transactions?"
        description={`This will permanently delete ${
          pendingBulkDeleteIds.length
        } selected transaction${
          pendingBulkDeleteIds.length !== 1 ? "s" : ""
        }. This action cannot be undone.`}
        onConfirm={executeBulkDelete}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isBulkDeleting}
        variant="destructive"
      />
    </>
  );
};
export default TransactionTable;
// function bulkDeleteTransaction(transactionIds: string[]) {
//   throw new Error("Function not implemented.");
// }
