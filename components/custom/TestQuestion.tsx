// import React, { useCallback, useEffect } from "react";
// import SetQuestionBox, { DEFAULT_QUESTION_DATA } from "./SetQuestionBox";
// import { toast } from "sonner";
// import { useState } from "react";
// import AddQuestionButton from "@/components/custom/AddQuestionButton";
// import * as yup from "yup";
// import { useFieldArray, useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useApiRequest } from "@/hooks/useApiRequest";
// import { LoaderCircle } from "lucide-react";

// type Props = {
//   testid: string;
// };

// export const questionSchema = yup.object({
//   text: yup.string().required("Text is required").trim(),
//   question_type: yup
//     .mixed<"one" | "many" | "short">()
//     .oneOf(["one", "many", "short"], "Invalid question type")
//     .required("Question type is required"),
//   options: yup
//     .array()
//     .of(yup.string().required("Option text cannot be empty"))
//     .when("question_type", ([type], schema) =>
//       type === "short"
//         ? schema
//             .max(0, "Options must be empty for short answer questions")
//             .default([])
//         : schema
//             .min(1, "At least one option is required for this question type")
//             .required()
//     ),
//   answer: yup
//     .array()
//     .of(yup.string().required("No answer was suggested"))
//     .default([]),
//   metadata: yup.object().default({}),
// });

// export const testQuestionSchema = yup.object({
//   test_id: yup.string().required(), // Will be populated
//   points: yup
//     .number()
//     .typeError("Points must be a number")
//     .positive("Points must be a positive number")
//     .integer("Points must be an integer")
//     .required("Points are required"),
//   question: questionSchema.required(),
// });

// type TestQuestionArray = yup.InferType<typeof testQuestionSchema>;

// // Schema for the entire test form, including settings and questions
// export const testFormValidationSchema = yup.object({
//   test_questions: yup.array().of(testQuestionSchema).default([]),
// });

// export type TestFormData = yup.InferType<typeof testFormValidationSchema>;

// // Interface for individual question data (used by SetQuestionBox)
// export interface QuestionData {
//   text: string;
//   question_type: "one" | "many" | "short";
//   options: string[];
//   answer: string[]; // For short answers. For multiple/single choice, this might be handled differently (e.g., indices or values of selected options)
//   metadata: Record<string, any>;
// }

// function TestQuestion({ testid }: Props) {
//   const { apiRequest } = useApiRequest();
//   const [isSaving, setIsSaving] = useState(false);
//   const [isFetching, setIsFetching] = useState(true);
//   const [testQuestions, setTestQuestions] = useState([]);

//   const {
//     control,
//     reset,
//     setValue,
//     getValues,
//     watch, // Useful for watching specific field changes if needed
//     formState: { errors, isDirty, isValid }, // isDirty and isValid can be useful
//   } = useForm<TestFormData>({
//     resolver: yupResolver(testFormValidationSchema),
//   });

//   const {
//     fields,
//     insert,
//     remove: removeField,
//     update: updateField,
//   } = useFieldArray({
//     control,
//     name: "test_questions",
//   });

//   const addQuestion = () => {
//     const testId = testid ? String(testid) : "";
//     if (!testId) {
//       toast.error("Cannot add question without a Test ID.");
//       return;
//     }
//     const newItem: yup.InferType<typeof testQuestionSchema> = {
//       test_id: testId,
//       points: 1,
//       question: { ...DEFAULT_QUESTION_DATA }, // Assuming DEFAULT_QUESTION_DATA matches QuestionData structure
//     };
//     insert(fields.length, newItem);
//     // Scroll down smoothly to the bottom
//     window.scrollTo({
//       top: document.body.scrollHeight,
//       behavior: "smooth",
//     });
//   };

//   const removeQuestion = (index: number) => {
//     removeField(index);
//   };

//   const fetchTestQuestions = async () => {
//     const testId = testid ? String(testid) : "";
//     if (!testId) {
//       return;
//     }

//     const data = await apiRequest(
//       `/api/test-question/${encodeURIComponent(testId)}`
//     );

//     if (data) {
//       setTestQuestions(data);
//     }

//     setIsFetching(false);
//   };

//   useEffect(() => {
//     fetchTestQuestions();
//   }, [testid]);


//   if (isFetching) {
//     return (
//       <div className="w-full h-full flex items-center justify-center">
//         <LoaderCircle className="animate-spin size-[14px]" />
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className="w-full flex flex-col gap-[40px]">
//         {/* {JSON.stringify(testQuestions[0])} */}
//         {testQuestions?.map((test_question: any, i: number) => (
//           <SetQuestionBox
//             key={i}
//             questionNumber={i + 1}
//             initialData={{index: i, ...test_question}}
//             onChange={(value) => {
//               // check if value.index already exists in the current getValues().test_questions[?].index. i.e. value.index == getValues().test_questions[?].index. if it does, it replaces the value at that index with the new value else it adds to it with the index
//               const index = getValues().test_questions.findIndex(
//                 (question: any) => question.index === value.index
//               );
//               if (index !== -1) {
//                 const newQuestions = [...getValues().test_questions];
//                 newQuestions[index] = value;
//                 setValue("test_questions", newQuestions);
//               } else {
//                 setValue("test_questions", [...getValues().test_questions, value]);
//               }
//             }}
//             onDelete={() => removeQuestion(i)}
//           />
//         ))}
//       </div>
//       <AddQuestionButton onAdd={addQuestion} />
//       {errors.test_questions && !fields.length && (
//         <p className="text-sm text-red-500">
//           {errors.test_questions.message ||
//             "There's an issue with the questions list."}
//         </p>
//       )}
//     </div>
//   );
// }

// export default TestQuestion;


