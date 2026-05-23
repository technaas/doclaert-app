import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof Ionicons>['name'];

export const EMPTY_STATES = {
  documents: {
    title: 'No documents yet',
    message: 'Uploaded staff documents and branch licenses will appear here.',
    icon: 'document-text-outline' as IconName,
  },
  alerts: {
    title: 'All clear',
    message: 'No expiring or expired documents match your filters right now.',
    icon: 'notifications-outline' as IconName,
  },
  staff: {
    title: 'No staff found',
    message: 'Try a different search or filter, or pull down to refresh.',
    icon: 'people-outline' as IconName,
  },
  branches: {
    title: 'No branches found',
    message: 'Try adjusting search or filters, or pull down to refresh.',
    icon: 'business-outline' as IconName,
  },
  brands: {
    title: 'No brands found',
    message: 'Brands for your company will show up here once added.',
    icon: 'storefront-outline' as IconName,
  },
  salary: {
    title: 'No salary records',
    message: 'Active staff with salary data will appear in this list.',
    icon: 'wallet-outline' as IconName,
  },
  salarySearch: {
    title: 'No matching salary records found',
    message: 'Try a different name, employee ID, brand, or branch.',
    icon: 'search-outline' as IconName,
  },
  notificationLogs: {
    title: 'No notification logs yet',
    message:
      'Push notifications sent to your devices will appear here. Try changing filters or pull down to refresh.',
    icon: 'notifications-outline' as IconName,
  },
} as const;
