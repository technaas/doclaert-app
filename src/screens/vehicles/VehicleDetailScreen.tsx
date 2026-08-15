import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DocumentImagePreviewModal } from '@/src/components/documents/DocumentImagePreviewModal';
import { DetailRow } from '@/src/components/ui/DetailRow';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { colors, radius, spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useVehicleDetailData } from '@/src/hooks/useVehicleDetailData';
import {
  DOCUMENT_STATUS_LABEL,
  formatDaysRemaining,
  getDocumentDisplayStatus,
  statusBadgeTone,
} from '@/src/lib/documentStatus';
import { daysUntilExpiry } from '@/src/lib/expiry';
import { openDocumentFile, openUrlInBrowser } from '@/src/lib/openDocumentFile';
import {
  formatPlateNumber,
  formatVehicleTitle,
  safeText,
  VEHICLE_DAFTAR_LABEL,
} from '@/src/lib/vehicleFields';
import { resolveDocumentFileUrl } from '@/src/lib/documentFile';
import type { VehiclesStackParamList } from '@/src/navigation/VehiclesStack';

type Props = NativeStackScreenProps<VehiclesStackParamList, 'VehicleDetail'>;

export function VehicleDetailScreen({ route }: Props) {
  const { vehicleId } = route.params;
  const { profile } = useAuth();
  const companyId = profile?.company_id;

  const {
    vehicle,
    brandName,
    branchName,
    daftarFileUrl,
    thresholdDays,
    loading,
    error,
    retry,
  } = useVehicleDetailData(companyId, vehicleId);

  const [openingFile, setOpeningFile] = useState(false);
  const [fileOpenError, setFileOpenError] = useState<string | null>(null);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const handleOpenInBrowser = async () => {
    const url = resolveDocumentFileUrl(daftarFileUrl);
    if (!url) {
      setFileOpenError('Invalid document URL.');
      return;
    }

    setFileOpenError(null);
    setOpeningFile(true);

    try {
      await openUrlInBrowser(url);
    } catch (err) {
      setFileOpenError(err instanceof Error ? err.message : 'Failed to open in browser.');
    } finally {
      setOpeningFile(false);
    }
  };

  const handleViewDaftar = async () => {
    const url = resolveDocumentFileUrl(daftarFileUrl);
    if (!url) {
      setFileOpenError('Invalid document URL.');
      return;
    }

    setFileOpenError(null);
    setOpeningFile(true);

    try {
      const result = await openDocumentFile(url);

      if (result.action === 'image-preview') {
        setImagePreviewUrl(result.url);
        setImagePreviewVisible(true);
        return;
      }

      if (result.action === 'failed') {
        setFileOpenError(result.message);
      }
    } catch (err) {
      setFileOpenError(err instanceof Error ? err.message : 'Failed to open document.');
    } finally {
      setOpeningFile(false);
    }
  };

  if (loading && !vehicle) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !vehicle) {
    return (
      <View style={styles.centeredPad}>
        <ErrorState message={error ?? 'Vehicle not found.'} onRetry={() => void retry()} />
      </View>
    );
  }

  const daftarStatus = getDocumentDisplayStatus(vehicle.daftar_expiry_date, thresholdDays);
  const days = vehicle.daftar_expiry_date ? daysUntilExpiry(vehicle.daftar_expiry_date) : null;
  const statusLabel = safeText(vehicle.status) || '—';
  const recordTone =
    statusLabel.toLowerCase() === 'active'
      ? 'success'
      : statusLabel.toLowerCase() === 'inactive'
        ? 'muted'
        : 'default';

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle</Text>
          <DetailRow label="Vehicle Make" value={safeText(vehicle.vehicle_make) || '—'} />
          <DetailRow label="Model" value={safeText(vehicle.model) || '—'} />
          <DetailRow label="Plate Number" value={formatPlateNumber(vehicle.plate_number)} />
          <DetailRow label="Chassis Number (VIN)" value={safeText(vehicle.chassis_number) || '—'} />
          <DetailRow label="Engine Number" value={safeText(vehicle.engine_number) || '—'} />
          <DetailRow label="Vehicle Color" value={safeText(vehicle.vehicle_color) || '—'} />
          <DetailRow
            label="Year of Manufacture"
            value={vehicle.year_of_manufacture?.toString() ?? '—'}
          />
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <StatusBadge label={statusLabel} tone={recordTone} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Daftar</Text>
          <DetailRow label="Daftar Number" value={safeText(vehicle.daftar_number) || '—'} />
          <DetailRow label="Daftar Expiry" value={vehicle.daftar_expiry_date ?? '—'} />
          <DetailRow label="Days remaining" value={formatDaysRemaining(days)} />
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Daftar status</Text>
            <StatusBadge
              label={DOCUMENT_STATUS_LABEL[daftarStatus]}
              tone={statusBadgeTone(daftarStatus)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organization</Text>
          <DetailRow label="Brand" value={brandName} />
          <DetailRow label="Branch" value={branchName} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daftar file</Text>
          {daftarFileUrl ? (
            <>
              <Pressable
                style={[styles.fileButton, openingFile && styles.fileButtonDisabled]}
                onPress={() => void handleViewDaftar()}
                disabled={openingFile}>
                {openingFile ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : (
                  <Text style={styles.fileButtonText}>View Vehicle Daftar</Text>
                )}
              </Pressable>
              {fileOpenError ? (
                <>
                  <Text style={styles.fileError}>{fileOpenError}</Text>
                  <Pressable
                    style={[styles.secondaryButton, openingFile && styles.fileButtonDisabled]}
                    onPress={() => void handleOpenInBrowser()}
                    disabled={openingFile}>
                    <Text style={styles.secondaryButtonText}>Open in Browser</Text>
                  </Pressable>
                </>
              ) : null}
            </>
          ) : (
            <Text style={styles.noFile}>No Daftar file uploaded</Text>
          )}
        </View>
      </ScrollView>

      {imagePreviewUrl ? (
        <DocumentImagePreviewModal
          visible={imagePreviewVisible}
          uri={imagePreviewUrl}
          title={`${formatVehicleTitle(vehicle)} · ${VEHICLE_DAFTAR_LABEL}`}
          onClose={() => {
            setImagePreviewVisible(false);
            setImagePreviewUrl(null);
          }}
          onError={(message) => {
            setImagePreviewVisible(false);
            setImagePreviewUrl(null);
            setFileOpenError(message);
          }}
          onOpenInBrowser={() => void handleOpenInBrowser()}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  centeredPad: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  statusRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fileButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  fileButtonDisabled: {
    opacity: 0.7,
  },
  fileButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  noFile: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  fileError: {
    fontSize: 13,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
