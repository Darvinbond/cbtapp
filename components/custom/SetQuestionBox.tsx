// "use client";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { PlusIcon, Trash, Trash2, XIcon } from "lucide-react";
// import { ValidationMessage } from "./ValidationBubble";
// import { Input } from "../ui/input";
// import { cn } from "@/lib/utils";
// import * as yup from "yup";
// import { useFieldArray, useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useApiRequest } from "@/hooks/useApiRequest";
// import { useEffect } from "react";

// type QuestionType = "one" | "many" | "short";

// export const DEFAULT_QUESTION_DATA: QuestionData = {
//   text: "",
//   question_type: "one",
//   options: [""],
//   answer: [],
//   metadata: {},
// };
// interface QuestionData {
//   text: string;
//   question_type: QuestionType;
//   options: string[];
//   answer: string[];
//   metadata: Record<string, any>;
// }

// interface SetQuestionBoxProps {
//   questionNumber: number;
//   initialData: any;
//   onChange: (data: any) => void;
//   onDelete?: () => void;
// }

// export const questionSchema = yup.object({
//   text: yup.string().required("Text is required").trim(),
//   question_type: yup
//     .mixed<"one" | "many" | "short">()
//     .oneOf(["one", "many", "short"], "Invalid question type")
//     .required("Question type is required"),
//   options: yup
//     .array()
//     .of(yup.string().required("Option text cannot be empty"))
//     .required()
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

// export default function SetQuestionBox({
//   questionNumber,
//   initialData,
//   onChange,
//   onDelete,
// }: SetQuestionBoxProps) {
//   const {
//     control,
//     reset,
//     setValue,
//     watch,
//     getValues,
//     formState: { errors, isDirty, isValid },
//   } = useForm({
//     resolver: yupResolver(testQuestionSchema),
//   });

//   const addOption = () => {
//     const newOptions = [...watch("question.options"), ""];
//     setValue("question.options", newOptions);
//     // onChange?.({ ...getValues(), options: newOptions });
//   };

//   const removeOption = (index: number) => {
//     if (getValues("question.options").length > 1) {
//       const newOptions = getValues("question.options").filter((_, i) => i !== index);
//       setValue("question.options", newOptions);
//       // onChange({ ...getValues(), options: newOptions });
//     }
//   };

//   const addAnswer = () => {
//     const newAnswers = [...getValues("question.answer"), ""];
//     setValue("question.answer", newAnswers);
//     // onChange?.({ ...getValues(), answer: newAnswers });
//   };

//   const removeAnswer = (index: number) => {
//     if (getValues("question.answer").length > 1) {
//       const newAnswers = getValues("question.answer").filter(
//         (_, i: number) => i !== index
//       );
//       setValue("question.answer", newAnswers);
//       // onChange?.({ ...getValues(), answer: newAnswers });
//     }
//   };

//   const watchedFields = watch(['question.text', 'question.question_type', 'question.options', 'question.answer']);

//   useEffect(() => {
//     onChange?.(getValues())
//   }, [watchedFields])
  

//   useEffect(() => {
//     if (initialData) {
//       console.log(initialData)
//       reset(initialData);
//     }
//   }, [initialData]);

//   // return (
//   //   <>{JSON.stringify(watch("question.options"))}<br /><hr /><br /></>
//   // )

