/**
 * Static sample data for the Sales Head dashboard, lifted from the "Dashboard — Sales Head"
 * Figma frame (node 62:5, file i4hwfDcV60v0s0P9fZr8l6). No live data source yet.
 */

export const bookedTrend = [
    { day: 1, booked: 4, realised: 2 },
    { day: 4, booked: 9, realised: 5 },
    { day: 7, booked: 7, realised: 6 },
    { day: 10, booked: 14, realised: 8 },
    { day: 13, booked: 11, realised: 10 },
    { day: 16, booked: 18, realised: 12 },
    { day: 19, booked: 16, realised: 13 },
    { day: 22, booked: 22, realised: 15 },
    { day: 25, booked: 21, realised: 17 },
    { day: 28, booked: 26, realised: 19 },
    { day: 30, booked: 28, realised: 21 },
];

export const dealStages = [
    { label: "Application", value: 28, colorClassName: "bg-fg-brand-primary" },
    { label: "Offer", value: 12, colorClassName: "bg-fg-warning-primary" },
    { label: "Payment", value: 10, colorClassName: "bg-fg-error-secondary" },
    { label: "Completed", value: 12, colorClassName: "bg-fg-success-primary" },
    { label: "Not Interested", value: 6, colorClassName: "bg-fg-brand-secondary_hover" },
    { label: "Rejected", value: 2, colorClassName: "bg-fg-error-primary" },
] as const;

export const dealStagesMax = Math.max(...dealStages.map((stage) => stage.value));

export type FunnelBreakdownItem = {
    label: string;
    count: number;
    dotClassName: string;
};

export type FunnelStage = {
    label: string;
    fraction: string;
    value: number;
    denominator?: number;
    caption?: string;
    breakdown: FunnelBreakdownItem[];
};

export type FunnelCohort = {
    id: string;
    name: string;
    stages: [FunnelStage, FunnelStage, FunnelStage, FunnelStage];
};

const dot = {
    neutral: "text-fg-quaternary",
    warning: "text-fg-warning-primary",
    success: "text-fg-success-primary",
    error: "text-fg-error-primary",
    brand: "text-fg-brand-primary",
};

export const funnelCohorts: FunnelCohort[] = [
    {
        id: "aggregate",
        name: "ADMIN Funnel — Sales Head",
        stages: [
            {
                label: "Applications Sent",
                fraction: "1 / 4",
                value: 58,
                breakdown: [
                    { label: "Pending", count: 15, dotClassName: dot.neutral },
                    { label: "Expired", count: 2, dotClassName: dot.error },
                    { label: "Filled", count: 38, dotClassName: dot.success },
                    { label: "Not Interested / Rejected", count: 3, dotClassName: dot.neutral },
                ],
            },
            {
                label: "Offers Shared",
                fraction: "2 / 4",
                value: 27,
                denominator: 58,
                caption: "of Filled",
                breakdown: [
                    { label: "Pending", count: 4, dotClassName: dot.neutral },
                    { label: "Expired", count: 2, dotClassName: dot.error },
                    { label: "Accepted", count: 12, dotClassName: dot.success },
                    { label: "Not Interested / Rejected", count: 3, dotClassName: dot.neutral },
                ],
            },
            {
                label: "Converted",
                fraction: "3 / 4",
                value: 12,
                denominator: 27,
                caption: "of Offers Shared",
                breakdown: [
                    { label: "DP Not Paid", count: 6, dotClassName: dot.warning },
                    { label: "Payment Overdue", count: 0, dotClassName: dot.error },
                    { label: "Payment Cleared", count: 7, dotClassName: dot.success },
                    { label: "Not Interested / Rejected", count: 2, dotClassName: dot.neutral },
                ],
            },
            {
                label: "Payment Clearance",
                fraction: "4 / 4",
                value: 7,
                denominator: 12,
                caption: "of Converted",
                breakdown: [
                    { label: "Payment Completed", count: 7, dotClassName: dot.success },
                    { label: "Enrolment Cancelled", count: 0, dotClassName: dot.error },
                ],
            },
        ],
    },
    {
        id: "priya-nair",
        name: "Priya Nair — BIM · Architects",
        stages: [
            {
                label: "Applications Sent",
                fraction: "1 / 4",
                value: 16,
                breakdown: [
                    { label: "Pending", count: 3, dotClassName: dot.neutral },
                    { label: "Expired", count: 0, dotClassName: dot.error },
                    { label: "Filled", count: 13, dotClassName: dot.success },
                    { label: "Not Interested / Rejected", count: 0, dotClassName: dot.neutral },
                ],
            },
            {
                label: "Offers Shared",
                fraction: "2 / 4",
                value: 9,
                denominator: 16,
                caption: "of Filled",
                breakdown: [
                    { label: "Pending", count: 2, dotClassName: dot.neutral },
                    { label: "Expired", count: 0, dotClassName: dot.error },
                    { label: "Accepted", count: 5, dotClassName: dot.success },
                    { label: "Not Interested / Rejected", count: 0, dotClassName: dot.neutral },
                ],
            },
            {
                label: "Converted",
                fraction: "3 / 4",
                value: 5,
                denominator: 9,
                caption: "of Offers Shared",
                breakdown: [
                    { label: "DP Not Paid", count: 2, dotClassName: dot.warning },
                    { label: "Payment Overdue", count: 0, dotClassName: dot.error },
                    { label: "Payment Cleared", count: 2, dotClassName: dot.success },
                    { label: "Not Interested / Rejected", count: 0, dotClassName: dot.neutral },
                ],
            },
            {
                label: "Payment Clearance",
                fraction: "4 / 4",
                value: 2,
                denominator: 5,
                caption: "of Converted",
                breakdown: [
                    { label: "Payment Completed", count: 2, dotClassName: dot.success },
                    { label: "Enrolment Cancelled", count: 0, dotClassName: dot.error },
                ],
            },
        ],
    },
];

export type TeamManager = {
    id: string;
    name: string;
    amount: string;
    changePercent: string;
};

export const teamManagers: TeamManager[] = [
    { id: "priya-nair", name: "Priya Nair", amount: "₹5.98 L", changePercent: "0%" },
    { id: "arjun-mehta", name: "Arjun Mehta", amount: "₹2.40 L", changePercent: "0%" },
    { id: "kabir-sethi", name: "Kabir Sethi", amount: "₹3.19 L", changePercent: "0%" },
];

export const periodFilters = ["This Month", "Last Month", "This Quarter", "Last Quarter"] as const;
