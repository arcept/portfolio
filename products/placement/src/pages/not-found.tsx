export const NotFound = () => {
    return (
        <div className="chrome flex min-h-screen flex-col items-center justify-center gap-2 text-center">
            <p className="font-mono text-sm text-[var(--ink-3)]">404</p>
            <h1 className="text-2xl font-medium" style={{ fontFamily: "var(--serif)" }}>
                Page not found
            </h1>
        </div>
    );
};
