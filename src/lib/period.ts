import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import { Period } from "@/types";

export function getWeeklyPeriod(weeksAgo = 0): Period {
  const now = new Date();
  const targetDate = subWeeks(now, weeksAgo);

  return {
    start: startOfWeek(targetDate, { weekStartsOn: 1 }),
    end: endOfWeek(targetDate, { weekStartsOn: 1 }),
    type: "weekly",
  };
}

export function getMonthlyPeriod(monthsAgo = 0): Period {
  const now = new Date();
  const targetDate = subMonths(now, monthsAgo);

  return {
    start: startOfMonth(targetDate),
    end: endOfMonth(targetDate),
    type: "monthly",
  };
}