import React, { useCallback, useEffect } from "react";
import SetQuestionBox, { DEFAULT_QUESTION_DATA } from "./SetQuestionBox";
import { toast } from "sonner";
import { useState } from "react";
import AddQuestionButton from "@/components/custom/AddQuestionButton";
import * as yup from "yup";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useApiRequest } from "@/hooks/useApiRequest";
import { LoaderCircle } from "lucide-react";

type Props = {
  testid: string;
  setTestQuestions: any;
  testQuestions: any[];
};

export const questionSchema = yup.object({
  text: yup.string().required("Text is required").trim(),
  question_type: yup
    .mixed<"one" | "many" | "short">()
    .oneOf(["one", "many", "short"], "Invalid question type")
    .required("Question type is required"),
  options: yup
    .array()
    .of(yup.string().required("Option text cannot be empty"))
    .when("question_type", ([type], schema) =>
      type === "short"
        ? schema
            .max(0, "Options must be empty for short answer questions")
            .default([])
        : schema
            .min(1, "At least one option is required for this question type")
            .required()
    ),
  answer: yup
    .array()
    .of(yup.string().required("No answer was suggested"))
    .default([]),
  metadata: yup.object().default({}),
});

export const testQuestionSchema = yup.object({
  test_id: yup.string().required(), // Will be populated
  points: yup
    .number()
    .typeError("Points must be a number")
    .positive("Points must be a positive number")
    .integer("Points must be an integer")
    .required("Points are required"),
  question: questionSchema.required(),
});

type TestQuestionArray = yup.InferType<typeof testQuestionSchema>;

// Schema for the entire test form, including settings and questions
export const testFormValidationSchema = yup.object({
  test_questions: yup.array().of(testQuestionSchema).default([]),
});

export type TestFormData = yup.InferType<typeof testFormValidationSchema>;

// Interface for individual question data (used by SetQuestionBox)
export interface QuestionData {
  text: string;
  question_type: "one" | "many" | "short";
  options: string[];
  answer: string[]; // For short answers. For multiple/single choice, this might be handled differently (e.g., indices or values of selected options)
  metadata: Record<string, any>;
}

function TestQuestion({ testid, setTestQuestions, testQuestions }: Props) {
  const { apiRequest } = useApiRequest();
  const [isFetching, setIsFetching] = useState(true);

  const {
    control,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<TestFormData>({
    resolver: yupResolver(testFormValidationSchema),
    defaultValues: {
      test_questions: []
    }
  });

  const {
    fields,
    insert,
    remove: removeField,
    update: updateField,
  } = useFieldArray({
    control,
    name: "test_questions",
  });

  const addQuestion = () => {
    const testId = testid ? String(testid) : "";
    if (!testId) {
      toast.error("Cannot add question without a Test ID.");
      return;
    }
    const newItem = {
      test_id: testId,
      points: 1,
      question: { ...DEFAULT_QUESTION_DATA },
      index: fields.length // Add index to identify the question
    };
    
    // Update both the form state and the UI state
    insert(fields.length, newItem);
    setTestQuestions([...testQuestions, newItem]);
    
    // Scroll down smoothly to the bottom
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  const removeQuestion = (index) => {
    removeField(index);
    // Also update the UI state
    const newQuestions = [...testQuestions];
    newQuestions.splice(index, 1);
    setTestQuestions(newQuestions);
  };

  const fetchTestQuestions = async () => {
    const testId = testid ? String(testid) : "";
    if (!testId) {
      setIsFetching(false);
      return;
    }

    try {
      const data = await apiRequest(
        `/api/test-question/${encodeURIComponent(testId)}`
      );

      if (data) {
        // Add index property to each question for tracking
        const questionsWithIndex = data.map((question, idx) => ({
          ...question,
          index: idx
        }));
        
        setTestQuestions(questionsWithIndex);
        
        // Also set the questions in the form
        reset({ test_questions: questionsWithIndex });
      }
    } catch (error) {
      toast.error("Failed to fetch test questions");
      console.error(error);
    }

    setIsFetching(false);
  };

  useEffect(() => {
    fetchTestQuestions();
  }, [testid]);

  // Handle question changes without causing infinite loops
  const handleQuestionChange = useCallback((updatedQuestion) => {
    const { index } = updatedQuestion;

    console.log(updatedQuestion)
    
    // Update the test questions state for UI
    setTestQuestions(prevQuestions => {
      const newQuestions = [...prevQuestions];
      const existingIndex = newQuestions.findIndex(q => q.index === index);
      
      if (existingIndex !== -1) {
        newQuestions[existingIndex] = updatedQuestion;
      }
      
      return newQuestions;
    });
    
    // Update the form state for validation/submission
    const formQuestions = getValues().test_questions || [];
    const existingIndex = formQuestions.findIndex(q => q.index === index);
    
    if (existingIndex !== -1) {
      updateField(existingIndex, updatedQuestion);
    }
  }, [getValues, updateField]);

  if (isFetching) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoaderCircle className="animate-spin size-[14px]" />
      </div>
    );
  }

  return (
    <div>
      {/* {JSON.stringify(testQuestions)} */}
      <div className="w-full flex flex-col gap-[40px]">
        {testQuestions.map((test_question, i) => (
          <SetQuestionBox
            key={`question-${test_question.index || i}`}
            questionNumber={i + 1}
            initialData={test_question}
            onChange={handleQuestionChange}
            onDelete={() => removeQuestion(i)}
          />
        ))}
      </div>
      <AddQuestionButton onAdd={addQuestion} />
      {errors.test_questions && !fields.length && (
        <p className="text-sm text-red-500">
          {errors.test_questions.message ||
            "There's an issue with the questions list."}
        </p>
      )}
    </div>
  );
}

export default TestQuestion;