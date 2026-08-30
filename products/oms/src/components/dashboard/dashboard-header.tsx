import { useState } from "react";
import { SearchLg } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Input } from "@/components/base/input/input";
import { periodFilters } from "@/data/dashboard-data";

const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const DashboardHeader = () => {
    const [period, setPeriod] = useState<string>(periodFilters[0]);

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-start gap-4">
                <div className="flex min-w-80 flex-1 flex-col gap-0.5">
                    <Button color="link-color" size="sm" className="p-0!">
                        {today}
                    </Button>

                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold text-primary">Good Evening, Manik</h1>
                        <Badge color="indigo" type="color" size="sm">
                            ADMIN
                        </Badge>
                    </div>

                    <p className="text-xs text-tertiary">Here&apos;s how the floor is tracking</p>
                </div>

                <Input
                    shortcut
                    size="sm"
                    aria-label="Search deals"
                    placeholder="Search deals"
                    icon={SearchLg}
                    className="max-w-70 min-w-50 flex-1"
                />
            </div>

            <ButtonGroup selectedKeys={[period]} onSelectionChange={(keys) => setPeriod(Array.from(keys)[0] as string)} size="sm">
                {periodFilters.map((filter) => (
                    <ButtonGroupItem key={filter} id={filter}>
                        {filter}
                    </ButtonGroupItem>
                ))}
            </ButtonGroup>
        </div>
    );
};
