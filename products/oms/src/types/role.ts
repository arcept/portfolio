export type Role = "bdr" | "atl" | "tl" | "tm" | "admin";

/**
 * Role alone isn't enough to scope data — showing a Team Lead their own numbers requires
 * knowing *which* Team Lead. Each variant carries the full path down the org tree needed to
 * resolve that persona's slice.
 *
 * `atl` shares the `bdr` shape — it's a confirmed real permission tier (per prior OMS
 * research), but no distinct dashboard scope for it has ever surfaced. Scope it identically
 * to `bdr` everywhere until a distinct ATL view is specified.
 */
export type Persona =
    | { role: "admin" }
    | { role: "tm"; tmId: string }
    | { role: "tl"; tmId: string; tlId: string }
    | { role: "bdr" | "atl"; tmId: string; tlId: string; bdrId: string };

export const ROLE_LABELS: Record<Role, string> = {
    admin: "Admin",
    tm: "Team Manager",
    tl: "Team Lead",
    bdr: "BDR",
    atl: "ATL",
};
