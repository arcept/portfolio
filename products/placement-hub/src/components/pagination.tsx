import type { ComponentProps } from "react";
import { ChevronLeft, ChevronRight, DotsHorizontal } from "@untitledui/icons";
import { cx } from "@/utils/cx";

// Ported from shadcn/ui's Pagination (https://ui.shadcn.com/docs/components/base/pagination),
// adapted to buttons + an onChange callback since this list is paginated by client state, not
// real per-page URLs, and to @untitledui/icons to match the rest of this project's icon set.

function PaginationNav({ className, ...props }: ComponentProps<"nav">) {
    return <nav aria-label="pagination" className={cx("mx-auto flex w-full justify-center", className)} {...props} />;
}

function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
    return <ul className={cx("flex flex-row items-center gap-1", className)} {...props} />;
}

function PaginationItem(props: ComponentProps<"li">) {
    return <li {...props} />;
}

interface PaginationLinkProps extends ComponentProps<"button"> {
    isActive?: boolean;
}

function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
    return (
        <button
            type="button"
            aria-current={isActive ? "page" : undefined}
            data-active={isActive}
            className={cx(
                "flex size-9 items-center justify-center rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-40",
                isActive ? "border border-gray-300 bg-white text-black" : "text-gray-600 hover:bg-gray-100",
                className,
            )}
            {...props}
        />
    );
}

function PaginationPrevious({ className, ...props }: ComponentProps<"button">) {
    return (
        <PaginationLink aria-label="Go to previous page" className={cx("w-auto gap-1 px-2.5", className)} {...props}>
            <ChevronLeft className="size-4" />
            <span className="hidden sm:block">Previous</span>
        </PaginationLink>
    );
}

function PaginationNext({ className, ...props }: ComponentProps<"button">) {
    return (
        <PaginationLink aria-label="Go to next page" className={cx("w-auto gap-1 px-2.5", className)} {...props}>
            <span className="hidden sm:block">Next</span>
            <ChevronRight className="size-4" />
        </PaginationLink>
    );
}

function PaginationEllipsis({ className, ...props }: ComponentProps<"span">) {
    return (
        <span aria-hidden className={cx("flex size-9 items-center justify-center", className)} {...props}>
            <DotsHorizontal className="size-4 text-gray-400" />
            <span className="sr-only">More pages</span>
        </span>
    );
}

type PageToken = number | "ellipsis";

// Always shows first/last page plus a window around the current page, collapsing the rest into
// an ellipsis — keeps the control usable once the (currently tiny) job/application lists grow.
const getPageTokens = (page: number, totalPages: number): PageToken[] => {
    const siblingCount = 1;
    const tokens: PageToken[] = [1];

    const windowStart = Math.max(page - siblingCount, 2);
    const windowEnd = Math.min(page + siblingCount, totalPages - 1);

    if (windowStart > 2) tokens.push("ellipsis");
    for (let p = windowStart; p <= windowEnd; p++) tokens.push(p);
    if (windowEnd < totalPages - 1) tokens.push("ellipsis");

    if (totalPages > 1) tokens.push(totalPages);
    return tokens;
};

interface PaginationProps {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    return (
        <PaginationNav>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious onClick={() => onChange(Math.max(page - 1, 1))} disabled={page === 1} />
                </PaginationItem>
                {getPageTokens(page, totalPages).map((token, i) =>
                    token === "ellipsis" ? (
                        <PaginationItem key={`ellipsis-${i}`}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={token}>
                            <PaginationLink isActive={token === page} onClick={() => onChange(token)}>
                                {token}
                            </PaginationLink>
                        </PaginationItem>
                    ),
                )}
                <PaginationItem>
                    <PaginationNext onClick={() => onChange(Math.min(page + 1, totalPages))} disabled={page === totalPages} />
                </PaginationItem>
            </PaginationContent>
        </PaginationNav>
    );
};
