import type { SearchResult } from '@/types/search';

export function formatHours(hours?: SearchResult['hours']): string {
  if (!hours) {
    return 'Mon-Fri: 7AM-3PM • Sat: 8AM-2PM • Sun: Closed';
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  let formattedHours = '';
  let currentRange = {
    hours: '',
    startDay: '',
    endDay: ''
  };

  days.forEach((day, index) => {
    const dayHours = hours[day as keyof typeof hours] || 'Closed';
    
    if (currentRange.hours === dayHours) {
      currentRange.endDay = day;
    } else {
      if (currentRange.hours) {
        formattedHours += formatRange(currentRange) + ' • ';
      }
      currentRange = {
        hours: dayHours,
        startDay: day,
        endDay: day
      };
    }

    if (index === days.length - 1) {
      formattedHours += formatRange(currentRange);
    }
  });

  return formattedHours;
}

function formatRange(range: { hours: string; startDay: string; endDay: string }): string {
  const dayNames = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  };

  const startDay = dayNames[range.startDay as keyof typeof dayNames];
  const endDay = dayNames[range.endDay as keyof typeof dayNames];
  
  if (startDay === endDay) {
    return `${startDay}: ${range.hours}`;
  }
  
  return `${startDay}-${endDay}: ${range.hours}`;
}
