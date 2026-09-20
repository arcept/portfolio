export type DeadlineUrgency = "calm" | "warning" | "urgent";

// > 24h left reads as calm (green), 12-24h as a heads-up (orange), and < 12h as genuinely
// urgent (red) — the same three tiers apply wherever a deadline countdown is shown (the job
// card and the job description page's CTA tab).
export const getDeadlineUrgency = (hoursLeft: number): DeadlineUrgency => {
    if (hoursLeft < 12) return "urgent";
    if (hoursLeft <= 24) return "warning";
    return "calm";
};
