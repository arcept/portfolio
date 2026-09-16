interface SimpleStatusCardProps {
    icon: React.ReactNode;
    heading: string;
    headingClassName?: string;
    body: string;
    footer?: { title: string; body: string };
}

// Shared shell for the plain icon+heading+paragraph terminal screens (home-closure,
// home-access-restricted, home-disqualified) — same layout, different icon/copy/color per state.
export const SimpleStatusCard = ({ icon, heading, headingClassName = "text-primary", body, footer }: SimpleStatusCardProps) => (
    <div className="rounded-2xl border border-secondary bg-primary p-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center text-4xl">{icon}</div>
        <h2 className={`text-2xl font-semibold ${headingClassName}`}>{heading}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-tertiary">{body}</p>
        {footer && (
            <div className="mx-auto mt-6 max-w-md border-t border-secondary pt-6 text-left">
                <p className="text-sm font-semibold text-primary">{footer.title}</p>
                <p className="mt-1 text-sm text-tertiary">{footer.body}</p>
            </div>
        )}
    </div>
);
