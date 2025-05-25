import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

type Props = {
  question: any;
  attemptQuestion: (id: string, answer: string[]) => void;
  selectedOptions: string[];
};

function AnswerSection({ question, attemptQuestion, selectedOptions }: Props) {
  //   return <>{JSON.stringify(selectedOptions)}</>;
  switch (question.question.question.question_type) {
    case "one":
      return (
        <div className="flex w-full flex-col gap-[8px]">
          {question.question.question.options.map(
            (option: string, index: number) => (
              <Label
                key={index}
                className="flex items-center gap-[8px] cursor-pointer hover:bg-zinc-100 transition-all duration-300 rounded-[8px] p-[8px]"
              >
                <Input
                  name={question.id}
                  checked={selectedOptions?.includes?.(option)}
                  className="size-[20px] accent-black"
                  type="radio"
                  onChange={(e) => attemptQuestion(question.id, [option])}
                />
                <span className="text-[14px] text-zinc-600 font-[400]">
                  {option}
                </span>
              </Label>
            )
          )}
        </div>
      );
    case "short":
      return (
        <Input
          placeholder="Type in your answer"
          className="w-full"
          type="text"
          value={selectedOptions[0] ?? ""}
          onChange={(e) => attemptQuestion(question.id, e.target.value ? [e.target.value]: [])}
        />
      );
    case "many":
      return (
        <div className="flex w-full flex-col gap-[8px]">
          {question.question.question.options.map(
            (option: string, index: number) => (
              <Label
                key={index}
                className="flex items-center gap-[8px] cursor-pointer hover:bg-zinc-100 transition-all duration-300 rounded-[8px] p-[8px]"
              >
                <Input
                  name={question.id}
                  checked={selectedOptions?.includes?.(option)}
                  className="size-[20px] accent-black"
                  type="checkbox"
                  //   go through selectedOptions is its already exist there the demove from the array else add to it
                  onChange={(e) =>
                    attemptQuestion(
                      question.id,
                      selectedOptions?.includes?.(
                        option
                      )
                        ? selectedOptions?.filter?.(
                            (item: string) => item !== option
                          )
                        : [...selectedOptions, option]
                    )
                  }
                />
                <span className="text-[14px] text-zinc-600 font-[400]">
                  {option}
                </span>
              </Label>
            )
          )}
        </div>
      );
    default:
      return <div>AnswerSection</div>;
  }
}

export default AnswerSection;
