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
import { PopupAcceptConfirm, PopupOfferAccepted1, PopupOfferAccepted2, PopupOfferAccepted3, PopupOfferAccepted4 } from "@/screens/popups/accept-offer-flow";
import { PopupApplyConfirm, PopupApplyLocationMismatch, PopupApplyPolicyReminder, PopupApplySuccess } from "@/screens/popups/apply-flow";
import { ConcernAck, ConcernForm } from "@/screens/popups/concern-flow";
import { SelfplacedForm } from "@/screens/selfplaced-form";
import { LearnerHubGraduatePopup } from "@/screens/learner-hub-graduate-popup";
import { ALL_JOBS, AECOM_BIM_JOB } from "@/state/fixtures/jobs";
import type { LearnerState } from "@/state/learner-state";

const JOBS_BY_ID = Object.fromEntries(ALL_JOBS.map((j) => [j.id, j]));

const findApplication = (state: LearnerState) => state.applications.find((a) => a.jobId === AECOM_BIM_JOB.id);

// Every scenario step names a screen slug (docs/placement/spec/screen-map.md). This resolves that
// slug against the LIVE LearnerState at that step, rather than the hand-picked fixture props
// pages/preview.tsx uses — this is what "screens are pure functions of LearnerState" means in
// practice for the walkthrough. Popup slugs are resolved separately (see resolvePopup below) and
// layered over the last non-popup page (see scenarios/popup-slugs.ts).
export const resolvePageScreen = (slug: string, state: LearnerState): React.ReactElement | null => {
    const application = findApplication(state);

    switch (slug) {
        case "lh-graduate-popup":
            return <LearnerHubGraduatePopup />;
        case "hub-eligible-complete":
            return <HubEligibleComplete />;
        case "hub-eligible-incomplete":
            return <HubEligibleIncomplete />;
        case "hub-not-eligible":
            return <HubNotEligible />;
        case "home-jobs-not-applied":
            return <HomeJobsNotApplied />;
        case "home-updates-expanded":
            return <HomeUpdates />;
        case "home-closure":
            return <HomeClosure />;
        case "home-access-restricted":
            return <HomeAccessRestricted />;
        case "home-disqualified":
            return <HomeDisqualified />;
        case "home-placed":
            return <HomePlaced job={AECOM_BIM_JOB} />;
        case "jobs-all":
        case "jobs-relevant":
            return <JobsAll />;
        case "selfplaced-form":
            return <SelfplacedForm />;
        case "apps-list":
            return <AppsList applications={state.applications} jobsById={JOBS_BY_ID} />;
        case "jd-apply-48h":
            return <JobDescription job={AECOM_BIM_JOB} />;
        case "jd-irrelevant":
            return <JobDescription job={AECOM_BIM_JOB} variant="irrelevant" />;
        case "jd-profile-incomplete":
            return <JobDescription job={AECOM_BIM_JOB} variant="profile_incomplete" />;
        case "jd-t-shared":
        case "jd-t-shortlisted":
        case "jd-t-interview":
        case "jd-t-offer":
        case "jd-t-accepted":
        case "jd-t-rej-interview":
        case "jd-t-disqualified-message":
            return <JobDescription job={AECOM_BIM_JOB} application={application} />;
        default:
            return null;
    }
};

export const resolvePopup = (slug: string, state: LearnerState): React.ReactElement | null => {
    switch (slug) {
        case "popup-apply-confirm":
            return <PopupApplyConfirm job={AECOM_BIM_JOB} />;
        case "popup-apply-location-mismatch":
            return <PopupApplyLocationMismatch job={AECOM_BIM_JOB} preferredLocation={state.preferredLocation} />;
        case "popup-apply-policy-reminder":
            return <PopupApplyPolicyReminder job={AECOM_BIM_JOB} />;
        case "popup-apply-success":
            return <PopupApplySuccess />;
        case "popup-accept-confirm":
            return <PopupAcceptConfirm job={AECOM_BIM_JOB} />;
        case "popup-offer-accepted-1":
            return <PopupOfferAccepted1 job={AECOM_BIM_JOB} />;
        case "popup-offer-accepted-2":
            return <PopupOfferAccepted2 job={AECOM_BIM_JOB} />;
        case "popup-offer-accepted-3":
            return <PopupOfferAccepted3 job={AECOM_BIM_JOB} />;
        case "popup-offer-accepted-4":
            return <PopupOfferAccepted4 job={AECOM_BIM_JOB} />;
        case "popup-query-form":
            return <ConcernForm heading="Share your concerns regarding job relevancy here." />;
        case "popup-query-ack":
            return <ConcernAck heading="We have noted your concern successfully!" body="The team will get back to you within 24 hrs. Keep track of your email for the team's response." />;
        case "popup-offer-concern":
            return <ConcernForm heading="Share your concerns regarding this job offer here." />;
        case "popup-offer-concern-ack":
            return <ConcernAck heading="Thanks for sharing your concern!" body="We have received your message. Our support team will reach out to you within the next 24-48 hours." />;
        default:
            return null;
    }
};
