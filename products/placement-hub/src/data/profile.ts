import recommenderArjunGupta from "@/assets/recommender-arjun-gupta.png";
import recommenderNanditaNair from "@/assets/recommender-nandita-nair.png";
import certificateBimCourse from "@/assets/certificate-bim-course.png";
import certificateCompletion from "@/assets/certificate-completion.png";
import certificateNovatr from "@/assets/certificate-novatr.png";

// Static content for the My Profile page — there's no real profile-editing workflow in this
// build (see profile-store.tsx), so this is fixture data matching the Figma handoff exactly,
// the same way src/data/learner.ts and src/data/jobs.ts are fixtures for their pages.

export interface SkillTag {
    label: string;
    /** Figma has two tints for these pills (a darker "primary" set and a lighter "secondary" set) with no stated meaning — reproduced as-is. */
    tone: "primary" | "secondary";
}

export const PROFILE = {
    name: "Manik Madaan",
    headline: "BIM Graduate at Novatr",
    experienceSummary: "Total years of work experience: 4 years",
    location: "Delhi, India",
    applauds: 20,
    recommendationCount: 2,
    about: [
        "I am an ambitious, hardworking rational human being who loves to be challenged in learning new things. Architecture, to me, is a multi-disciplinary subject that has helped me grow as a person and to view things with a different perspective.",
        "Through critical analysis and problem solving techniques, I intend to establish balance between the physical and the intangible aspects of design.",
    ],
    languages: "English, Hindi",
};

export const SKILL_TAGS: SkillTag[] = [
    { label: "Revit", tone: "primary" },
    { label: "BIM 360", tone: "primary" },
    { label: "Navisworks", tone: "primary" },
    { label: "AutoCAD", tone: "primary" },
    { label: "Dynamo", tone: "primary" },
    { label: "Primavera", tone: "primary" },
    { label: "Solibri", tone: "secondary" },
    { label: "Bluebeam Revu", tone: "secondary" },
    { label: "ArchiCad", tone: "secondary" },
    { label: "Tekla", tone: "secondary" },
];

export interface ProfessionalSkill {
    label: string;
    percent: number;
}

export const PROFESSIONAL_SKILLS: ProfessionalSkill[] = [
    { label: "Software", percent: 94 },
    { label: "Critical Design", percent: 72 },
    { label: "Collaboration", percent: 88 },
    { label: "Soft Skills", percent: 84 },
    { label: "Problem Solving", percent: 80 },
    { label: "Ownership", percent: 92 },
];

export interface WorkExperienceEntry {
    role: string;
    org: string;
    type: string;
    dateRange: string;
    duration: string;
    description?: string[];
    truncated?: boolean;
}

export const WORK_EXPERIENCE: WorkExperienceEntry[] = [
    { role: "Architect", org: "Jam Story", type: "Full Time", dateRange: "June 2013 - Present", duration: "1 year" },
    {
        role: "Summer Intern",
        org: "AICTE",
        type: "Internship",
        dateRange: "Jul 2022 - Aug 2022",
        duration: "2 months",
        description: [
            "Worked on several institutional campus projects for Symbiosis and VIT.",
            "Worked for the conceptualization of the ICFAI School of Architecture.",
            "Handled several competition projects for SAP - Bengaluru, BEL - Hyderabad, High court of Telangana, Telangana institute for arts and craft - Hyderabad.",
        ],
        truncated: true,
    },
    {
        role: "Architectural Intern",
        org: "Sikka Associates Architects",
        type: "Internship",
        dateRange: "Jan 2022 - Jun 2022",
        duration: "6 months",
        description: ["Worked on several institutional campus projects for Symbiosis and VIT.", "Worked for the conceptualization of the ICFAI School of Architecture."],
    },
];

export interface EducationEntry {
    school: string;
    program: string;
    dateRange: string;
}

export const EDUCATION: EducationEntry[] = [
    { school: "Indira Gandhi Delhi Technical University for Women", program: "Bachelor of Architecture", dateRange: "2018 - 2023" },
    { school: "Caramel Convent School - India", program: "High School Diploma", dateRange: "2011 - 2018" },
];

export interface CertificationEntry {
    title: string;
    issuer: string;
    issuedDate: string;
    thumbnails?: string[];
}

export const CERTIFICATIONS: CertificationEntry[] = [
    { title: "BIM Professional Course for Architects V2.0", issuer: "Novatr, India", issuedDate: "Issued Jan 2024", thumbnails: [certificateCompletion, certificateBimCourse, certificateNovatr] },
    { title: "Certified Architect", issuer: "Council Of Architecture, India", issuedDate: "Issued Nov 2023" },
    { title: "Earthquake Resistance Design Practices", issuer: "Indian Institute of Technology, Kanpur", issuedDate: "Issued Nov 2021" },
];

export interface PublicationEntry {
    title: string;
    source: string;
    date: string;
    linkLabel?: string;
}

export const PUBLICATIONS: PublicationEntry[] = [
    { title: "Psychological Impact of Environment on child's Emotional Quotient (EQ)", source: "International Journal of Engineering & Technology (UIET - SCOPUS)", date: "May, 2023", linkLabel: "Link to publication" },
    { title: "The New Normal of online learning: Problems and Solutions", source: "IOSR Journal of Research & Method in Education (IOSR-JRME)", date: "Jan, 2022" },
    { title: "An Empirical Investigation into the Origins and Causes of Variation Orders in Construction Projects", source: "International Research Journal of Engineering and Technology (IRJET)", date: "Jul, 2022" },
];

export interface AwardEntry {
    title: string;
    issuer: string;
    date: string;
}

export const AWARDS: AwardEntry[] = [
    { title: "Top 12 Finalists of the OAN Fellowship", issuer: "Issued by National Association of Students of Architecture, India", date: "May, 2023" },
    { title: "RSRI Best Manager - 2019", issuer: "Awarded by REST Society for Research International & Department of English and Other Foreign Languages", date: "June, 2024" },
];

export interface RecommendationEntry {
    name: string;
    title: string;
    avatarSrc: string;
    quote: string;
    date: string;
}

export const RECOMMENDATIONS: RecommendationEntry[] = [
    {
        name: "Arjun Gupta",
        title: "Founder & Architect at AM-arqstudio",
        avatarSrc: recommenderArjunGupta,
        quote: "I had the pleasure of working with John on a recent project at Novatr. He consistently impressed me with his strong understanding of BIM and Revit. His knowledge of AutoCAD was invaluable in ensuring the project met all requirements. John is a highly motivated and detail-oriented professional with a bright future in architecture.",
        date: "Jan 2024",
    },
    {
        name: "Nandita Nair",
        title: "Director Of Design And Development at Artact",
        avatarSrc: recommenderNanditaNair,
        quote: "John was an integral part of our team during his internship at Artact. He quickly grasped complex concepts and was always eager to learn and contribute. His collaborative spirit and positive attitude made him a pleasure to work with. John consistently met deadlines and produced high-quality work, exceeding expectations. I highly recommend him for any architectural position.",
        date: "Jun 2024",
    },
];

export const IMPORTANT_LINK_LABELS = ["Resume / CV", "Course Portfolio", "Work Portfolio", "Academic Portfolio"] as const;

export const INTERESTS = ["Sustainable Design", "Historic Preservation", "Sketching", "Design Analysis"];
