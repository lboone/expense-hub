import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  endOfDay,
  format,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";

export const DateRangeEnum = {
  LAST_30_DAYS: "30days",
  LAST_MONTH: "lastMonth",
  LAST_3_MONTHS: "last3Months",
  LAST_YEAR: "lastYear",
  THIS_MONTH: "thisMonth",
  THIS_YEAR: "thisYear",
  ALL_TIME: "allTime",
  CUSTOM: "custom",
} as const;

export type DateRangeEnumType =
  (typeof DateRangeEnum)[keyof typeof DateRangeEnum];

export type DateRangeType = {
  from: Date | null;
  to: Date | null;
  value?: string;
  label: string;
} | null;

type DateRangePreset = {
  label: string;
  value: string;
  getRange: () => DateRangeType;
};

interface DateRangeSelectProps {
  dateRange: DateRangeType;
  setDateRange: (range: DateRangeType) => void;
  defaultRange?: DateRangeEnumType;
}

const now = new Date();
const today = endOfDay(now);

const presets: DateRangePreset[] = [
  {
    label: "Last 30 Days",
    value: DateRangeEnum.LAST_30_DAYS,
    getRange: () => ({
      from: subDays(today, 29),
      to: today,
      value: DateRangeEnum.LAST_30_DAYS,
      label: "for Past 30 Days",
    }),
  },
  {
    label: "Last Month",
    value: DateRangeEnum.LAST_MONTH,
    getRange: () => ({
      from: startOfMonth(subMonths(today, 1)),
      to: startOfMonth(today),
      value: DateRangeEnum.LAST_MONTH,
      label: "for Last Month",
    }),
  },
  {
    label: "Last 3 Months",
    value: DateRangeEnum.LAST_3_MONTHS,
    getRange: () => ({
      from: startOfMonth(subMonths(today, 3)),
      to: startOfMonth(today),
      value: DateRangeEnum.LAST_3_MONTHS,
      label: "for Past 3 Months",
    }),
  },
  {
    label: "Last Year",
    value: DateRangeEnum.LAST_YEAR,
    getRange: () => ({
      from: startOfYear(subYears(today, 1)),
      to: startOfYear(today),
      value: DateRangeEnum.LAST_YEAR,
      label: "for Past Year",
    }),
  },
  {
    label: "This Month",
    value: DateRangeEnum.THIS_MONTH,
    getRange: () => ({
      from: startOfMonth(today),
      to: today,
      value: DateRangeEnum.THIS_MONTH,
      label: "for This Month",
    }),
  },
  {
    label: "This Year",
    value: DateRangeEnum.THIS_YEAR,
    getRange: () => ({
      from: startOfYear(today),
      to: today,
      value: DateRangeEnum.THIS_YEAR,
      label: "for This Year",
    }),
  },
  {
    label: "All Time",
    value: DateRangeEnum.ALL_TIME,
    getRange: () => ({
      from: null,
      to: null,
      value: DateRangeEnum.ALL_TIME,
      label: "across All Time",
    }),
  },
  {
    label: "Custom Range",
    value: DateRangeEnum.CUSTOM,
    getRange: () => ({
      from: null,
      to: null,
      value: DateRangeEnum.CUSTOM,
      label: "for Custom Range",
    }),
  },
];

