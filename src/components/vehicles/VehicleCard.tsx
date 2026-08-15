import { memo } from 'react';

import { ExpiryFooter } from '@/src/components/ui/ExpiryFooter';
import { ListCard } from '@/src/components/ui/ListCard';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import {
  DOCUMENT_STATUS_LABEL,
  statusBadgeTone,
} from '@/src/lib/documentStatus';
import {
  formatDaftarNumber,
  formatOrgLine,
  formatPlateNumber,
  safeText,
  vehicleTitleFromListItem,
} from '@/src/lib/vehicleFields';
import type { VehicleListItem } from '@/src/types/vehicles';

type VehicleCardProps = {
  vehicle: VehicleListItem;
  onPress: () => void;
};

function VehicleCardComponent({ vehicle, onPress }: VehicleCardProps) {
  const daftarTone = statusBadgeTone(vehicle.displayStatus);
  const cardTone =
    vehicle.displayStatus === 'expired'
      ? 'danger'
      : vehicle.displayStatus === 'expiring'
        ? 'warning'
        : 'default';

  const statusLabel = safeText(vehicle.status) || '—';
  const recordTone =
    statusLabel.toLowerCase() === 'active'
      ? 'success'
      : statusLabel.toLowerCase() === 'inactive'
        ? 'neutral'
        : 'default';

  const plateDisplay = formatPlateNumber(vehicle.plateNumber);
  const daftarDisplay = formatDaftarNumber(vehicle.daftarNumber);

  const subtitleParts = [`Plate Number: ${plateDisplay}`];
  if (safeText(vehicle.daftarNumber)) {
    subtitleParts.push(`Daftar Number: ${daftarDisplay}`);
  }

  return (
    <ListCard
      title={vehicleTitleFromListItem(vehicle)}
      subtitle={subtitleParts.join(' · ')}
      meta={formatOrgLine(vehicle.brandName, vehicle.branchName)}
      tone={cardTone}
      onPress={onPress}
      badges={
        <>
          <StatusBadge label={statusLabel} tone={recordTone} size="sm" />
          <StatusBadge
            label={DOCUMENT_STATUS_LABEL[vehicle.displayStatus]}
            tone={daftarTone}
            size="sm"
          />
        </>
      }
      footer={
        <ExpiryFooter
          expiryDate={vehicle.daftarExpiryDate}
          daysRemaining={vehicle.daysRemaining}
          statusLabel={DOCUMENT_STATUS_LABEL[vehicle.displayStatus]}
          statusTone={daftarTone}
          expiryLabel="Daftar Expiry"
        />
      }
    />
  );
}

export const VehicleCard = memo(VehicleCardComponent);