//   return (
//     <Card
//       className={cn(
//         `w-full rounded-[12px] shadow-lg max-w-3xl overflow-hidden d!px-[24px] d!py-[40px]`,
//         !isValid
//           ? "ring-red-400 ring-[2px] shadow-red-100 border-red-600"
//           : "dshadow-none"
//       )}
//     >
//       <CardHeader className="flex-row h-[48px] bg-zinc-100 border-b !py-0 flex items-center justify-between gap-4">
//         <div className="flex-none flex items-center justify-center h-max w-max py-[4px] text-[12px] px-[12px] rounded-[8px] bg-white text-zinc-800">
//           Question {questionNumber}
//         </div>
//         <div className="flex items-center justify-end gap-[16px]">
//           <Input
//             // check for Nan dont send Nan values
//             onChange={(e) => setValue("points", parseInt(e.target.value))}
//             value={watch("points") || 1}
//             placeholder="Points"
//             className="w-[88px]"
//             type="number"
//           />
//           <Button onClick={onDelete} variant="destructive" size="icon">
//             <Trash />
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-4 !py-[16px] px-[24px]">
//         <div className="flex-1">
//           <textarea
//             value={watch("question.text")}
//             placeholder="Enter your question here..."
//             onChange={(e) => {
//               setValue("question.text", e.target.value);
//             }}
//             className="h-[80px] border-0 ring-0 outline-none w-full"
//           />
//           {/* <QuestionEditor
//             namespaceId={questionNumber.toString()}
//             value={initialData.text}
//             onChange={(value) => {
//               if (onChange) {
//                 onChange({ ...initialData, text: value });
//               }
//             }}
//           /> */}
//         </div>
//         <div className="flex items-start justify-end">
//           <Select
//             value={watch("question.question_type")}
//             onValueChange={(value: QuestionType) =>
//               setValue("question.question_type", value)
//             }
//           >
//             <SelectTrigger className="w-max h-[28px]">
//               <SelectValue placeholder="Select question type" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="one">Single Choice</SelectItem>
//               <SelectItem value="many">Multiple Choice</SelectItem>
//               <SelectItem value="short">Short Answer</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-3">
//           {watch("question.question_type") === "short"
//             ? // Render answers for 'short' type
//               watch("question.answer").map((answer: string, index: number) => (
//                 <div
//                   key={index}
//                   className="flex items-center py-[8px] border-b focus-within:border-b-zinc-800 transition-all duration-500 text-[14px] gap-3"
//                 >
//                   <input
//                     type="text"
//                     value={answer}
//                     onChange={(e) =>
//                       setValue(`question.answer.${index}`, e.target.value)
//                     }
//                     className="flex-1 bg-transparent outline-none"
//                     placeholder="Enter correct answer"
//                   />
//                   {watch("question.answer").length > 1 && (
//                     <XIcon
//                       onClick={() => removeAnswer(index)}
//                       className="size-[14px] cursor-pointer text-zinc-400 hover:text-zinc-600"
//                     />
//                   )}
//                 </div>
//               ))
//             : // Render options for 'one' and 'many' types
//               (watch("question.options") || []).map((item: string, index: number) => (
//                 <div
//                   key={index}
//                   className="flex items-center py-[8px] border-b focus-within:border-b-zinc-800 transition-all duration-500 text-[14px] gap-3"
//                 >
//                   <input
//                     type={
//                       watch("question.question_type") === "one" ? "radio" : "checkbox"
//                     }
//                     name={`question-${questionNumber}`}
//                     className="h-4 w-4"
//                     disabled={!item.trim()}
//                     checked={watch("question.answer").includes(item)}
//                     onChange={(e) => {
//                       const newAnswers =
//                         watch("question.question_type") === "one"
//                           ? [item] // For radio, replace the entire answer array
//                           : (watch("question.answer") || []).includes(item)
//                             ? (watch("question.answer") || []).filter(
//                                 (a: string) => a !== item
//                               ) // Remove if already selected
//                             : [...(watch("question.answer") || []), item]; // Add if not selected
//                       setValue("question.answer", newAnswers);
//                     }}
//                   />
//                   <input
//                     type="text"
//                     value={item}
//                     onChange={(e) =>
//                       setValue(`question.options.${index}`, e.target.value)
//                     }
//                     className="flex-1 bg-transparent outline-none"
//                     placeholder={`Option ${index + 1}`}
//                   />
//                   {watch("question.options").length > 1 && (
//                     <XIcon
//                       onClick={() => removeOption(index)}
//                       className="size-[14px] cursor-pointer text-zinc-400 hover:text-zinc-600"
//                     />
//                   )}
//                 </div>
//               ))}

//           <Button
//             variant="link"
//             className="ml-auto"
//             onClick={
//               watch("question.question_type") === "short" ? addAnswer : addOption
//             }
//           >
//             <PlusIcon />
//             Add{" "}
//             {watch("question.question_type") === "short"
//               ? "alternative answer"
//               : "option"}
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }



"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, Trash, Trash2, XIcon } from "lucide-react";
import { ValidationMessage } from "./ValidationBubble";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import * as yup from "yup";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useApiRequest } from "@/hooks/useApiRequest";
import { useEffect, useRef } from "react";

type QuestionType = "one" | "many" | "short";

export const DEFAULT_QUESTION_DATA: QuestionData = {
  text: "",
  question_type: "one",
  options: [""],
  answer: [],
  metadata: {},
};
interface QuestionData {
  text: string;
  question_type: QuestionType;
  options: string[];
  answer: string[];
  metadata: Record<string, any>;
}

interface SetQuestionBoxProps {
  questionNumber: number;
  initialData: any;
  onChange: (data: any) => void;
  onDelete?: () => void;
}

