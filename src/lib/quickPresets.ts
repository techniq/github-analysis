import { PeriodType } from '@layerstack/utils';
import { timeDay, timeMonth, timeYear } from 'd3-time';

export const quickPresets = ({ baseDate }: { baseDate: 'today' | 'yesterday' }) => {
  const dateToUse = baseDate === 'yesterday' ? timeDay.offset(new Date(), -1) : new Date();
  return [
    {
      label: 'Last 90 days',
      value: { periodType: PeriodType.Day, from: timeDay.offset(dateToUse, -90), to: dateToUse }
    },
    {
      label: 'Last 6 months',
      value: {
        periodType: PeriodType.Day,
        from: timeMonth.offset(dateToUse, -6),
        to: dateToUse
      }
    },
    {
      label: 'Year to date',
      value: { periodType: PeriodType.Week, from: timeYear.floor(dateToUse), to: dateToUse }
    },
    {
      label: 'Last year',
      value: {
        periodType: PeriodType.Week,
        from: timeMonth.offset(dateToUse, -12),
        to: dateToUse
      }
    },
    {
      label: 'Last 2 years',
      value: {
        periodType: PeriodType.Month,
        from: timeYear.offset(dateToUse, -2),
        to: dateToUse
      }
    },
    {
      label: 'Last 5 years',
      value: {
        periodType: PeriodType.CalendarYear,
        from: timeYear.offset(dateToUse, -5),
        to: dateToUse
      }
    },
    {
      label: 'Last 10 years',
      value: {
        periodType: PeriodType.CalendarYear,
        from: timeYear.offset(dateToUse, -10),
        to: dateToUse
      }
    }
  ];
};
