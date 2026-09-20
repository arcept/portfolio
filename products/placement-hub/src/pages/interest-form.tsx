import { ArrowNarrowRight, Check, ChevronLeft, InfoCircle } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Checkbox as AriaCheckbox } from "react-aria-components";
import formIllustration from "@/assets/interest-form-illustration.png";
import { AppShell } from "@/components/app-shell";
import { FieldRenderer } from "@/components/interest-form/field-renderer";
import { QuestionBlock } from "@/components/interest-form/question-block";
import { SubmittedCard } from "@/components/interest-form/submitted-card";
import type { NavTab } from "@/components/navbar";
import { interestFormStore, useInterestFormSubmission } from "@/data/interest-form-store";
import {
    SECTIONS,
    cascadeReset,
    getProgress,
    isQuestion,
    isQuestionComplete,
    isQuestionVisible,
    resolveText,
    validateForm,
    visibleFields,
    visibleQuestions,
} from "@/lib/interest-form";
import type { Question, Section } from "@/lib/interest-form";
import type { FieldId, InterestFormValues } from "@/types/interest-form";
import { cx } from "@/utils/cx";

// Same rise-in as the other pages' blocks.
const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const blockVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } } };

// A question that appears or disappears (because of an earlier answer) grows/collapses into place
// instead of popping, so the learner sees *why* the form just got longer or shorter.
const revealMotion = {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1, transition: { height: { type: "spring" as const, stiffness: 300, damping: 34 }, opacity: { duration: 0.25, delay: 0.05 } } },
    exit: { height: 0, opacity: 0, transition: { duration: 0.18 } },
};

interface InterestFormProps {
    onBack: () => void;
    onNavigate: (tab: NavTab) => void;
    onNavigateProfile: () => void;
    onNavigateJob?: (jobId: string) => void;
}

const SectionBadge = ({ index, complete }: { index: number; complete: boolean }) => (
    <span
        className={cx(
            "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors duration-300",
            complete ? "border-success-500 bg-success-500 text-white" : "border-gray-200 bg-white text-gray-500",
        )}
    >
        {complete ? <Check className="size-4" strokeWidth={3} /> : index + 1}
    </span>
);

