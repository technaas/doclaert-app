import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DocumentFileActions } from '@/src/components/documents/DocumentFileActions';
import { DetailRow } from '@/src/components/ui/DetailRow';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { colors, radius, spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useVehicleDetailData } from '@/src/hooks/useVehicleDetailData';
import {
  DOCUMENT_STATUS_LABEL,
  daysRemainingForVehicleDaftar,
  formatDaysRemaining,
  statusBadgeTone,
  uiStatusForVehicleDaftar,
} from '@/src/lib/documentStatus';
import {
  formatPlateNumber,
  formatVehicleTitle,
  safeText,
  VEHICLE_DAFTAR_LABEL,
} from '@/src/lib/vehicleFields';
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
    driverCivilIdFileUrl,
    loading,
    error,
    retry,
  } = useVehicleDetailData(companyId, vehicleId);

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

  const daftarStatus = uiStatusForVehicleDaftar(vehicle.daftar_expiry_date);
  const days = daysRemainingForVehicleDaftar(vehicle.daftar_expiry_date);
  const statusLabel = safeText(vehicle.status) || '—';
  const recordTone =
    statusLabel.toLowerCase() === 'active'
      ? 'success'
      : statusLabel.toLowerCase() === 'inactive'
        ? 'muted'
        : 'default';
  const vehicleTitle = formatVehicleTitle(vehicle);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle</Text>
        <DetailRow label="Company name" value={safeText(vehicle.company_name) || '—'} />
        <DetailRow label="Vehicle number" value={safeText(vehicle.number) || '—'} />
        <DetailRow label="Vehicle make" value={safeText(vehicle.vehicle_make) || '—'} />
        <DetailRow label="Model" value={safeText(vehicle.model) || '—'} />
        <DetailRow label="Registration / plate" value={formatPlateNumber(vehicle.plate_number)} />
        <DetailRow label="Year" value={vehicle.year_of_manufacture?.toString() ?? '—'} />
        <DetailRow label="Color" value={safeText(vehicle.vehicle_color) || '—'} />
        <DetailRow label="Chassis number (VIN)" value={safeText(vehicle.chassis_number) || '—'} />
        <DetailRow label="Engine number" value={safeText(vehicle.engine_number) || '—'} />
        <DetailRow label="Status">
          <StatusBadge label={statusLabel} tone={recordTone} />
        </DetailRow>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Daftar</Text>
        <DetailRow label="Daftar number" value={safeText(vehicle.daftar_number) || '—'} />
        <DetailRow label="Daftar expiry" value={vehicle.daftar_expiry_date ?? '—'} />
        <DetailRow label="Days remaining" value={formatDaysRemaining(days)} />
        <DetailRow label="Daftar status">
          <StatusBadge
            label={DOCUMENT_STATUS_LABEL[daftarStatus]}
            tone={statusBadgeTone(daftarStatus)}
          />
        </DetailRow>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Organization</Text>
        <DetailRow label="Brand" value={brandName} />
        <DetailRow label="Branch" value={branchName} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daftar file</Text>
        <DocumentFileActions
          storedFileUrl={daftarFileUrl}
          title={`${vehicleTitle} · ${VEHICLE_DAFTAR_LABEL}`}
          viewLabel="View Vehicle Daftar"
          emptyLabel="No Daftar file uploaded"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Driver Civil ID</Text>
        <DetailRow label="Driver name" value={safeText(vehicle.driver_name) || '—'} />
        <DetailRow
          label="Civil ID number"
          value={safeText(vehicle.driver_civil_id_number) || '—'}
        />
        <DocumentFileActions
          storedFileUrl={driverCivilIdFileUrl}
          title={`${vehicleTitle} · Driver Civil ID`}
          viewLabel="View Driver Civil ID"
          emptyLabel="No Civil ID file uploaded"
        />
      </View>
    </ScrollView>
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
});
