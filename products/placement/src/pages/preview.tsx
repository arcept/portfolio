import { useParams } from "react-router";
import { AppsList } from "@/screens/apps-list";
import { HomeAccessRestricted } from "@/screens/home-access-restricted";
import { HomeClosure } from "@/screens/home-closure";
import { HomeDisqualified } from "@/screens/home-disqualified";
import { HomeJobsNotApplied } from "@/screens/home";
import { HomePlaced } from "@/screens/home-placed";
import { HomeUpdates } from "@/screens/home-updates";
import { HubEligibleComplete } from "@/screens/hub-eligible-complete";
import { HubEligibleIncomplete } from "@/screens/hub-eligible-incomplete";
import { HubNotEligible } from "@/screens/hub-not-eligible";
import { JobDescription } from "@/screens/job-description";
import { JobsAll } from "@/screens/jobs-all";
import { PopupApplyConfirm, PopupApplyLocationMismatch, PopupApplyPolicyReminder, PopupApplySuccess } from "@/screens/popups/apply-flow";
import { PopupAcceptConfirm, PopupOfferAccepted1, PopupOfferAccepted2, PopupOfferAccepted3, PopupOfferAccepted4 } from "@/screens/popups/accept-offer-flow";
import { ConcernAck, ConcernForm } from "@/screens/popups/concern-flow";
import { SelfplacedForm } from "@/screens/selfplaced-form";
import { APPLICATION_FIXTURES } from "@/state/fixtures/applications";
import { AECOM_BIM_JOB, ALL_JOBS } from "@/state/fixtures/jobs";
import type { Application } from "@/state/learner-state";

const JOBS_BY_ID = Object.fromEntries(ALL_JOBS.map((j) => [j.id, j]));

const appWithStatus = (status: Application["status"], history: Application["status"][]): Application => ({ jobId: "aecom-bim", status, history });