export const InterestForm = ({ onBack, onNavigate, onNavigateProfile, onNavigateJob }: InterestFormProps) => {
    const submission = useInterestFormSubmission();
    const [editing, setEditing] = useState(false);
    const [values, setValues] = useState<InterestFormValues>(() => interestFormStore.getSnapshot().draft);
    const [touched, setTouched] = useState<ReadonlySet<FieldId>>(new Set());
    // Fields that had an error when the learner last pressed Submit. Questions revealed *after* that
    // (by answering something else) stay calm until touched or the next submit, instead of turning
    // red before the learner has even seen them.
    const [flagged, setFlagged] = useState<ReadonlySet<FieldId>>(new Set());

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const errors = useMemo(() => validateForm(values), [values]);
    const progress = useMemo(() => getProgress(values), [values]);

    // Questions renumber as conditionals come and go: 1..N over whatever is visible right now.
    const numbers = useMemo(() => {
        const map = new Map<string, number>();
        let n = 0;
        for (const section of SECTIONS) for (const q of visibleQuestions(section, values)) map.set(q.id, ++n);
        return map;
    }, [values]);

    const change = (id: FieldId, value: string | string[]) => {
        const next = { ...values, [id]: value } as InterestFormValues;
        Object.assign(next, cascadeReset(id, next));
        setValues(next);
        interestFormStore.saveDraft(next);
    };

    const touch = (id: FieldId) => setTouched((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

    // An error is only shown once the learner has left that field or submitted with it unresolved —
    // not while they're still on their way to answering it.
    const shownError = (id: FieldId) => (flagged.has(id) || touched.has(id) ? errors[id] : undefined);

    const isSectionComplete = (section: Section) => {
        const questions = visibleQuestions(section, values);
        return questions.length > 0 && questions.every((q) => isQuestionComplete(q, values));
    };

    const focusFirstError = () => {
        const firstQuestion = SECTIONS.flatMap((s) => visibleQuestions(s, values)).find((q) => visibleFields(q, values).some((f) => errors[f.id]));
        const target = firstQuestion ? document.getElementById(`q-${firstQuestion.id}`) : document.getElementById("consent");
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => target?.querySelector<HTMLElement>("input, button, [role=radio], [role=checkbox]")?.focus({ preventScroll: true }), 350);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (Object.keys(errors).length > 0) {
            setFlagged(new Set(Object.keys(errors) as FieldId[]));
            focusFirstError();
            return;
        }
        interestFormStore.submit(values);
        setEditing(false);
        setFlagged(new Set());
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const showSummary = !!submission && !editing;
    const remaining = progress.total - progress.done;

    const renderQuestion = (q: Question) => {
        const fields = visibleFields(q, values);
        const error = fields.map((f) => shownError(f.id)).find(Boolean);
        return (
            <QuestionBlock
                id={q.id}
                number={numbers.get(q.id) ?? 0}
                label={resolveText(q.label, values) ?? ""}
                hint={resolveText(q.hint, values)}
                warning={q.warning?.(values)}
                error={error}
            >
                <div className={cx(q.fieldColumns === 2 ? "grid grid-cols-2 gap-x-4 gap-y-3 max-md:grid-cols-1" : "flex flex-col gap-3")}>
                    {fields.map((field, i) => (
                        <FieldRenderer key={`${field.id}-${field.kind}-${i}`} field={field} values={values} error={shownError(field.id)} labelledBy={`q-${q.id}-label`} onChange={change} onTouch={touch} />
                    ))}
                </div>
            </QuestionBlock>
        );
    };

    return (
        <AppShell active={null} direction={1} showTabs={false} onNavigate={onNavigate} onNavigateProfile={onNavigateProfile} onNavigateJob={onNavigateJob}>
            <motion.div className="flex w-full flex-col items-start gap-6" variants={containerVariants} initial="hidden" animate="show">
                <motion.div variants={blockVariants} className="flex w-full items-center">
                    <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-lg px-2 py-1 text-base font-semibold text-gray-cool-900 hover:bg-gray-50">
                        <ChevronLeft className="size-6" />
                        Back to Home Page
                    </button>
                </motion.div>

                <motion.div variants={blockVariants} className="flex w-full items-center gap-6 px-2 py-4 max-md:gap-3">
                    <div className="flex flex-1 flex-col gap-2">
                        <p className="text-2xl leading-8 font-semibold text-gray-cool-900">Hi Manik Madaan</p>
                        <p className="text-2xl leading-8 font-semibold text-blue-dark-700 max-md:text-xl max-md:leading-7">Your answers will help us capture your requirements and understand your placement needs better.</p>
                        <p className="py-2 text-sm text-gray-600">
                            <span className="font-semibold">Disclaimer:</span> Please note that filling out this form does not guarantee a job. It's a step towards unlocking our placement assistance
                            services with Novatr.
                        </p>
                    </div>
                    <img src={formIllustration} alt="" className="h-[120px] w-[160px] shrink-0 object-contain max-md:hidden" />
                </motion.div>

                <motion.div variants={blockVariants} className="w-full">
                    {showSummary ? (
                        <SubmittedCard submission={submission} onBackHome={onBack} onEdit={() => setEditing(true)} />
                    ) : (
                        <form noValidate onSubmit={handleSubmit} className="flex w-full flex-col gap-8 rounded-xs bg-white px-8 py-8 max-md:gap-6 max-md:px-4 max-md:py-6">
                            {/* Pinned under the top bar (78px tall; on phones the top bar scrolls away, so 0) so
                                the learner always sees how far along they are. Bleeds to the card edges. */}
                            <div className="sticky top-[78px] z-[5] -mx-8 -mt-8 flex items-center gap-4 rounded-t-xs border-b border-gray-100 bg-white px-8 py-4 max-md:top-0 max-md:-mx-4 max-md:-mt-6 max-md:px-4 max-md:py-3">
                                <p className="shrink-0 text-sm font-semibold text-gray-700">
                                    {progress.done} of {progress.total} answered
                                </p>
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                                    <motion.div className="h-full rounded-full bg-blue-dark-600" initial={false} animate={{ width: `${(progress.done / progress.total) * 100}%` }} transition={{ type: "spring", stiffness: 200, damping: 30 }} />
                                </div>
                                <p className="shrink-0 text-sm text-gray-500 max-md:hidden">About 3 minutes</p>
                            </div>

                            <div className="flex w-full flex-col">
                                {SECTIONS.map((section, index) => {
                                    const items = section.items.filter((item) => (isQuestion(item) ? isQuestionVisible(item, values) : item.visible(values)));
                                    return (
                                        <section key={section.id} className={cx("flex flex-col", index > 0 && "mt-4 border-t border-gray-100 pt-8")}>
                                            <div className="flex items-start gap-4 pb-6">
                                                <SectionBadge index={index} complete={isSectionComplete(section)} />
                                                <div className="flex flex-col gap-0.5">
                                                    <h2 className="text-xl leading-8 font-semibold text-gray-cool-900">{section.title}</h2>
                                                    <p className="text-sm text-gray-500">{section.description}</p>
                                                </div>
                                            </div>

                                            <div className="min-w-0">

                                                <div className="-mx-1 grid grid-cols-2 gap-x-4 max-md:grid-cols-1">
                                                    <AnimatePresence initial={false}>
                                                        {items.map((item) => (
                                                            <motion.div key={item.id} {...revealMotion} className={cx("overflow-hidden px-1", isQuestion(item) && item.width === "half" ? "col-span-1" : "col-span-2", "max-md:col-span-1")}>
                                                                <div className="pt-1 pb-7">
                                                                    {isQuestion(item) ? (
                                                                        renderQuestion(item)
                                                                    ) : (
                                                                        <p className="flex items-start gap-2 rounded-xs border border-blue-dark-200 bg-blue-dark-50 px-4 py-3 text-sm font-medium text-blue-dark-800">
                                                                            <InfoCircle className="mt-0.5 size-4 shrink-0" />
                                                                            {item.text(values)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </section>
                                    );
                                })}
                            </div>

                            <div className="flex w-full flex-col gap-6 border-t border-gray-100 pt-8">
                                <div id="consent" className="flex flex-col gap-2">
                                    <AriaCheckbox
                                        isSelected={values.consent}
                                        onChange={(checked) => {
                                            const next = { ...values, consent: checked };
                                            setValues(next);
                                            interestFormStore.saveDraft(next);
                                        }}
                                        className="group flex cursor-pointer items-start gap-3 outline-none"
                                    >
                                        {({ isSelected, isFocusVisible }) => (
                                            <>
                                                <span
                                                    className={cx(
                                                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors",
                                                        isSelected ? "border-purple-800 bg-purple-800" : flagged.has("consent") && errors.consent ? "border-error-600 bg-white" : "border-gray-400 bg-white",
                                                        isFocusVisible && "ring-4 ring-purple-100",
                                                    )}
                                                >
                                                    {isSelected && <Check className="size-3.5 text-white" strokeWidth={3} />}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    I agree to my details being used to assess my eligibility and tailor the placement assistance services. I understand this information may be shared with
                                                    relevant hiring partners for potential employment opportunities.
                                                </span>
                                            </>
                                        )}
                                    </AriaCheckbox>
                                    {flagged.has("consent") && errors.consent && <p role="alert" className="pl-8 text-sm font-medium text-error-600">{errors.consent}</p>}
                                </div>

                                <div className="flex w-full items-center gap-4 max-md:flex-wrap">
                                    <button type="submit" className="flex items-center justify-center gap-2 max-md:w-full rounded-xs bg-purple-800 px-8 py-3 text-base font-semibold text-white hover:bg-purple-700">
                                        {submission ? "Save changes" : "Submit Form"}
                                        <ArrowNarrowRight className="size-4" />
                                    </button>
                                    {submission && (
                                        <button type="button" onClick={() => setEditing(false)} className="rounded-xs border border-purple-200 bg-white px-6 py-3 text-base font-semibold text-purple-800 hover:bg-purple-25">
                                            Cancel
                                        </button>
                                    )}
                                    {flagged.size > 0 && remaining > 0 && (
                                        <p role="status" className="text-sm font-medium text-error-600">
                                            {remaining === 1 ? "1 question still needs an answer" : `${remaining} questions still need an answer`}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex w-full flex-col gap-4 border-t border-gray-100 pt-6">
                                <p className="text-sm font-semibold text-gray-800">Thank you for taking the time to provide your details.</p>
                                <p className="text-sm text-gray-600">
                                    Your career success matters to us. Remember, this form is a preliminary step to gauge interest and does not guarantee a job.
                                </p>
                            </div>
                        </form>
                    )}
                </motion.div>
            </motion.div>
        </AppShell>
    );
};
