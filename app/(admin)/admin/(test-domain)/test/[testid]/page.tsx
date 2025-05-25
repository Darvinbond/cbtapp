"use client";

import { useCallback, useEffect, useState } from "react";
import SetQuestionBox, {
  DEFAULT_QUESTION_DATA,
  questionSchema,
  testQuestionSchema,
} from "@/components/custom/SetQuestionBox";
import AddQuestionButton from "@/components/custom/AddQuestionButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component
import { Check, Eye, ChevronLeft, Earth } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingOverlay } from "@/components/custom/LoadingOverlay";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import * as yup from "yup";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, CardContent } from "@/components/ui/card";
import GroupList from "@/components/custom/EachGroup";
import TestSettings from "@/components/custom/TestSettings";
import { useApiRequest } from "@/hooks/useApiRequest";
import TestQuestion from "@/components/custom/TestQuestion";
import TestProgress from "@/components/custom/TestProgress";
// import { EditTest } from "@/components/custom/EditTestDialog"; // Commented out as its usage isn't clear in the provided context for settings form


export default function Page() {
  const params = useParams();
  const { apiRequest } = useApiRequest();
  const [isSaving, setIsSaving] = useState(false);
  const [testData, setTestData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [testQuestions, setTestQuestions] = useState([]);

  const fetchTestData = useCallback(async () => {
    const testId = params.testid ? String(params.testid) : "";
    if (!testId) {
      // toast.error("Test ID is undefined");
      return;
    }

    const data = await apiRequest(`/api/tests/${encodeURIComponent(testId)}`);

    if (data) {
      setTestData(data);
    }

    setIsFetching(false);
  }, [params.testid]);

  const SubmitQuestions = async () => {
    // questionSchema
    // loop theor the testQuestions array and validate each question for each thet dont valid filter it out
    const validQuestions = testQuestions.map((question: any) => {
      delete question.index;
      return question;
    }).filter((question: any) => {
      return testQuestionSchema.isValidSync(question);
    });
    console.log(testQuestions, validQuestions, testQuestionSchema.isValidSync(testQuestions[0]));
    
    setIsSaving(true);
    const testId = params.testid ? String(params.testid) : "";
    if (!testId) {
      toast.error("Test ID is missing.");
      setIsSaving(false);
      return;
    }

    const newData = await apiRequest(
      `/api/test-question/${encodeURIComponent(testId)}`,
      {
        method: "POST",
        body: validQuestions,
      }
    );

    setIsSaving(false);
  };

  useEffect(() => {
    fetchTestData();
  }, [fetchTestData]);

  return (
    <div className="w-full h-screen flex flex-col justify-start">
      <nav className="w-full z-30 bg-white sticky top-0 flex justify-center border-b border-b-zinc-200 h-[48px]">
        <div className="w-full flex justify-between items-center dp-3 px-[40px] text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Button size={"icon"} variant={"secondary"} asChild>
              <Link href={"/admin"}>
                <ChevronLeft />
              </Link>
            </Button>
            <span className="font-normal text-[14px]">{testData?.name}</span>
          </div>
          {/* {JSON.stringify(isSaving)} */}
          <div className="flex items-center justify-end gap-[8px]">
            {/* <Button variant={"outline"}>
              <Eye />
              Preview
            </Button> */}
            <Button
              size={"sm"}
              variant={"secondary"}
              isLoading={isSaving}
              onClick={SubmitQuestions}
            >
              <Check /> {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button size={"sm"}>
              <Earth /> Publish
            </Button>
          </div>
        </div>
      </nav>
      <div className="w-full h-[calc(100vh-48px)] px-[16px] flex items-start justify-center overflow-y-auto">
        <Tabs defaultValue="test" className="flex flex-col w-full py-[32px]">
          <TabsList className="w-max mx-auto z-40 sticky top-[32px]">
            {" "}
            {/* Ensure TabsList has a background */}
            <TabsTrigger value="test">Questions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="result">Result</TabsTrigger>
          </TabsList>
          <div className="w-full mx-auto max-w-2xl mt-4">
            <TabsContent value="test">
              <TestQuestion
                testid={params.testid as string}
                setTestQuestions={setTestQuestions}
                testQuestions={testQuestions}
              />
            </TabsContent>
            <TabsContent value="settings">
              <TestSettings test_id={params.testid as string} />
            </TabsContent>
            <TabsContent value="candidates">
              <GroupList testID={params.testid as string} />
            </TabsContent>
            <TabsContent className="w-full" value="result">
              <Card className="max-w-full w-full mx-auto overflow-hidden rounded-[14px] border border-zinc-200 shadow-none">
                <CardContent className="space-y-6 p-0 overflow-hidden">
                  <TestProgress testid={params.testid as string} />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      <LoadingOverlay isLoading={isSaving} message="Saving changes" />
      <LoadingOverlay isLoading={isFetching} message="Fetching test data" />
    </div>
  );
}