export const DateRangeSelect = ({
  dateRange,
  setDateRange,
  defaultRange = DateRangeEnum.LAST_30_DAYS,
}: DateRangeSelectProps) => {
  const [open, setOpen] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customFromDate, setCustomFromDate] = useState<Date | undefined>();
  const [customToDate, setCustomToDate] = useState<Date | undefined>();

  const displayText = dateRange
    ? dateRange.value === DateRangeEnum.CUSTOM && dateRange.from
      ? dateRange.to
        ? `${format(dateRange.from, "MMM dd, y")} - ${format(
            dateRange.to,
            "MMM dd, y"
          )}`
        : `${format(dateRange.from, "MMM dd, y")} - Present`
      : presets.find((p) => p.value === dateRange.value)?.label ||
        "Select a duration"
    : "Select a duration";

  // Set default range on initial render
  useEffect(() => {
    if (!dateRange) {
      const defaultPreset = presets.find((p) => p.value === defaultRange);
      if (defaultPreset) {
        // console.log(defaultPreset.getRange(),"defaultPreset.getRange()")
        setDateRange(defaultPreset.getRange());
      }
    }
  }, [dateRange, defaultRange, setDateRange]);

  // Reset custom date picker when switching away from custom range
  useEffect(() => {
    if (dateRange?.value !== DateRangeEnum.CUSTOM) {
      setShowCustomPicker(false);
      setCustomFromDate(undefined);
      setCustomToDate(undefined);
    } else if (
      dateRange?.value === DateRangeEnum.CUSTOM &&
      dateRange.from &&
      dateRange.to
    ) {
      setCustomFromDate(dateRange.from);
      setCustomToDate(dateRange.to);
    }
  }, [dateRange]);

  const handlePresetClick = (preset: DateRangePreset) => {
    if (preset.value === DateRangeEnum.CUSTOM) {
      setShowCustomPicker(true);
      // Don't close the popover for custom range
    } else {
      setDateRange(preset.getRange());
      setOpen(false);
    }
  };

  const handleCustomDateApply = () => {
    if (customFromDate) {
      const toDate = customToDate || endOfDay(new Date());
      const customRange: DateRangeType = {
        from: customFromDate,
        to: toDate,
        value: DateRangeEnum.CUSTOM,
        label: customToDate
          ? `from ${format(customFromDate, "MMM dd, y")} to ${format(
              customToDate,
              "MMM dd, y"
            )}`
          : `from ${format(customFromDate, "MMM dd, y")} to Present`,
      };
      setDateRange(customRange);
      setShowCustomPicker(false);
      setOpen(false);
    }
  };

  const handleCustomDateCancel = () => {
    setShowCustomPicker(false);
    setCustomFromDate(undefined);
    setCustomToDate(undefined);
    // If there's no existing custom range, go back to the previous selection
    if (!dateRange || dateRange.value === DateRangeEnum.CUSTOM) {
      const defaultPreset = presets.find(
        (p) => p.value === DateRangeEnum.LAST_30_DAYS
      );
      if (defaultPreset) {
        setDateRange(defaultPreset.getRange());
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            `min-w-[200px] max-w-[280px] flex items-center justify-between text-left font-normal !bg-[var(--secondary-dark-color)]
            border-gray-700 !text-white !cursor-pointer`,
            !dateRange && "text-muted-foreground"
          )}
        >
          <span className="truncate mr-2">{displayText}</span>
          <ChevronDownIcon className="h-4 w-4 opacity-50 flex-shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("p-0", showCustomPicker ? "w-auto" : "w-auto")}
        align="start"
      >
        {!showCustomPicker ? (
          // Preset options
          <div className="grid py-1">
            {presets.map((preset) => (
              <Button
                key={preset.value}
                variant="ghost"
                className={cn(
                  "justify-start text-left",
                  dateRange?.value === preset.value && "bg-accent"
                )}
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        ) : (
          // Custom date picker
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomPicker(false)}
                className="h-7 px-2"
              >
                ← Back
              </Button>
              <div className="text-sm font-medium">
                Select Custom Date Range
              </div>
              <div className="w-12" /> {/* Spacer for alignment */}
            </div>

            {/* From Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Calendar
                mode="single"
                selected={customFromDate}
                onSelect={setCustomFromDate}
                disabled={(date) => date > new Date()}
                initialFocus
                className="rounded-md border"
              />
            </div>

            {/* To Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date (Optional)</label>
              <Calendar
                mode="single"
                selected={customToDate}
                onSelect={setCustomToDate}
                disabled={(date) =>
                  date > new Date() ||
                  (customFromDate ? date < customFromDate : false)
                }
                className="rounded-md border"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use current date
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleCustomDateApply}
                disabled={!customFromDate}
                className="flex-1"
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Apply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCustomDateCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
