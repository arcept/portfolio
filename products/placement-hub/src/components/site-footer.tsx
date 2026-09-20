const SPOTLIGHT_PEOPLE = [
    { name: "Aditi Shukla", role: "Jr. BIM Architect, Techture", tag: "First Job" },
    { name: "Sanya Jain", role: "BIM Manager, Dar", tag: "120% Hike" },
    { name: "Om Prakash Ghuniyal", role: "BIM Architect, Aecom", tag: "60% Hike" },
];

export const SiteFooter = () => (
    <footer className="mt-8 flex w-full flex-col border-t border-gray-100 bg-green-50/40">
        <div className="flex flex-wrap items-center gap-6 px-[120px] py-3 max-xl:px-8 max-md:flex-col max-md:items-start max-md:gap-2 max-md:px-4">
            <span className="flex items-center gap-1.5 rounded-full border border-success-500 bg-white px-3 py-1 text-xs font-semibold text-success-600">+ Success Spotlight</span>
            {SPOTLIGHT_PEOPLE.map((p) => (
                <span key={p.name} className="flex items-center gap-2 text-xs text-gray-700 max-md:flex-wrap">
                    <span className="font-semibold text-gray-900">{p.name}</span>
                    <span>{p.role}</span>
                    <span className="font-semibold text-purple-700">{p.tag}</span>
                </span>
            ))}
        </div>
        <div className="flex flex-col gap-2 px-[120px] py-4 text-xs text-gray-600 max-xl:px-8 max-md:px-4">
            <p>
                Disclaimer: This portal is designed to assist students in their career journey by providing resources, guidance, and potential job opportunities. However, please note that the use
                of this portal does not guarantee employment or placement. The success of placements depends on various market factors and individual qualifications and efforts.
            </p>
            <div className="flex items-center gap-4 font-medium text-gray-900 max-md:flex-wrap max-md:gap-x-4 max-md:gap-y-1">
                <span>Privacy Policy</span>
                <span>Terms of use</span>
                <span className="font-normal text-gray-400">All Rights Reserved</span>
                <span className="font-normal text-gray-400">©2023 Novatr Network Pvt. Ltd.</span>
            </div>
        </div>
    </footer>
);