// Dev-only screen-by-slug preview, used for fidelity screenshots against docs/placement/spec/screens/
// during the build (products/placement/CLAUDE.md's "Fidelity loop"). Not part of the shipped
// walkthrough/embed experience.
const SCREENS: Record<string, () => React.ReactElement> = {
    "hub-eligible-complete": () => <HubEligibleComplete />,
    "home-jobs-not-applied": () => <HomeJobsNotApplied />,
    "jobs-all": () => <JobsAll />,
    "jd-apply-48h": () => <JobDescription job={AECOM_BIM_JOB} />,
    "jd-t-shared": () => <JobDescription job={AECOM_BIM_JOB} application={appWithStatus("profile_shared", ["applied", "profile_shared"])} />,
    "jd-t-shortlisted": () => <JobDescription job={AECOM_BIM_JOB} application={appWithStatus("shortlisted", ["applied", "profile_shared", "shortlisted"])} />,
    "jd-t-interview": () => <JobDescription job={AECOM_BIM_JOB} application={appWithStatus("interview", ["applied", "profile_shared", "shortlisted", "interview"])} />,
    "jd-t-offer": () => <JobDescription job={AECOM_BIM_JOB} application={appWithStatus("offer_received", ["applied", "profile_shared", "shortlisted", "interview", "offer_received"])} />,
    "jd-t-accepted": () => <JobDescription job={AECOM_BIM_JOB} application={appWithStatus("accepted", ["applied", "profile_shared", "shortlisted", "interview", "offer_received", "accepted"])} />,
    "apps-list": () => <AppsList applications={APPLICATION_FIXTURES} jobsById={JOBS_BY_ID} />,
    "popup-apply-confirm": () => (
        <>
            <JobDescription job={AECOM_BIM_JOB} />
            <PopupApplyConfirm job={AECOM_BIM_JOB} />
        </>
    ),
    "popup-apply-location-mismatch": () => (
        <>
            <JobDescription job={AECOM_BIM_JOB} />
            <PopupApplyLocationMismatch job={AECOM_BIM_JOB} preferredLocation="Gurugram, India" />
        </>
    ),
    "popup-apply-policy-reminder": () => (
        <>
            <JobDescription job={AECOM_BIM_JOB} />
            <PopupApplyPolicyReminder job={AECOM_BIM_JOB} />
        </>
    ),
    "popup-apply-success": () => (
        <>
            <JobDescription job={AECOM_BIM_JOB} />
            <PopupApplySuccess />
        </>
    ),
    "popup-accept-confirm": () => (
        <>
            <JobDescription job={AECOM_BIM_JOB} application={appWithStatus("offer_received", ["applied", "profile_shared", "shortlisted", "interview", "offer_received"])} />
            <PopupAcceptConfirm job={AECOM_BIM_JOB} />
        </>
    ),
    "popup-offer-accepted-1": () => (
        <>
            <AppsList applications={APPLICATION_FIXTURES} jobsById={JOBS_BY_ID} />
            <PopupOfferAccepted1 job={AECOM_BIM_JOB} />
        </>
    ),
    "popup-offer-accepted-2": () => (
        <>
            <AppsList applications={APPLICATION_FIXTURES} jobsById={JOBS_BY_ID} />
            <PopupOfferAccepted2 job={AECOM_BIM_JOB} />
        </>
    ),
    "popup-offer-accepted-3": () => (
        <>
            <AppsList applications={APPLICATION_FIXTURES} jobsById={JOBS_BY_ID} />
            <PopupOfferAccepted3 job={AECOM_BIM_JOB} />
        </>
    ),
    "popup-offer-accepted-4": () => (
        <>
            <AppsList applications={APPLICATION_FIXTURES} jobsById={JOBS_BY_ID} />
            <PopupOfferAccepted4 job={AECOM_BIM_JOB} />
        </>
    ),
    "home-placed": () => <HomePlaced job={AECOM_BIM_JOB} />,

    // Scenario 02 — rejection + closure
    "jd-t-rej-interview": () => <JobDescription job={AECOM_BIM_JOB} application={appWithStatus("rejected_interview", ["applied", "profile_shared", "shortlisted", "interview", "rejected_interview"])} />,
    "home-updates-expanded": () => <HomeUpdates />,
    "jobs-relevant": () => <JobsAll />,
    "jd-irrelevant": () => <JobDescription job={AECOM_BIM_JOB} variant="irrelevant" />,
    "popup-query-form": () => (
        <>
            <JobDescription job={AECOM_BIM_JOB} variant="irrelevant" />
            <ConcernForm heading="Share your concerns regarding job relevancy here." />
        </>
    ),
    "popup-query-ack": () => (
        <>
            <JobDescription job={AECOM_BIM_JOB} variant="irrelevant" />
            <ConcernAck heading="We have noted your concern successfully!" body="The team will get back to you within 24 hrs. Keep track of your email for the team's response." />
        </>
    ),
    "home-closure": () => <HomeClosure />,

    // Scenario 03 — gate
    "hub-eligible-incomplete": () => <HubEligibleIncomplete />,
    "jd-profile-incomplete": () => <JobDescription job={AECOM_BIM_JOB} variant="profile_incomplete" />,
    "hub-not-eligible": () => <HubNotEligible />,
    "selfplaced-form": () => <SelfplacedForm />,

    // Scenario 04 — exit ladder
    "popup-offer-concern": () => (
        <>
            <JobDescription job={AECOM_BIM_JOB} application={appWithStatus("offer_received", ["applied", "profile_shared", "shortlisted", "interview", "offer_received"])} />
            <ConcernForm heading="Share your concerns regarding this job offer here." />
        </>
    ),
    "popup-offer-concern-ack": () => (
        <>
            <JobDescription job={AECOM_BIM_JOB} application={appWithStatus("offer_received", ["applied", "profile_shared", "shortlisted", "interview", "offer_received"])} />
            <ConcernAck heading="Thanks for sharing your concern!" body="We have received your message. Our support team will reach out to you within the next 24-48 hours." />
        </>
    ),
    "home-access-restricted": () => <HomeAccessRestricted />,
    "jd-t-disqualified-message": () => <JobDescription job={AECOM_BIM_JOB} application={appWithStatus("disqualified", ["applied", "profile_shared", "shortlisted", "interview", "disqualified"])} />,
    "home-disqualified": () => <HomeDisqualified />,
};

export const Preview = () => {
    const { slug } = useParams<{ slug: string }>();
    const Screen = slug ? SCREENS[slug] : undefined;

    if (!Screen) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-secondary p-8 text-sm text-tertiary">
                Unknown preview slug. Available: {Object.keys(SCREENS).join(", ")}
            </div>
        );
    }

    return <Screen />;
};
