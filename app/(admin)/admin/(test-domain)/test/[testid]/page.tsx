"use client";

import { useState } from "react";
import SetQuestionBox from "@/components/custom/SetQuestionBox";
import AddQuestionButton from "@/components/custom/AddQuestionButton";
import { Button } from "@/components/ui/button";
import { Check, Eye, ChevronLeft, Earth } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QuestionData {
  text: string;
  question_type: "one" | "many" | "short";
  options: string[];
  answer: string[];
  metadata: Record<string, any>;
}

export default function Page() {
  const [questions, setQuestions] = useState<QuestionData[]>([
    {
      text: "",
      question_type: "one" as const,
      options: [""],
      answer: [""],
      metadata: {},
    },
  ]);

  const addQuestion = (index: number, position: "above" | "below") => {
    const newQuestion: QuestionData = {
      text: "",
      question_type: "one" as const,
      options: [""],
      answer: [""],
      metadata: {},
    };
    const newIndex = position === "above" ? index : index + 1;
    setQuestions((prev) => [
      ...prev.slice(0, newIndex),
      newQuestion,
      ...prev.slice(newIndex),
    ]);
  };

  const updateQuestion = (index: number, data: QuestionData) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? data : q)));
  };

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
          </div>
          <div className="flex items-center justify-end gap-[8px]">
            <Button variant={"outline"}>
              <Eye />
              Preview
            </Button>
            <Button size={"sm"} variant={"secondary"}>
              <Check /> Save Changes
            </Button>
            <Button size={"sm"}>
              <Earth /> Publish
            </Button>
          </div>
        </div>
      </nav>
      <div className="w-full h-[calc(100vh-48px)] flex items-start justify-between overflow-y-auto">
        <Tabs defaultValue="test" className="flex flex-col w-full py-[32px]">
          <TabsList className="w-max mx-auto z-40 sticky top-[32px]">
            <TabsTrigger value="test">Test</TabsTrigger>
            <TabsTrigger value="result">Result</TabsTrigger>
          </TabsList>
          <div className="w-full mx-auto max-w-2xl">
            <TabsContent value="test">
              <div className="w-full space-y-2">
                <AddQuestionButton onAdd={(pos) => addQuestion(-1, pos)} />

                {questions.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <SetQuestionBox
                      questionNumber={index + 1}
                      initialData={question}
                      onChange={(value) => updateQuestion(index, value)}
                    />
                    <AddQuestionButton
                      onAdd={(pos) => addQuestion(index, pos)}
                    />
                  </div>
                ))}

                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-medium">
                    Questions Data Preview
                  </h3>
                  <pre className="p-4 bg-white rounded-lg overflow-auto border border-zinc-200 text-sm">
                    {JSON.stringify(questions, null, 2)}
                  </pre>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="result">
              <div className="w-full flex-1 flex flex-col gap-8 items-center p-8">
                <div className="w-full max-w-2xl space-y-2">
                  <AddQuestionButton onAdd={(pos) => addQuestion(-1, pos)} />

                  {questions.map((question, index) => (
                    <div key={index} className="space-y-2">
                      <SetQuestionBox
                        questionNumber={index + 1}
                        initialData={question}
                        onChange={(value) => updateQuestion(index, value)}
                      />
                      <AddQuestionButton
                        onAdd={(pos) => addQuestion(index, pos)}
                      />
                    </div>
                  ))}

                  <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-medium">
                      Questions Data Preview
                    </h3>
                    <pre className="p-4 bg-white rounded-lg overflow-auto border border-zinc-200 text-sm">
                      {JSON.stringify(questions, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        <div className="w-full max-w-xs bg-white border-l border-l-zinc-200 h-full inset-y-0 right-0 sticky"></div>
      </div>
    </div>
  );
}
