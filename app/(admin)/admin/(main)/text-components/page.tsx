"use client";

import { useState } from "react";
import SetQuestionBox from "@/components/custom/SetQuestionBox";
import AddQuestionButton from "@/components/custom/AddQuestionButton";

interface QuestionData {
  text: string;
  question_type: "one" | "many" | "short";
  options: string[];
  answer: string[];
  metadata: Record<string, any>;
}

export default function TextComponents() {
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
    <div className="w-full flex-1 flex bg-zinc-100 flex-col gap-8 items-center p-8">
      <div className="w-full max-w-2xl space-y-2">
        <AddQuestionButton onAdd={(pos) => addQuestion(-1, pos)} />

        {questions.map((question, index) => (
          <div key={index} className="space-y-2">
            <SetQuestionBox
              questionNumber={index + 1}
              initialData={question}
              onChange={(value) => updateQuestion(index, value)}
            />
            <AddQuestionButton onAdd={(pos) => addQuestion(index, pos)} />
          </div>
        ))}

        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-medium">Questions Data Preview</h3>
          <pre className="p-4 bg-white rounded-lg overflow-auto border border-zinc-200 text-sm">
            {JSON.stringify(questions, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
