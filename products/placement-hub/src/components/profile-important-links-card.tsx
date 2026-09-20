import { ArrowNarrowUpRight, Link01, Link03, LinkBroken01 } from "@untitledui/icons";
import linkedinIcon from "@/assets/linkedin-icon.svg";
import { IMPORTANT_LINK_LABELS } from "@/data/profile";

interface ProfileImportantLinksCardProps {
    complete: boolean;
}

// The one card that actually differs between the incomplete/complete My Profile states — links
// show broken/greyed-out until the resume + portfolio have been "uploaded" (profileStore flag),
// then turn into live blue links with a social-links row underneath.
export const ProfileImportantLinksCard = ({ complete }: ProfileImportantLinksCardProps) => {
    return (
        <div className="flex w-full flex-col items-start overflow-hidden rounded-2xl border border-gray-cool-200 bg-white">
            <div className="flex w-full items-center gap-2 border-b border-gray-cool-200 bg-gray-cool-50 px-6 py-5">
                <Link01 className="size-5 text-gray-900" />
                <p className="text-xl font-semibold text-gray-900">Important Links</p>
            </div>
            <div className="flex w-full flex-col items-start gap-4 px-6 py-5">
                {IMPORTANT_LINK_LABELS.map((label, index) => (
                    <div key={label} className="flex w-full flex-col items-start gap-4">
                        {complete ? (
                            <a href="#" className="flex items-center gap-2 text-lg font-semibold text-blue-600 hover:underline">
                                {label}
                                <ArrowNarrowUpRight className="size-5" />
                            </a>
                        ) : (
                            <span className="flex items-center gap-2 text-lg font-semibold text-gray-400">
                                {label}
                                <LinkBroken01 className="size-5" />
                            </span>
                        )}
                        {index < IMPORTANT_LINK_LABELS.length - 1 && <span className="h-px w-full bg-gray-200" />}
                    </div>
                ))}

                {complete && (
                    <div className="flex w-full items-center gap-4 pt-2">
                        <img src={linkedinIcon} alt="LinkedIn" className="size-6" />
                        <Link03 className="size-6 text-blue-600" />
                    </div>
                )}
            </div>
        </div>
    );
};
