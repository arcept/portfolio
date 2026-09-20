import aecom from "@/assets/Logos/AECOM.png";
import atkins from "@/assets/Logos/ATKINS.png";
import cowi from "@/assets/Logos/COWI.png";
import dsr from "@/assets/Logos/DS+R.png";
import foster from "@/assets/Logos/Foster + Partners.png";
import gensler from "@/assets/Logos/Gensler.png";
import jacobs from "@/assets/Logos/Jacobs.png";
import snohetta from "@/assets/Logos/Snohetta.png";
import uns from "@/assets/Logos/UNS.png";
import zha from "@/assets/Logos/ZHA.png";

// The one place a company's logo is chosen. Everything that shows a logo (jobs, company profiles,
// notifications) looks it up here by company name, so a company can never end up with different
// logos in different places — which is what used to happen when each job imported its own file.
//
// Source files live in src/assets/Logos (square 400px PNGs with the brand colour baked into the
// tile). Every surface crops them into a circle; `logoTreatment` only picks how the tile is fitted
// inside it (cropped to fill, or contained with a grey backdrop).
export const COMPANY_LOGOS = {
    // Companies that currently have jobs on the board
    "AECOM Architects": aecom,
    "United Network Studio": uns,
    "Zaha Hadid Architects": zha,
    Gensler: gensler,
    "Diller Scofidio + Renfro": dsr,
    "Foster + Partners": foster,
    "Snohetta Architects": snohetta,

    // Ready for later — no jobs or applications from these companies exist yet
    Atkins: atkins,
    COWI: cowi,
    Jacobs: jacobs,
} as const;

export type CompanyName = keyof typeof COMPANY_LOGOS;
