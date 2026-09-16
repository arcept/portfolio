// Scaffold placeholder — replaced once state, fixtures, product components and the chrome
// (device frame, chapter rail, step controls) exist. Renders now just to prove the build,
// routing and token setup work end to end.
export const Walkthrough = () => {
    return (
        <div className="chrome flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="font-mono text-xs tracking-wide text-[var(--ink-3)] uppercase">Placement Hub — scaffold</p>
            <h1 className="max-w-md text-3xl leading-tight font-medium text-[var(--ink)]" style={{ fontFamily: "var(--serif)" }}>
                Chrome shell is wired up. Product screens come next.
            </h1>
            <p className="max-w-sm text-sm text-[var(--ink-2)]">Newsreader for this heading, Archivo for this body copy, IBM Plex Mono for the label above.</p>
        </div>
    );
};
