import type { LogoTreatment } from "@/types/job";

export interface Company {
    name: string;
    logoSrc?: string;
    logoTreatment: LogoTreatment;
    description: string;
    website: string;
    industry: string;
    companySize: string;
    headquarters: string;
    type: string;
    specialties: string;
}