export const questionSchema = yup.object({
  text: yup.string().required("Text is required").trim(),
  question_type: yup
    .mixed<"one" | "many" | "short">()
    .oneOf(["one", "many", "short"], "Invalid question type")
    .required("Question type is required"),
  options: yup
    .array()
    .of(yup.string().required("Option text cannot be empty"))
    .min(2, "At least two options are required")
    .required()
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
    .min(1, "At least one answer is required")
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

export default function SetQuestionBox({
  questionNumber,
  initialData,
  onChange,
  onDelete,
}: SetQuestionBoxProps) {
  const {
    control,
    reset,
    setValue,
    watch,
    getValues,
    trigger,
    formState: { errors, isDirty, isValid },
  } = useForm({
    resolver: yupResolver(testQuestionSchema),
    // set to validate onchange
    mode: "onChange",
    defaultValues: initialData,
  });

  // Use a ref to track if we need to update the parent
  const shouldUpdateParent = useRef(false);

  const addOption = () => {
    const newOptions = [...watch("question.options"), ""];
    setValue("question.options", newOptions);
    shouldUpdateParent.current = true;
  };

  const removeOption = (index: number) => {
    if (getValues("question.options").length > 1) {
      const newOptions = getValues("question.options").filter((_, i) => i !== index);
      setValue("question.options", newOptions);
      shouldUpdateParent.current = true;
    }
  };

  const addAnswer = () => {
    const newAnswers = [...getValues("question.answer"), ""];
    setValue("question.answer", newAnswers);
    shouldUpdateParent.current = true;
  };

  const removeAnswer = (index: number) => {
    if (getValues("question.answer").length > 1) {
      const newAnswers = getValues("question.answer").filter(
        (_, i: number) => i !== index
      );
      setValue("question.answer", newAnswers);
      shouldUpdateParent.current = true;
    }
  };

  // This effect is for form changes
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      console.log(value, name, type, shouldUpdateParent)
      // const isVal = trigger()

      // console.log(isVal)
      if (shouldUpdateParent.current) {
        onChange?.(getValues());
        shouldUpdateParent.current = false;
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch, onChange, getValues]);

  // This effect is only for initial data
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  return (
    <Card
      className={cn(
        "w-full rounded-[12px] shadow-lg max-w-3xl overflow-hidden",
        !isValid
          ? "ring-red-400 ring-[2px] shadow-red-100 border-red-600"
          : "shadow-none"
      )}
    >
      <CardHeader className="flex-row h-[48px] bg-zinc-100 border-b !py-0 flex items-center justify-between gap-4">
        <div className="flex-none flex items-center justify-center h-max w-max py-[4px] text-[12px] px-[12px] rounded-[8px] bg-white text-zinc-800">
          Question {questionNumber}
        </div>
        <div className="flex items-center justify-end gap-[16px]">
          <Input
            // check for Nan dont send Nan values
            onChange={(e) => {
              setValue("points", parseInt(e.target.value));
              shouldUpdateParent.current = true;
            }}
            value={watch("points") || 1}
            placeholder="Points"
            className="w-[88px]"
            type="number"
          />
          <Button onClick={onDelete} variant="destructive" size="icon">
            <Trash />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 !py-[16px] px-[24px]">
        <div className="flex-1">
          <textarea
            value={watch("question.text")}
            placeholder="Enter your question here..."
            onChange={(e) => {
              setValue("question.text", e.target.value);
              shouldUpdateParent.current = true;
            }}
            className="h-[80px] border-0 ring-0 outline-none w-full"
          />
        </div>
        <div className="flex items-start justify-end">
          <Select
            value={watch("question.question_type")}
            onValueChange={(value: QuestionType) => {
              setValue("question.question_type", value);
              shouldUpdateParent.current = true;
            }}
          >
            <SelectTrigger className="w-max h-[28px]">
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
          {watch("question.question_type") === "short"
            ? // Render answers for 'short' type
              watch("question.answer").map((answer: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center py-[8px] border-b focus-within:border-b-zinc-800 transition-all duration-500 text-[14px] gap-3"
                >
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => {
                      setValue(`question.answer.${index}`, e.target.value);
                      shouldUpdateParent.current = true;
                    }}
                    className="flex-1 bg-transparent outline-none"
                    placeholder="Enter correct answer"
                  />
                  {watch("question.answer").length > 1 && (
                    <XIcon
                      onClick={() => removeAnswer(index)}
                      className="size-[14px] cursor-pointer text-zinc-400 hover:text-zinc-600"
                    />
                  )}
                </div>
              ))
            : // Render options for 'one' and 'many' types
              (watch("question.options") || []).map((item: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center py-[8px] border-b focus-within:border-b-zinc-800 transition-all duration-500 text-[14px] gap-3"
                >
                  <input
                    type={
                      watch("question.question_type") === "one" ? "radio" : "checkbox"
                    }
                    name={`question-${questionNumber}`}
                    className="h-4 w-4"
                    disabled={!item.trim()}
                    checked={watch("question.answer").includes(item)}
                    onChange={(e) => {
                      const newAnswers =
                        watch("question.question_type") === "one"
                          ? [item] // For radio, replace the entire answer array
                          : (watch("question.answer") || []).includes(item)
                            ? (watch("question.answer") || []).filter(
                                (a: string) => a !== item
                              ) // Remove if already selected
                            : [...(watch("question.answer") || []), item]; // Add if not selected
                      setValue("question.answer", newAnswers);
                      shouldUpdateParent.current = true;
                    }}
                  />
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      setValue(`question.options.${index}`, e.target.value);
                      shouldUpdateParent.current = true;
                    }}
                    className="flex-1 bg-transparent outline-none"
                    placeholder={`Option ${index + 1}`}
                  />
                  {watch("question.options").length > 1 && (
                    <XIcon
                      onClick={() => removeOption(index)}
                      className="size-[14px] cursor-pointer text-zinc-400 hover:text-zinc-600"
                    />
                  )}
                </div>
              ))}

          <Button
            variant="link"
            className="ml-auto"
            onClick={
              watch("question.question_type") === "short" ? addAnswer : addOption
            }
          >
            <PlusIcon />
            Add{" "}
            {watch("question.question_type") === "short"
              ? "alternative answer"
              : "option"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}