import React, { useCallback, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import FormContainer, { FormContainerSideBySide } from "./FormContainer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CornerDownLeft, LoaderCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useApiRequest } from "@/hooks/useApiRequest";

type TestSettingsForm = {
  name: string;
  description: string;
  max_score: number;
  pass_score: number;
  time_limit_minutes: number | null;
  question_per_candidate: number;
};

const schema = yup
  .object({
    name: yup.string().required("Test name is required"),
    description: yup
      .string()
      .max(500, "Description can’t be longer than 500 characters")
      .required("Description is required"),
    max_score: yup
      .number()
      .typeError("Max score must be a number")
      .positive("Max score must be > 0")
      .integer("Max score must be a whole number")
      .required("Max score is required"),
    pass_score: yup
      .number()
      .typeError("Pass score must be a number")
      .min(0, "Pass score can’t be negative")
      .integer("Pass score must be a whole number")
      .required("Pass score is required")
      .test(
        "lte-max",
        "Pass score can’t be greater than Max score",
        function (value) {
          const { max_score } = this.parent;
          return (
            value === undefined || max_score === undefined || value <= max_score
          );
        }
      ),
    time_limit_minutes: yup
      .number()
      .typeError("Time limit must be a number")
      .integer("Time limit must be a whole number")
      .positive("Time limit must be > 0")
      .nullable()
      .transform((v, o) => (o === "" ? null : v)), // allow empty field
    question_per_candidate: yup
      .number()
      .typeError("Question per candidate must be a number")
      .integer("Question per candidate must be a whole number")
      .positive("Question per candidate must be > 0")
      .required("Question per candidate is required"),
  })
  .required();

function TestSettings({ test_id }: { test_id: string }) {
  const { apiRequest } = useApiRequest();
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleSave = async (values: any) => {
    setIsSaving(true);
    const data = await apiRequest(`/api/tests/${encodeURIComponent(test_id)}`, {
      method: "PUT",
      body: {
        ...values,
      },
    });

    setIsSaving(false);
  };

  const fetchTestData = useCallback(async () => {
    const data = await apiRequest(`/api/tests/${encodeURIComponent(test_id)}`);
    if (data) {
      reset(data);
    }
    setIsFetching(false);
  }, []);

  const onError = (err: any) => {
    console.log(err);
  };

  useEffect(() => {
    fetchTestData();
  }, [test_id]);

  if (isFetching) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoaderCircle className="animate-spin size-[14px]" />
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-[32px]"
      onSubmit={handleSubmit(handleSave)}
      noValidate
    >
      <FormContainerSideBySide
        label="Public Information"
        description="Candidates will see this"
      >
        <div className="space-y-6">
          <FormContainer label="Test Name">
            <Input
              type="text"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </FormContainer>

          <FormContainer label="Test Description">
            <Textarea
              {...register("description")}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </FormContainer>
        </div>
      </FormContainerSideBySide>

      <FormContainerSideBySide
        label="Marking Configurations"
        description="Used to evaluate each candidate"
      >
        <div className="space-y-6">
          <FormContainer label="Max Score">
            <Input
              type="number"
              {...register("max_score", { valueAsNumber: true })}
              className={errors.max_score ? "border-red-500" : ""}
            />
          </FormContainer>

          <FormContainer label="Pass Score">
            <Input
              type="number"
              {...register("pass_score", { valueAsNumber: true })}
              className={errors.pass_score ? "border-red-500" : ""}
            />
          </FormContainer>
        </div>
      </FormContainerSideBySide>

      <FormContainerSideBySide label="Other Information">
        <div className="space-y-6">
          <FormContainer label="Time Limit (minutes)">
            <Input
              type="number"
              {...register("time_limit_minutes", { valueAsNumber: true })}
              className={errors.time_limit_minutes ? "border-red-500" : ""}
            />
          </FormContainer>

          <FormContainer label="Question Per Candidate">
            <Input
              type="number"
              {...register("question_per_candidate", { valueAsNumber: true })}
              className={errors.question_per_candidate ? "border-red-500" : ""}
            />
          </FormContainer>
        </div>
      </FormContainerSideBySide>

      <Button isLoading={isSaving} className="ml-auto">
        <CornerDownLeft />
        Save
      </Button>
    </form>
  );
}

export default TestSettings;
