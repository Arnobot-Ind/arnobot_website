/** Hiring steps an applicant moves through, in order. A null stage means "Applied". */
export const STAGES = ["Applied", "Test done", "Shortlisted", "Interview", "Offer sent", "Joined"] as const;
export type Stage = (typeof STAGES)[number];
