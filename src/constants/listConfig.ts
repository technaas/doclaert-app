/** Shared FlatList tuning for smoother scrolling on long lists. */
export const FLAT_LIST_PERF = {
  initialNumToRender: 12,
  maxToRenderPerBatch: 10,
  windowSize: 7,
  removeClippedSubviews: true,
  updateCellsBatchingPeriod: 50,
} as const;
