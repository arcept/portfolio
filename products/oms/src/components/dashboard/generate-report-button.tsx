import { useState } from "react";
import { FileDownload03 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { DialogTrigger, Modal, ModalOverlay, Dialog } from "@/components/application/modals/modal";
import { usePersona } from "@/providers/role-provider";
import { generateAndDownloadReport } from "@/lib/pdf/generate-report";
import type { PeriodSelection } from "@/data/dashboard-data";
import { getSelectedPeriodChartData, scalePeriodDataForPersona } from "@/data/dashboard-data";

export const GenerateReportButton = ({ selection }: { selection: PeriodSelection }) => {
    const { persona } = usePersona();
    const [agreed, setAgreed] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleConfirm = async (close: () => void) => {
        setIsGenerating(true);
        try {
            const data = scalePeriodDataForPersona(getSelectedPeriodChartData(selection), persona);
            await generateAndDownloadReport(data, persona);
        } finally {
            setIsGenerating(false);
            close();
        }
    };

    return (
        <DialogTrigger>
            <Button color="secondary" size="sm" iconLeading={FileDownload03}>
                Generate Report
            </Button>
            <ModalOverlay>
                <Modal>
                    <Dialog>
                        {({ close }) => (
                            <div className="w-full max-w-[544px] rounded-2xl bg-primary shadow-xl">
                                <div className="flex flex-col gap-2 px-6 pt-6">
                                    <h2 className="text-md font-semibold text-primary">Generate & Download PDF Report</h2>
                                    <p className="text-sm text-tertiary">This report contains confidential revenue and performance data. Please review before continuing.</p>
                                </div>
                                <div className="flex flex-col gap-6 px-6 pt-8 pb-6">
                                    <Checkbox
                                        isSelected={agreed}
                                        onChange={setAgreed}
                                        label="I acknowledge this report is confidential and for internal use only, and that I'm responsible for how it's stored and shared once downloaded."
                                    />
                                    <div className="flex justify-end gap-3">
                                        <Button color="secondary" onClick={close}>
                                            Cancel
                                        </Button>
                                        <Button color="primary" isDisabled={!agreed || isGenerating} isLoading={isGenerating} onClick={() => handleConfirm(close)}>
                                            Confirm
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};
