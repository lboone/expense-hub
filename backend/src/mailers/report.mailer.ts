import { formatCurrency } from "../utils/format-currency";
import { sendEmail } from "./mailer";
import { getReportEmailTemplate } from "./templates/report.template";

export const sendReportEmail = async (params: Report.IEmailParams) => {
  const { email, username, report, frequency } = params;

  const html = getReportEmailTemplate(
    {
      username,
      ...report,
    },
    frequency
  );

  const text = `Your ${frequency} Financial Report (${report.period})
    Income: ${formatCurrency(report.totalIncome)}
    Expenses: ${formatCurrency(report.totalExpenses)}
    Balance: ${formatCurrency(report.availableBalance)}
    Savings Rate: ${report.savingsRate.toFixed(2)}%

    ${report.insights.join("\n")}
`;

  return sendEmail({
    to: email,
    subject: `${frequency} Financial Report - ${report.period}`,
    text,
    html,
  });
};
