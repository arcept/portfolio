import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import type { Persona } from "@/types/role";

interface RoleContextType {
    persona: Persona;
    setPersona: (persona: Persona) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const usePersona = (): RoleContextType => {
    const context = useContext(RoleContext);

    if (context === undefined) {
        throw new Error("usePersona must be used within a RoleProvider");
    }

    return context;
};

/** Default persona is org-wide Admin — today's behavior stays the default with zero visual
 * change until someone switches via the "Preview as" control. */
const DEFAULT_PERSONA: Persona = { role: "admin" };

export const RoleProvider = ({ children, initialPersona }: { children: ReactNode; initialPersona?: Persona }) => {
    const [persona, setPersona] = useState<Persona>(initialPersona ?? DEFAULT_PERSONA);

    return <RoleContext.Provider value={{ persona, setPersona }}>{children}</RoleContext.Provider>;
};
