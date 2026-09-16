const SPOTLIGHT_PEOPLE = [
    { name: "Aditi Shukla", role: "Jr. BIM Architect, Techture", tag: "First Job" },
    { name: "Sanya Jain", role: "BIM Manager, Dar", tag: "120% Hike" },
    { name: "Om Prakash Ghuniyal", role: "BIM Architect, Aecom", tag: "60% Hike" },
];

export const Footer = () => {
    return (
        <footer className="mt-8 border-t border-secondary bg-success-primary/40">
            <div className="flex flex-wrap items-center gap-6 px-8 py-3">
                <span className="flex items-center gap-1.5 rounded-full border border-success-primary bg-primary px-3 py-1 text-xs font-semibold text-success-primary">+ Success Spotlight</span>
                {SPOTLIGHT_PEOPLE.map((p) => (
                    <span key={p.name} className="flex items-center gap-2 text-xs text-secondary">
                        <span className="font-semibold text-primary">{p.name}</span>
                        <span>{p.role}</span>
                        <span className="font-semibold text-brand-secondary">{p.tag}</span>
                    </span>
                ))}
            </div>
            <div className="flex flex-col gap-2 px-8 py-4 text-xs text-tertiary">
                <p>
                    Disclaimer: This portal is designed to assist students in their career journey by providing resources, guidance, and potential job opportunities. However, please note that
                    the use of this portal does not guarantee employment or placement. The success of placements depends on various market factors and individual qualifications and efforts.
                </p>
                <div className="flex items-center gap-4 font-medium text-primary">
                    <span>Privacy Policy</span>
                    <span>Terms of use</span>
                    <span className="font-normal text-quaternary">All Rights Reserved</span>
                    <span className="font-normal text-quaternary">©2023 Novatr Network Pvt. Ltd.</span>
                </div>
            </div>
        </footer>
    );
};
