import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { CornerDownLeft, LoaderCircle, OctagonAlert, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AnswerSection from "./answerSection";
import CountdownTimer from "@/components/custom/CountdownTimer";
import SecureExamGuard from "@/components/custom/SecureExamGuard";
import { useApiRequest } from "@/hooks/useApiRequest";

type Props = {
  test_id: string;
  accessCode: string;
  questions: any[];
  setHaveAccess: Dispatch<SetStateAction<boolean>>;
};

const FAKE_QUESTION = [
  {
    id: "4c876ab5-2309-4aae-b0a7-2151022d584e",
    candidate_id: "01570802-8020-46e9-896e-3b0a4a7fd708",
    selected_options: [],
    awarded_points: 0,
    created_at: "2025-05-19T12:48:53.716167+00:00",
    test_question_id: null,
    question: {
      id: "fad135c3-d5de-45bb-9f93-d4239cff6d14",
      points: 1,
      test_id: "08a77ad9-13d6-4054-8f54-c764db3de09d",
      question: {
        text: "Which numbers are multiples of 3?",
        answer: ["3", "6", "9"],
        options: ["1", "2", "3", "4", "5", "6", "9"],
        metadata: {},
        question_type: "many",
      },
    },
  },
  {
    id: "cf307165-b083-424d-b3d0-2077f1aa4fe4",
    candidate_id: "01570802-8020-46e9-896e-3b0a4a7fd708",
    selected_options: [],
    awarded_points: 0,
    created_at: "2025-05-19T12:48:53.716167+00:00",
    test_question_id: null,
    question: {
      id: "2f1fa6d7-d4bb-471c-92d5-025d5e176d7a",
      points: 1,
      test_id: "08a77ad9-13d6-4054-8f54-c764db3de09d",
      question: {
        text: "What is the value of π (pi) rounded to two decimal places?",
        answer: ["3.14"],
        options: ["3.12", "3.14", "3.16", "3.18"],
        metadata: {},
        question_type: "one",
      },
    },
  },
  {
    id: "788d1547-385d-4fee-9910-4289781b7daf",
    candidate_id: "01570802-8020-46e9-896e-3b0a4a7fd708",
    selected_options: [],
    awarded_points: 0,
    created_at: "2025-05-19T12:48:53.716167+00:00",
    test_question_id: null,
    question: {
      id: "21914dfc-3d36-4734-a2b5-ef3a1a507995",
      points: 1,
      test_id: "08a77ad9-13d6-4054-8f54-c764db3de09d",
      question: {
        text: "Write the Roman numeral for 50.",
        answer: ["L"],
        options: ["X", "L", "C", "D"],
        metadata: {},
        question_type: "one",
      },
    },
  },
  {
    id: "d7842d5a-7688-4ef2-b0f5-5d45e1d8a237",
    candidate_id: "01570802-8020-46e9-896e-3b0a4a7fd708",
    selected_options: [],
    awarded_points: 0,
    created_at: "2025-05-19T12:48:53.716167+00:00",
    test_question_id: null,
    question: {
      id: "ea5bc933-912f-4c94-b946-994d783cd93d",
      points: 1,
      test_id: "08a77ad9-13d6-4054-8f54-c764db3de09d",
      question: {
        text: "What is 7 multiplied by 6?",
        answer: ["42"],
        options: ["36", "42", "48", "54"],
        metadata: {},
        question_type: "one",
      },
    },
  },
  {
    id: "fe13e17b-49ee-441a-9bcb-960b63c8ea50",
    candidate_id: "01570802-8020-46e9-896e-3b0a4a7fd708",
    selected_options: [],
    awarded_points: 0,
    created_at: "2025-05-19T12:48:53.716167+00:00",
    test_question_id: null,
    question: {
      id: "985354a3-bac0-4281-aa8e-e5f9cc59e634",
      points: 1,
      test_id: "08a77ad9-13d6-4054-8f54-c764db3de09d",
      question: {
        text: "Write the number that comes after 99.",
        answer: ["100"],
        options: [],
        metadata: {},
        question_type: "short",
      },
    },
  },
  {
    id: "567968df-2297-4655-9434-822f0667255c",
    candidate_id: "01570802-8020-46e9-896e-3b0a4a7fd708",
    selected_options: [],
    awarded_points: 0,
    created_at: "2025-05-19T12:48:53.716167+00:00",
    test_question_id: null,
    question: {
      id: "8a2e97d5-2088-46bc-b07d-616b82f0ee95",
      points: 1,
      test_id: "08a77ad9-13d6-4054-8f54-c764db3de09d",
      question: {
        text: "What is the perimeter of a rectangle with length 5cm and width 3cm?",
        answer: ["16"],
        options: ["8", "15", "16", "20"],
        metadata: {},
        question_type: "one",
      },
    },
  },
  {
    id: "dacbf3f6-3133-4808-a5de-b248e7736187",
    candidate_id: "01570802-8020-46e9-896e-3b0a4a7fd708",
    selected_options: [],
    awarded_points: 0,
    created_at: "2025-05-19T12:48:53.716167+00:00",
    test_question_id: null,
    question: {
      id: "361ffa83-6aed-4a77-84aa-1532aa02c595",
      points: 1,
      test_id: "08a77ad9-13d6-4054-8f54-c764db3de09d",
      question: {
        text: "What is the area of a square with side 4cm?",
        answer: ["16"],
        options: ["8", "12", "16", "20"],
        metadata: {},
        question_type: "one",
      },
    },
  },
  {
    id: "1d025092-0430-4b26-b3e9-8f8673dcce67",
    candidate_id: "01570802-8020-46e9-896e-3b0a4a7fd708",
    selected_options: [],
    awarded_points: 0,
    created_at: "2025-05-19T12:48:53.716167+00:00",
    test_question_id: null,
    question: {
      id: "aeaeaab7-de78-4069-af97-1e5c6bc42d1d",
      points: 1,
      test_id: "08a77ad9-13d6-4054-8f54-c764db3de09d",
      question: {
        text: "What is 5 + 7?",
        answer: ["12"],
        options: ["10", "11", "12", "13"],
        metadata: {},
        question_type: "one",
      },
    },
  },
  {
    id: "30e401a3-e7f8-4eee-9e06-95db829ed011",
    candidate_id: "01570802-8020-46e9-896e-3b0a4a7fd708",
    selected_options: [],
    awarded_points: 0,
    created_at: "2025-05-19T12:48:53.716167+00:00",
    test_question_id: null,
    question: {
      id: "67ea0c9e-ee65-4680-acaa-c9c22878515b",
      points: 1,
      test_id: "08a77ad9-13d6-4054-8f54-c764db3de09d",
      question: {
        text: "Select all odd numbers.",
        answer: ["1", "3", "5"],
        options: ["1", "2", "3", "4", "5"],
        metadata: {},
        question_type: "many",
      },
    },
  },
  {
    id: "9b26b846-1e7f-49a6-bb4e-8fbd044607f4",
    candidate_id: "01570802-8020-46e9-896e-3b0a4a7fd708",
    selected_options: [],
    awarded_points: 0,
    created_at: "2025-05-19T12:48:53.716167+00:00",
    test_question_id: null,
    question: {
      id: "c0c98efc-da8d-40c2-8390-47b6fa69f41d",
      points: 1,
      test_id: "08a77ad9-13d6-4054-8f54-c764db3de09d",
      question: {
        text: "What is 9 squared (9^2)?",
        answer: ["81"],
        options: ["72", "81", "90", "99"],
        metadata: {},
        question_type: "one",
      },
    },
  },
];

function CBTPage({ test_id, accessCode, questions, setHaveAccess }: Props) {
  const { apiRequest } = useApiRequest();
  const [testData, setTestData] = useState<any>({});
  const [isFetching, setIsFetching] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [candidateTestQuestions, setCandidateTestQuestions] = useState<any>([]);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<any>([]);

  const fetchTestData = useCallback(async () => {
    const data = await apiRequest(`/api/tests/${encodeURIComponent(test_id)}`);

    if (data) {
      setTestData(data);
    }
    setIsFetching(false);
  }, [test_id]);

  const attemptQuestion = (id: string, answer: string[]) => {
    const sectionIndex = selectedOptions.findIndex(
      (question: any) => question.id == id
    );

    if (sectionIndex === -1) {
      setSelectedOptions((prev: any) => [
        ...prev,
        { id, selected_options: answer },
      ]);
    }

    setSelectedOptions((prev: any) =>
      prev.map((question: any) =>
        question.id == id ? { ...question, selected_options: answer } : question
      )
    );
  };

  const SubmitTest = async () => {
    setIsSubmittingTest(true);
    const data = await apiRequest(
      `/api/candidate-test-questions/${encodeURIComponent(test_id)}/submit`,
      {
        method: "POST",
        body: {
          access_code: accessCode,
          selections: selectedOptions,
        },
      }
    );
    if (data) {
      setHaveAccess(false);
    }
    setIsSubmittingTest(false);
  };

  useEffect(() => {
    fetchTestData();
  }, [test_id]);

  useEffect(() => {
    setCandidateTestQuestions(questions);
  }, [questions]);

  if (isFetching) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <LoaderCircle className="animate-spin size-[14px]" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="w-screen h-screen flex flex-col gap-[8px] text-center text-zinc-600 text-[14px] items-center justify-center">
        <OctagonAlert className="size-[24px] text-black" />
        <span className="max-w-md">
          No questions hae been set for this test. Please click the submit below
          to end this test or contact your admin for more instructions.
        </span>
        <Button
          isLoading={isSubmittingTest}
          onClick={SubmitTest}
          size="sm"
          className="mt-[40px]"
        >
          <Send /> Submit
        </Button>
      </div>
    );
  }

  return (
    <>
      <SecureExamGuard onIncident={SubmitTest}>
        <div className="w-screen h-screen flex flex-col px-[16px] sm:px-[40px] items-center justify-start">
          <div className="flex w-full items-center h-[56px] justify-between gap-[16px]">
            <h1 className="text-[14px]">{testData.name}</h1>
            <Button isLoading={isSubmittingTest} onClick={SubmitTest} size="sm">
              <Send /> Submit
            </Button>
          </div>
          <div className="flex w-full items-start justify-between flex-col gap-[16px]">
            <div className="text-[14px] flex items-center gap-[8px] justify-start">
              Time left:{" "}
              <CountdownTimer
                minutes={testData.time_limit_minutes}
                onAfterCountdown={() => SubmitTest()}
              />
            </div>
            <div className="flex flex-wrap w-full items-center justify-start gap-[8px]">
              {/* boxes of question number and different color signifying it it has been attampted or not */}
              {candidateTestQuestions.map((question: any, index: number) => (
                <div
                  onClick={() => {
                    // move to question
                    setQuestionIndex(index);
                  }}
                  key={index}
                  className="cursor-pointer"
                >
                  <p
                    className={cn(
                      "size-[32px] text-[12px] select-none flex items-center justify-center rounded-[8px] border border-zinc-300",
                      (
                        selectedOptions.find(
                          (option: any) => option.id === question.id
                        )?.selected_options || []
                      ).length > 0
                        ? "bg-zinc-500 text-white border-zinc-500"
                        : "bg-white border-zinc-300",
                      questionIndex === index
                        ? "ring-2 ring-black/60 ring-offset-2"
                        : ""
                    )}
                  >
                    {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex max-w-2xl w-full flex-col gap-[24px] mt-[40px]">
            <div className="flex h-max items-start justify-normal gap-[24px]">
              <span className="bg-zinc-200 w-max h-max px-[8px] py-[4px] text-[14px] rounded-[6px] flex items-center justify-center">
                Q{questionIndex + 1}
              </span>
              <span className="text-[20px]">
                {candidateTestQuestions[questionIndex].question.question.text}
              </span>
            </div>
            <div className="flex w-full flex-col gap-[24px]">
              <div>
                <AnswerSection
                  attemptQuestion={attemptQuestion}
                  selectedOptions={
                    selectedOptions.find(
                      (option: any) =>
                        option.id === candidateTestQuestions[questionIndex].id
                    )?.selected_options || []
                  }
                  question={candidateTestQuestions[questionIndex]}
                />
              </div>
              <Button
                onClick={() => {
                  setQuestionIndex(questionIndex + 1);
                }}
                className="ml-auto"
                variant={"secondary"}
              >
                <CornerDownLeft /> Next
              </Button>
            </div>
          </div>
        </div>
      </SecureExamGuard>
    </>
  );
}

export default CBTPage;
