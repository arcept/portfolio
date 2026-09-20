import { COMPANIES } from "@/data/companies";

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex w-full items-center gap-2 text-sm">
        <p className="w-32 shrink-0 text-gray-500 max-md:w-28">{label}</p>
        <p className="min-w-0 font-semibold text-black [overflow-wrap:anywhere]">{value}</p>
    </div>
);

export const CompanyAboutCard = ({ companyName }: { companyName: string }) => {
    const company = COMPANIES[companyName];
    if (!company) return null;

    return (
        <div className="flex w-full flex-col gap-8 rounded-2xl border border-gray-200 px-6 py-8">
            <p className="text-base font-semibold text-gray-900">About the Company</p>

            <div className="flex w-full flex-col gap-4">
                <div className="flex items-center gap-3">
                    {company.logoSrc && (
                        <span className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${company.logoTreatment === "light-circle" ? "bg-gray-200" : "bg-gray-700"}`}>
                            <img src={company.logoSrc} alt="" className={`size-full ${company.logoTreatment === "light-circle" ? "object-contain" : "object-cover"}`} />
                        </span>
                    )}
                    <p className="text-xl font-bold text-black">{company.name}</p>
                </div>
                <p className="text-sm text-gray-700">{company.description}</p>
            </div>

            <div className="flex w-full flex-col gap-2">
                <InfoRow label="Website" value={company.website} />
                <InfoRow label="Industry" value={company.industry} />
                <InfoRow label="Company Size" value={company.companySize} />
                <InfoRow label="Headquarters" value={company.headquarters} />
                <InfoRow label="Type" value={company.type} />
                <InfoRow label="Specialties" value={company.specialties} />
            </div>
        </div>
    );
};
