import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof Ionicons>['name'];

export const EMPTY_STATES = {
  documents: {
    title: 'No documents found',
    message: 'Staff documents, branch licenses, and vehicle Daftar will show here when available.',
    icon: 'document-text-outline' as IconName,
  },
  alerts: {
    title: 'No alerts at the moment',
    message: 'You are all caught up. Expiring and expired documents will appear here.',
    icon: 'notifications-off-outline' as IconName,
  },
  staff: {
    title: 'No staff found',
    message: 'Try adjusting your search or filters, or pull down to refresh.',
    icon: 'people-outline' as IconName,
  },
  branches: {
    title: 'No branches found',
    message: 'Try a different search or filter, or pull down to refresh.',
    icon: 'business-outline' as IconName,
  },
  brands: {
    title: 'No brands found',
    message: 'Brands for your company will appear here once added.',
    icon: 'storefront-outline' as IconName,
  },
  salary: {
    title: 'No salary records',
    message: 'Active staff with salary data will appear in this list.',
    icon: 'wallet-outline' as IconName,
  },
  salarySearch: {
    title: 'No matching records',
    message: 'Try a different name, employee ID, brand, or branch.',
    icon: 'search-outline' as IconName,
  },
  vehicles: {
    title: 'No vehicles found',
    message: 'Company vehicles will appear here once added from the web app.',
    icon: 'car-outline' as IconName,
  },
  notificationLogs: {
    title: 'No notification logs yet',
    message: 'Push notifications sent to your devices will appear here.',
    icon: 'notifications-outline' as IconName,
  },
} as const;
