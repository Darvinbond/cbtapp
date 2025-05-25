import React from "react";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  label: string;
  children: React.ReactNode;
};

function FormContainer({ label, children }: Props) {
  return (
    <div className="flex w-full flex-col gap-[4px]">
      <span className="text-[12px] text-zinc-500">{label}</span>
      {children}
    </div>
  );
}

export default FormContainer;

export function FormContainerSideBySide({
  label,
  custom_label,
  children,
  description,
}: {
  label?: string;
  custom_label?: any;
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row mx-auto sm:mx-0 gap-[24px] justify-between items-start">
      <div className="flex flex-col justify-start items-start gap-[4px]">
        {custom_label ? (
          custom_label
        ) : (
          <>
            <span className="text-[14px] text-black">{label}</span>
            <span className="text-[12px] text-zinc-500">{description}</span>
          </>
        )}
      </div>
      <Card className="w-full max-w-sm rounded-[16px]">
        <CardContent className="pt-[16px]">{children}</CardContent>
      </Card>
    </div>
  );
}
