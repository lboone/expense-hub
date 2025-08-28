import mongoose from "mongoose";
import TransactionModel from "../../models/transaction.model";
import { calculateNextOccurrence } from "../../utils/helper";

export const processRecurringTransactions = async () => {
  const now = new Date();
  let totalCount = 0;
  let processedCount = 0;
  let failedCount = 0;
  try {
    const transactionCursor = await TransactionModel.find({
      isRecurring: true,
      nextRecurringDate: { $lte: now },
    }).cursor();
    console.log("Starting recurring process");

    for await (const tx of transactionCursor) {
      totalCount++;
      const nextDate = calculateNextOccurrence(
        tx.nextRecurringDate!,
        tx.recurringInterval!
      );

      const session = await mongoose.startSession();
      try {
        await session.withTransaction(
          async () => {
            // Extract only the necessary fields for the new transaction
            const txObject = tx.toObject();
            const newTransactionData = {
              userId: txObject.userId,
              title: `Recurring - ${txObject.title}`,
              type: txObject.type,
              amount: txObject.amount,
              category: txObject.category,
              date: tx.nextRecurringDate,
              isRecurring: false,
              nextRecurringDate: null,
              recurringInterval: null,
              lastProcessed: null,
              status: txObject.status,
              paymentMethod: txObject.paymentMethod,
              description: txObject.description,
            };

            await TransactionModel.create([newTransactionData], { session });
            await TransactionModel.updateOne(
              {
                _id: tx._id,
              },
              {
                $set: {
                  nextRecurringDate: nextDate,
                  lastProcessed: now,
                },
              },
              { session }
            );
          },
          {
            maxCommitTimeMS: 20000,
          }
        );

        processedCount++;
      } catch (error: any) {
        failedCount++;
        console.error(
          `Failed recurring transaction: (${tx.title}) - ${tx._id}`,
          error?.message
        );
      } finally {
        await session.endSession();
      }
    }

    console.log(
      `Processed ${processedCount} recurring transactions out of ${totalCount}.`
    );
    console.log(
      `Failed ${failedCount} recurring transactions out of ${totalCount}.`
    );

    return {
      success: true,
      processedCount,
      failedCount,
      totalCount,
    };
  } catch (error: any) {
    console.error("Error processing recurring transactions:", error);
    return {
      success: false,
      error: error?.message,
    };
  }
};
