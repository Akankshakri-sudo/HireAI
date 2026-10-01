// Single source of truth for enum values shared across pages/components.
// Must stay in sync with the backend:
//   - employment types: backend/app/modules/jobs/schemas.py (default "full-time")
//   - application statuses: backend/app/modules/applications/models.py (APPLICATION_STATUSES)

export const EMPLOYMENT_TYPES = [
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Contract", value: "contract" },
  { label: "Internship", value: "internship" },
];

export const APPLICATION_STATUSES = [
  "applied",
  "reviewing",
  "shortlisted",
  "interview",
  "hired",
  "rejected",
];

// Ordered pipeline shown in progress timelines (rejected is handled separately).
export const APPLICATION_TIMELINE_STEPS = [
  "applied",
  "reviewing",
  "shortlisted",
  "interview",
  "hired",
];
