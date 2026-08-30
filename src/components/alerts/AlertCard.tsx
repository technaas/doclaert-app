import { memo } from 'react';

import { ExpiryFooter } from '@/src/components/ui/ExpiryFooter';
import { ListCard } from '@/src/components/ui/ListCard';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { listCardTone } from '@/src/lib/documentStatus';
import {
  getAlertCardTone,
  getAlertStatusLabel,
} from '@/src/lib/alertUrgency';
import type { AlertListItem } from '@/src/types/alerts';

type AlertCardProps = {
  alert: AlertListItem;
  onPress: () => void;
};

function AlertCardComponent({ alert, onPress }: AlertCardProps) {
  const isExpired = alert.displayStatus === 'expired';
  const tone = listCardTone(alert.displayStatus);
  const statusLabel = getAlertStatusLabel(alert.displayStatus, alert.daysRemaining);
  const badgeTone = getAlertCardTone(alert.displayStatus, alert.daysRemaining);
  const isVehicle = alert.kind === 'vehicle';

  const title = isVehicle
    ? `${alert.documentLabel} · ${alert.typeLabel}`
    : alert.documentLabel;

  const subtitle = isVehicle
    ? undefined
    : alert.typeLabel;

  const linkedSubtitle = !isVehicle ? `Linked to: ${alert.linkedTo}` : undefined;

  return (
    <ListCard
      title={title}
      subtitle={subtitle ?? linkedSubtitle}
      meta={`${alert.brandName} · ${alert.branchName}`}
      tone={tone}
      onPress={onPress}
      badges={
        !isExpired ? (
          <StatusBadge label={alert.kind === 'staff' ? 'Staff' : alert.kind === 'branch' ? 'License' : 'Vehicle'} tone="neutral" size="sm" />
        ) : (
          <StatusBadge label="Expired" tone="danger" size="sm" />
        )
      }
      footer={
        <ExpiryFooter
          expiryDate={alert.expiryDate}
          daysRemaining={alert.daysRemaining}
          statusLabel={statusLabel}
          statusTone={badgeTone}
        />
      }
    />
  );
}

export const AlertCard = memo(AlertCardComponent);
