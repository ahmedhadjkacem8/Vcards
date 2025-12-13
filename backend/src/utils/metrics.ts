// Simple in-memory metrics collector. Replace with real metrics (Prometheus, etc.) if needed.
const metrics: { mapsResolveFailures: number } = {
  mapsResolveFailures: 0,
};

export function incrementMapsResolveFailures(count = 1) {
  metrics.mapsResolveFailures += count;
}

export function getMetrics() {
  return { ...metrics };
}

export default { incrementMapsResolveFailures, getMetrics };
