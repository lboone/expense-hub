import type {
  TransactionRecurringStatusEnum,
  TransactionTypeEnum,
} from "../enums/transaction.enum";

export type RecurringStatus = keyof typeof TransactionRecurringStatusEnum;
export type TransactionType = keyof typeof TransactionTypeEnum;

export type TransactionFilters = {
  keyword?: string;
  type?: TransactionType;
  recurringStatus?: RecurringStatus;
};

export type TransactionPagination = {
  pageSize: number | 20;
  pageNumber: number | 1;
};
