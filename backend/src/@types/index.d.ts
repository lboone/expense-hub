import {
  TransactionRecurringStatusEnum,
  TransactionTypeEnum,
} from "../enums/transaction.enum";

declare global {
  namespace Express {
    interface User extends User.IDocument {
      _id?: any;
    }
  }
  namespace System {
    interface IPagination {
      pageSize: number | 20;
      pageNumber: number | 1;
    }
  }
  namespace Transaction {
    type RecurringStatus = keyof typeof TransactionRecurringStatusEnum;
    type Type = keyof typeof TransactionTypeEnum;
    type Filters = {
      keyword?: string;
      type?: Transaction.Type;
      recurringStatus?: Transaction.RecurringStatus;
    };
  }
  namespace User {
    interface IDocument extends Document {
      name: string;
      email: string;
      password: string;
      profilePicture: string | null;
      createdAt: Date;
      updatedAt: Date;
      comparePassword: (password: string) => Promise<boolean>;
      omitPassword: () => Omit<User.IDocument, "password">;
    }
    interface IRegisterResult {
      user: Omit<User.IDocument, "password">;
    }
    interface ILoginResult {
      user: Omit<User.IDocument, "password">;
      accessToken: string;
      expiresAt: number | undefined;
      reportSetting: any;
    }
  }
  namespace Report {
    interface IInsightsAI {
      totalIncome: number;
      totalExpenses: number;
      availableBalance: number;
      savingsRate: number;
      categories: Record<string, { amount: number; percentage: number }>;
      periodLabel: string;
    }
  }
}
