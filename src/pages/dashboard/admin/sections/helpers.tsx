import type { Pharmacy } from "./types";

export function getPharmacyLocationLabel(pharmacy: Pharmacy): string {
  if (pharmacy.signupLocation?.trim()) return pharmacy.signupLocation;
  if (pharmacy.plannedBranchLocations?.length) {
    const firstPlanned = pharmacy.plannedBranchLocations[0]?.trim();
    if (firstPlanned) return firstPlanned;
  }
  if (pharmacy.address?.city && pharmacy.address?.country) {
    return `${pharmacy.address.city}, ${pharmacy.address.country}`;
  }
  if (pharmacy.address?.city) return pharmacy.address.city;
  return "Location not provided";
}

export function formatActionLabel(action: string) {
  return action
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function StatPill({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-border/50 px-3 py-2 bg-card/60">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}
