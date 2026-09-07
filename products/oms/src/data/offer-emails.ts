/**
 * The three production offer-letter emailers (Novatr — Offer Letter Emailers, authored
 * separately) resolved against a live `Deal` so Section 03 can preview and open the *exact*
 * email the learner would receive, instead of a generic mock. Ported verbatim — table layout,
 * inline CSS, merge tags — only the merge-tag substitution and asset URLs are wired up here.
 *
 * Deliberately not sent anywhere: this prototype has no ESP. `resolveOfferEmail` only ever
 * fills a template for on-screen preview.
 */

import earlyBirdHtml from "@/assets/emailers/novatr-offer-early-bird.html?raw";
import withoutScholarshipHtml from "@/assets/emailers/novatr-offer-without-scholarship.html?raw";
import withScholarshipHtml from "@/assets/emailers/novatr-offer-with-scholarship.html?raw";
import novatrLogo from "@/assets/emailers/novatr-logo.png";
import panelEarlyBird from "@/assets/emailers/panel-early-bird.jpg";
import panelRegular from "@/assets/emailers/panel-regular.jpg";
import panelScholarship from "@/assets/emailers/panel-scholarship.jpg";
import { bdrs } from "./dashboard-data";
import type { Deal, OfferTemplate } from "./deals-data";

const TEMPLATE_HTML: Record<string, string> = {
    "early-bird": earlyBirdHtml,
    "no-scholarship": withoutScholarshipHtml,
    "with-scholarship": withScholarshipHtml,
};

/** The exact `{{cdn_url}}/<file>` reference each template's markup uses, per the emailer's own
 * README — swapped for the real bundled asset URL rather than trying to fake a CDN host. */
const TEMPLATE_PANEL: Record<string, { file: string; src: string }> = {
    "early-bird": { file: "panel-early-bird.jpg", src: panelEarlyBird },
    "no-scholarship": { file: "panel-regular.jpg", src: panelRegular },
    "with-scholarship": { file: "panel-scholarship.jpg", src: panelScholarship },
};

function formatMoney(amount: number, currency: "INR" | "USD"): string {
    const symbol = currency === "INR" ? "₹" : "$";
    return `${symbol}${Math.round(amount).toLocaleString(currency === "INR" ? "en-IN" : "en-US")}`;
}

/** Spelled out per the emailer README ("Sat, 5 Sep 2026, 6:30 PM IST") rather than a live
 * countdown, which most mail clients strip. Pinned to 11:59 PM — the same convention
 * `ShareOfferDialog` already uses for this deadline — since the data model only carries a
 * calendar date, not a time of day. */
export function formatOfferExpiry(iso: string): string {
    const d = new Date(`${iso}T23:59:59`);
    const datePart = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    return `${datePart}, 11:59 PM IST`;
}

/** Resolves a template + deadline into ready-to-render email HTML for the given deal, or `null`
 * for an unknown template id. Takes `template`/`deadline` as explicit params (rather than always
 * reading `deal.offer`) so the offer-letter composer can preview the *currently selected*
 * template/deadline live, before either is saved to the deal. `now` is the app's frozen "today"
 * (`PROTOTYPE_TODAY`), used to derive the cohort start date the same way Section 01 does. */
export function renderOfferEmail(deal: Deal, template: OfferTemplate, deadline: string, now: Date): string | null {
    if (!TEMPLATE_HTML[template.id]) return null;

    const bdr = bdrs.find((b) => b.id === deal.bdrId);
    const counsellorName = bdr?.name ?? "your admissions counsellor";
    const counsellorSlug = counsellorName.toLowerCase().replace(/\s+/g, ".");
    const startDate = new Date(now.getTime() + 20 * 86_400_000); // matches Section 01's "Starts" date
    const discountPct = deal.courseFee ? Math.round((deal.discount / deal.courseFee) * 100) : 0;

    const tags: Record<string, string> = {
        first_name: deal.name.split(" ")[0],
        full_name: deal.name,
        // Matches the app's own "Application ID" convention (`deal.id`, e.g. "DL-2207") — every
        // MetaField labelled Application ID elsewhere in the app reads the same field, so this
        // identifier is one the BDR/learner can actually cross-reference against the deal.
        application_id: deal.id,
        course_name: deal.course.name,
        cohort_name: deal.cohort,
        cohort_start_date: startDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        offer_expiry_datetime: formatOfferExpiry(deadline),
        offer_letter_url: `https://learn.novatr.com/offer/${deal.applicationId}`,
        scholarship_amount: formatMoney(deal.discount, deal.currency),
        scholarship_percent: `${discountPct}%`,
        counsellor_name: counsellorName,
        counsellor_email: `${counsellorSlug}@novatr.com`,
        counsellor_phone: "+91 98765 43210",
        view_in_browser_url: "#",
        preferences_url: "#",
        unsubscribe_url: "#",
    };

    const panel = TEMPLATE_PANEL[template.id];
    let html = TEMPLATE_HTML[template.id]
        .split(`{{cdn_url}}/${panel.file}`)
        .join(panel.src)
        .split("{{cdn_url}}/novatr-logo.png")
        .join(novatrLogo);
    html = html.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => tags[key] ?? "");
    return html;
}

/** The deal's *persisted* offer letter (Section 03's preview/View modal) — `null` until a
 * letter has actually been created. */
export function resolveOfferEmail(deal: Deal, now: Date): string | null {
    if (!deal.offer.template || !deal.offer.deadline) return null;
    return renderOfferEmail(deal, deal.offer.template, deal.offer.deadline, now);
}
