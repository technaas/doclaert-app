import { memo } from 'react';

import { ExpiryFooter } from '@/src/components/ui/ExpiryFooter';
import { ListCard } from '@/src/components/ui/ListCard';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import {
  DOCUMENT_STATUS_LABEL,
  listCardTone,
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
  const cardTone = listCardTone(vehicle.displayStatus);

  const statusLabel = safeText(vehicle.status) || '—';
  const recordTone =
    statusLabel.toLowerCase() === 'active'
      ? 'success'
      : statusLabel.toLowerCase() === 'inactive'
        ? 'neutral'
        : 'default';

  const plateDisplay = formatPlateNumber(vehicle.plateNumber);
  const daftarDisplay = formatDaftarNumber(vehicle.daftarNumber);

  const subtitleParts = [`Plate: ${plateDisplay}`];
  if (safeText(vehicle.fleetNumber)) {
    subtitleParts.unshift(`No. ${safeText(vehicle.fleetNumber)}`);
  }
  if (safeText(vehicle.companyName)) {
    subtitleParts.unshift(safeText(vehicle.companyName));
  }
  if (safeText(vehicle.daftarNumber)) {
    subtitleParts.push(`Daftar: ${daftarDisplay}`);
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
