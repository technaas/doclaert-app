import { memo } from 'react';

import { ExpiryFooter } from '@/src/components/ui/ExpiryFooter';
import { ListCard } from '@/src/components/ui/ListCard';
import { listCardTone, DOCUMENT_STATUS_LABEL, statusBadgeTone } from '@/src/lib/documentStatus';
import type { DocumentListItem } from '@/src/types/documents';

type DocumentCardProps = {
  document: DocumentListItem;
  onPress: () => void;
};

function DocumentCardComponent({ document, onPress }: DocumentCardProps) {
  const badgeTone = statusBadgeTone(document.displayStatus);
  const cardTone = listCardTone(document.displayStatus);

  const subtitle =
    document.kind === 'vehicle'
      ? [document.vehicleMake, document.vehicleModel].filter(Boolean).join(' ') ||
        document.linkedTo
      : `Linked to: ${document.linkedTo}`;

  const meta =
    document.kind === 'vehicle' && document.plateNumber
      ? `Plate Number: ${document.plateNumber} · ${document.brandName} · ${document.branchName}`
      : `${document.brandName} · ${document.branchName}`;

  return (
    <ListCard
      title={document.documentLabel}
      subtitle={subtitle}
      meta={meta}
      tone={cardTone}
      onPress={onPress}
      footer={
        <ExpiryFooter
          expiryDate={document.expiryDate}
          daysRemaining={document.daysRemaining}
          statusLabel={DOCUMENT_STATUS_LABEL[document.displayStatus]}
          statusTone={badgeTone}
        />
      }
    />
  );
}

export const DocumentCard = memo(DocumentCardComponent);
