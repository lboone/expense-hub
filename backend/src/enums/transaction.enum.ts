export enum TransactionTypeEnum {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export enum RecurringIntervalEnum {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  BI_WEEKLY = "BI_WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum TransactionStatusEnum {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum PaymentMethodEnum {
  CARD = "CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  MOBILE_PAYMENT = "MOBILE_PAYMENT",
  AUTO_DEBIT = "AUTO_DEBIT",
  CASH = "CASH",
  OTHER = "OTHER",
}

export enum TransactionRecurringStatusEnum {
  RECURRING = "RECURRING",
  NON_RECURRING = "NON_RECURRING",
}
