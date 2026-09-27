/**
 * Site mark: the classical portico, drawn fine — the same drawing as the
 * relief on the 3D slab (Slab3D.tsx): low hollow pediment, thin architrave,
 * four slender columns with small capitals and bases, two thin steps.
 * Filled shapes on a 32-unit grid, square edges. Same drawing is used for
 * public/favicon.svg (keep the two in sync).
 */
export const MARK_PATH =
  // pediment (hollow, low pitch) — outer minus inner
  "M2.6 11.2 L16 4.6 L29.4 11.2 Z M5.6 10.1 L16 6.2 L26.4 10.1 Z " +
  // architrave
  "M3.8 12.2 H28.2 V13.4 H3.8 Z " +
  // columns (capital, shaft, base) at 6.6 / 12.87 / 19.13 / 25.4
  "M5.4 14.2 H7.8 V15 H5.4 Z M5.8 15 H7.4 V25.8 H5.8 Z M5.4 25.8 H7.8 V26.6 H5.4 Z " +
  "M11.67 14.2 H14.07 V15 H11.67 Z M12.07 15 H13.67 V25.8 H12.07 Z M11.67 25.8 H14.07 V26.6 H11.67 Z " +
  "M17.93 14.2 H20.33 V15 H17.93 Z M18.33 15 H19.93 V25.8 H18.33 Z M17.93 25.8 H20.33 V26.6 H17.93 Z " +
  "M24.2 14.2 H26.6 V15 H24.2 Z M24.6 15 H26.2 V25.8 H24.6 Z M24.2 25.8 H26.6 V26.6 H24.2 Z " +
  // two steps
  "M3.8 27.3 H28.2 V28.3 H3.8 Z M2 28.9 H30 V29.9 H2 Z";

export function Mark({
  className = "size-7",
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={`${className} shrink-0 text-primary`}
      fill="currentColor"
      fillRule="evenodd"
    >
      <path d={MARK_PATH} />
    </svg>
  );
}
