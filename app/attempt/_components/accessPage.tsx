"use client";
import FormContainer from "@/components/custom/FormContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiRequest } from "@/hooks/useApiRequest";
import { CornerDownLeft, LoaderCircle } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

type Props = {
  setHaveAccess: React.Dispatch<React.SetStateAction<boolean>>;
  test_id: string;
  accessCode: string;
  setAccessCode: React.Dispatch<React.SetStateAction<string>>;
  setQuestions: React.Dispatch<React.SetStateAction<any>>;
};

function AccessPage({
  setHaveAccess,
  test_id,
  accessCode,
  setAccessCode,
  setQuestions,
}: Props) {
  const { apiRequest } = useApiRequest();
  const [testData, setTestData] = useState<any>({});
  const [isAccessing, setIsAccessing] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const fetchTestData = useCallback(async () => {
    const data = await apiRequest(`/api/tests/${encodeURIComponent(test_id)}`);

    if (data) {
      setTestData(data);
    }

    setIsFetching(false);
  }, [test_id]);

  const handleAccess = async () => {
    setIsAccessing(true);
    const data = await apiRequest(
      `/api/attempts/${encodeURIComponent(test_id)}/make-attempt`,
      {
        method: "POST",
        body: {
          access_code: accessCode,
        },
      }
    );
    if (data) {
      setQuestions(data.candidateTestQuestions);
      setHaveAccess(true);
    }
    setIsAccessing(false);
  };

  useEffect(() => {
    fetchTestData();
  }, [test_id]);

  if (isFetching) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <LoaderCircle className="animate-spin size-[14px]" />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col gap-[160px] items-center justify-start py-[40px] px-[16px]">
      <div className="max-w-lg flex flex-col justify-center items-center gap-[8px]">
        <span className="text-center text-[20px]">{testData.name}</span>
        <span className="text-[14px] text-start text-zinc-500">
          {testData.description}
        </span>
      </div>
      <div className="flex w-full max-w-xs flex-col items-center justify-center gap-4">
        <FormContainer label="Enter your 8 digit test access-code">
          <Input
            className="w-full"
            placeholder="e.g XK3L067W"
            onChange={(e) => setAccessCode(e.target.value as string)}
            value={accessCode}
          />
        </FormContainer>
        <Button
          disabled={accessCode.length != 8}
          isLoading={isAccessing}
          onClick={() => handleAccess()}
          className="ml-auto"
        >
          <CornerDownLeft /> Go
        </Button>
      </div>
    </div>
  );
}

export default AccessPage;
