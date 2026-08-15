import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import type { DocumentTab } from '@/src/types/documents';

const TABS = [
  { key: 'all' as const, label: 'All' },
  { key: 'staff' as const, label: 'Staff' },
  { key: 'branch' as const, label: 'Licenses' },
  { key: 'vehicle' as const, label: 'Vehicles' },
];

type DocumentTabBarProps = {
  value: DocumentTab;
  onChange: (tab: DocumentTab) => void;
};

export function DocumentTabBar({ value, onChange }: DocumentTabBarProps) {
  return <SegmentedTabs tabs={TABS} value={value} onChange={onChange} />;
}

export { SegmentedTabs };
