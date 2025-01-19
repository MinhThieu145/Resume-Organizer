import { TimeGroupedItems } from '@/types'

export function groupItemsByTime<T extends { uploaded_at?: string }>(items: T[]): TimeGroupedItems<T> {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(now);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const groups: TimeGroupedItems<T> = {
    'Today': [],
    'Yesterday': [],
    'Earlier this week': [],
    'Earlier this month': [],
    'Older': []
  };

  items.forEach(item => {
    const uploadDate = item.uploaded_at ? new Date(item.uploaded_at) : new Date();
    
    if (uploadDate.toDateString() === now.toDateString()) {
      groups['Today'].push(item);
    } else if (uploadDate.toDateString() === yesterday.toDateString()) {
      groups['Yesterday'].push(item);
    } else if (uploadDate > lastWeek) {
      groups['Earlier this week'].push(item);
    } else if (uploadDate > lastMonth) {
      groups['Earlier this month'].push(item);
    } else {
      groups['Older'].push(item);
    }
  });

  return groups;
}
