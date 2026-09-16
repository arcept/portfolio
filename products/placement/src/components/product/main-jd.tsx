import type { ReactNode } from "react";
import type { Job } from "@/state/learner-state";

interface MainJdProps {
    job: Job;
    topRight?: ReactNode;
    /** The colored banner under the header (tracker messages, offer CTAs, etc). */
    messageBanner?: ReactNode;
    /** The orange/black CTA bar shown for pre-application states (Apply Now, Expired, ...). */
    ctaBar?: ReactNode;
    postedDaysAgo?: number;
}

const CompanyLogo = ({ company }: { company: string }) => (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">{company.charAt(0)}</span>
);

// Shared "Main JD" body used by every jd-* screen (components.md: node 4741:110616). Screens
// compose it with different topRight badges / messageBanner / ctaBar per state — see screens/jd-*.
export const MainJd = ({ job, topRight, messageBanner, ctaBar, postedDaysAgo = 1 }: MainJdProps) => {
    return (
        <>
            <div className="rounded-2xl border border-secondary bg-primary p-6">
                <p className="text-xs text-quaternary">Posted {postedDaysAgo}d ago</p>
                <div className="mt-2 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <CompanyLogo company={job.company} />
                        <div>
                            <h2 className="text-xl font-semibold text-primary">{job.company}</h2>
                            <p className="text-sm text-tertiary">{job.role}</p>
                        </div>
                    </div>
                    {topRight}
                </div>

                <div className="mt-4 flex items-center gap-6 border-t border-secondary pt-4 text-sm text-tertiary">
                    <span>
                        Degree <span className="font-medium text-secondary">{job.degree}</span>
                    </span>
                    <span>
                        Experience <span className="font-medium text-secondary">{job.experience}</span>
                    </span>
                    <span>
                        Location <span className="font-medium text-secondary">{job.location}</span> · {job.workType}
                    </span>
                </div>

                {messageBanner}
                {ctaBar}

                <div className="mt-6 flex flex-col gap-6">
                    <div>
                        <h3 className="mb-2 text-base font-semibold text-primary">About the Job</h3>
                        <p className="text-sm text-tertiary">
                            As an Arcadian, you already help us deliver world leading sustainable design, engineering, and consultancy solutions for natural and built assets. You are part of our
                            global business comprising 36,000 people, in over 70 countries, dedicated to improving quality of life.
                        </p>
                    </div>
                    <div>
                        <h3 className="mb-2 text-base font-semibold text-primary">Role Accountabilities</h3>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-tertiary">
                            <li>Gaining experience/skill in modelling/drafting of electrical systems in substation and high voltage installations to either Australian Standards and/or other international design standards.</li>
                            <li>Prepare technical drawings, plans and designs for high voltage installations drawings including electrical schematics, plans, detail and assembly drawings, general arrangement, sub-assembly and component drawings).</li>
                            <li>Self-checking of own work and following Arcadis systems and processes.</li>
                            <li>Continually improving the delivery of project through standardisation</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-2 text-base font-semibold text-primary">Important Information</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                            <div>
                                <p className="text-tertiary">Seniority Level</p>
                                <p className="font-medium text-primary">Entry Level</p>
                            </div>
                            <div>
                                <p className="text-tertiary">Employment Type</p>
                                <p className="font-medium text-primary">Full Time</p>
                            </div>
                            <div>
                                <p className="text-tertiary">Job Functions</p>
                                <p className="font-medium text-primary">Design, Consulting, Engineering and Site visits</p>
                            </div>
                            <div>
                                <p className="text-tertiary">Industries</p>
                                <p className="font-medium text-primary">Construction, Civil Engineering, Design Consultancy</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-secondary bg-primary p-6">
                <h3 className="mb-4 text-base font-semibold text-primary">About the Company</h3>
                <div className="flex items-center gap-3">
                    <CompanyLogo company={job.company} />
                    <h4 className="text-lg font-semibold text-primary">{job.company}</h4>
                </div>
                <p className="mt-3 text-sm text-tertiary">
                    Arcadis is the world's leading company delivering sustainable design, engineering, digital and consultancy solutions for natural and built assets. We are more than 36,000
                    architects, data analysts, designers, engineers, project planners, water management and sustainability experts, all driven by our passion for improving quality of life.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <div>
                        <p className="text-tertiary">Website</p>
                        <p className="font-medium text-brand-secondary underline">https://www.aecomarchitects.com</p>
                    </div>
                    <div>
                        <p className="text-tertiary">Industry</p>
                        <p className="font-medium text-primary">Professional Services</p>
                    </div>
                    <div>
                        <p className="text-tertiary">Company Size</p>
                        <p className="font-medium text-primary">10,001+ Employees</p>
                    </div>
                    <div>
                        <p className="text-tertiary">Headquarters</p>
                        <p className="font-medium text-primary">Amsterdam, Netherlands</p>
                    </div>
                    <div>
                        <p className="text-tertiary">Type</p>
                        <p className="font-medium text-primary">Public Company</p>
                    </div>
                </div>
            </div>
        </>
    );
};
