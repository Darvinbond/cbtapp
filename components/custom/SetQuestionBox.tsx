"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import QuestionEditor from "./QuestionEditor";

type QuestionType = "one" | "many" | "short";

interface QuestionData {
  text: string;
  question_type: QuestionType;
  options: string[];
  answer: string[];
  metadata: Record<string, any>;
}

interface SetQuestionBoxProps {
  questionNumber: number;
  initialData?: QuestionData;
  onChange?: (data: QuestionData) => void;
}

export default function SetQuestionBox({
  questionNumber,
  initialData,
  onChange,
}: SetQuestionBoxProps) {
  const [questionData, setQuestionData] = useState<QuestionData>({
    text: "",
    question_type: "one",
    options: [""],
    answer: [""],
    metadata: {},
    ...initialData
  });

  const validateAndUpdate = (newData: Partial<QuestionData>) => {
    const updatedData = { ...questionData, ...newData };

    // Validate options for single/multiple choice
    if (updatedData.question_type !== "short") {
      updatedData.options = updatedData.options.filter((opt) => opt.trim() !== "");
      if (updatedData.options.length === 0) {
        updatedData.options = [""];
      }
    }

    // Validate answers
    updatedData.answer = updatedData.answer.filter((ans) => ans.trim() !== "");
    if (updatedData.answer.length === 0) {
      updatedData.answer = [""];
    }

    setQuestionData(updatedData);
    if (onChange) onChange(updatedData);
  };

  useEffect(() => {
    if (initialData) {
      setQuestionData(initialData);
    }
  }, [initialData]);

  const handleTypeChange = (value: QuestionType) => {
    validateAndUpdate({
      question_type: value,
      options: value === "short" ? [] : [""],
      answer: [""],
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionData.options];
    newOptions[index] = value;
    validateAndUpdate({ options: newOptions });
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...questionData.answer];
    newAnswers[index] = value;
    validateAndUpdate({ answer: newAnswers });
  };

  const addOption = () => {
    validateAndUpdate({ options: [...questionData.options, ""] });
  };

  const removeOption = (index: number) => {
    if (questionData.options.length > 1) {
      const newOptions = questionData.options.filter((_, i) => i !== index);
      validateAndUpdate({ options: newOptions });
    }
  };

  const addAnswer = () => {
    validateAndUpdate({ answer: [...questionData.answer, ""] });
  };

  const removeAnswer = (index: number) => {
    if (questionData.answer.length > 1) {
      const newAnswers = questionData.answer.filter((_, i) => i !== index);
      validateAndUpdate({ answer: newAnswers });
    }
  };

  const getPlaceholderByType = (type: QuestionType) => {
    switch (type) {
      case "one":
        return "What is the capital of France?";
      case "many":
        return "Select all programming languages from the list:";
      case "short":
        return "_______ is the rate at which work is done";
      default:
        return "Enter your question...";
    }
  };

  return (
    <Card className="w-full rounded-[12px] shadow max-w-3xl !px-[24px] !py-[40px]">
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="flex-none flex items-center justify-center h-max w-max py-[4px] text-[12px] px-[12px] rounded-[8px] bg-zinc-200 text-zinc-800">
          Q{questionNumber}
        </div>
        <div className="flex-1">
          <QuestionEditor
            value={questionData.text}
            onChange={(value) => validateAndUpdate({ text: value })}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start">
          <Select
            value={questionData.question_type}
            onValueChange={(value: QuestionType) => handleTypeChange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one">Single Choice</SelectItem>
              <SelectItem value="many">Multiple Choice</SelectItem>
              <SelectItem value="short">Short Answer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {questionData.question_type === "short"
            ? // Render answers for 'short' type
              questionData.answer.map((answer, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 border rounded-[12px] gap-3"
                >
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="flex-1 bg-transparent outline-none"
                    placeholder="Enter correct answer"
                  />
                  {questionData.answer.length > 1 && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeAnswer(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            : // Render options for 'one' and 'many' types
              questionData.options.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 border rounded-[12px] gap-3"
                >
                  <input
                    type={questionData.question_type === "one" ? "radio" : "checkbox"}
                    name={`question-${questionNumber}`}
                    className="h-4 w-4"
                    checked={false}
                    readOnly
                  />
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 bg-transparent outline-none"
                    placeholder={`Option ${index + 1}`}
                  />
                  {questionData.options.length > 1 && (
                    <Button
                      variant={"destructive"}
                      size={"icon"}
                      onClick={() => removeOption(index)}
                      //   className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={questionData.question_type === "short" ? addAnswer : addOption}
          >
            Add {questionData.question_type === "short" ? "Answer" : "Option"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
