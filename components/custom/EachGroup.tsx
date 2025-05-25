import React, { useCallback, useEffect, useState } from "react";
import FormContainer, { FormContainerSideBySide } from "./FormContainer";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  CornerDownLeft,
  FileSpreadsheet,
  LoaderCircle,
  Plus,
  Trash,
} from "lucide-react";
import * as XLSX from "xlsx";
import * as yup from "yup";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Badge } from "../ui/badge";
import { useApiRequest } from "@/hooks/useApiRequest";

const groupSchema = yup.object({
  id: yup.string().optional(),
  name: yup.string().required("Text is required").trim(),
  test_id: yup.string().required("Text is required").trim(),
});

const groupCandidateSchema = yup.object({
  data: yup.array().of(
    yup.object({
      id: yup.string().optional(),
      full_name: yup.string().required("Full name is required").trim(),
      test_group_id: yup.string().required("Test group id is required").trim(),
    })
  ),
});

function EachGroup({
  group,
  RemoveGroup,
}: {
  group: any;
  RemoveGroup: () => void;
}) {
  const { apiRequest } = useApiRequest();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [groupID, setGroupID] = useState(group.id ?? null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isFetchingCandidates, setIsFetchingCandidates] = useState(false);

  const formFunctions = useForm<any>({
    resolver: yupResolver(groupSchema),
    defaultValues: group,
  });

  const {
    register,
    reset,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = formFunctions;

  const {
    getValues: candidateGetValues,
    setValue: candidateSetValue,
    watch: candidateWatch,
    formState: {
      errors: candidateErrors,
      isDirty: candidateIsDirty,
      isValid: candidateIsValid,
    },
  } = useForm<any>({
    resolver: yupResolver(groupCandidateSchema),
    defaultValues: { data: [] },
  });

  const onSubmitSaveGroup = async () => {
    setIsSaving(true);

    const data = await apiRequest(
      `/api/test-groups/${encodeURIComponent(group.test_id)}`,
      {
        method: groupID ? "PUT" : "POST",
        body: {
          ...getValues(),
        },
      }
    );

    if (data) {
      setGroupID(data.id);
      setValue("id", data.id);
      candidateSetValue(
        "data",
        candidateWatch("data").map((item: any) => ({
          ...item,
          test_group_id: data.id,
        }))
      );

      if (candidateGetValues("data").length > 0) {
        await onSubmitSaveGroupCandidate();
      }
    }

    setIsSaving(false);
  };

  const onSubmitSaveGroupCandidate = async () => {
    setIsSaving(true);

    const data = await apiRequest(
      `/api/candidates/${encodeURIComponent(group.test_id)}`,
      {
        method: "POST",
        body: {
          arrayData: candidateGetValues().data,
        },
      }
    );

    setIsSaving(false);
  };

  const fetchCandidate = useCallback(async (gid: string) => {
    setIsFetchingCandidates(true);
    const data = await apiRequest(
      `/api/candidate-test/${encodeURIComponent(group.test_id)}/${encodeURIComponent(gid)}`
    );

    console.log(data);

    if (data) {
      setCandidates(data);
    }

    setIsFetchingCandidates(false);
  }, []);

  const deleteGroup = async () => {
    if (!groupID) {
      RemoveGroup();
      return;
    }
    setIsDeleting(true);

    const data = await apiRequest(
      `/api/test-groups/${encodeURIComponent(group.test_id)}`,
      {
        method: "DELETE",
        body: {
          id: groupID,
        },
      }
    );

    if (data) {
      RemoveGroup();
    }

    setIsDeleting(false);
  };

  const onError = (err: any) => {
    console.log(err);
  };

  useEffect(() => {
    if (groupID) {
      fetchCandidate(groupID);
    }
  }, [groupID]);

  return (
    <FormContainerSideBySide
      custom_label={
        <>
          <FormContainer label="Group Name">
            <Input
              type="text"
              placeholder="Group 1 candidates"
              {...register("name")}
            />
          </FormContainer>
        </>
      }
    >
      <div className="space-y-6">
        {groupID &&
          (isFetchingCandidates ? (
            <LoaderCircle className="animate-spin size-[14px]" />
          ) : (
            <Badge
              className="font-[400] select-none"
              variant={"outline"}
            >{`${candidates.length} candidates`}</Badge>
          ))}
        <FormContainer label="Select group file">
          {/* on capture .xlsx file it gets all teh values in teh firs column and store it in an array */}
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const data = new Uint8Array(
                    event.target?.result as ArrayBuffer
                  );
                  const workbook = XLSX.read(data, { type: "array" });
                  const firstSheetName = workbook.SheetNames[0];
                  const worksheet = workbook.Sheets[firstSheetName];
                  const rows = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                  });

                  // rows is an array of arrays; each inner array is a row
                  // Now pick only first column values, skip empty
                  const firstColValues = rows
                    .map((row: any) => row[0])
                    .filter(
                      (val) =>
                        val !== undefined &&
                        val !== null &&
                        String(val).trim() !== ""
                    )
                    .map((val: any) => ({
                      full_name: val,
                      test_group_id: watch("id") ?? undefined,
                    }));

                  candidateSetValue("data", [
                    ...candidateGetValues("data"),
                    ...firstColValues,
                  ]);

                  //   console.log(firstColValues);
                };
                reader.readAsArrayBuffer(file);
              }
            }}
          />
        </FormContainer>
        <div className="flex items-center justify-end gap-[8px]">
          <Button isLoading={isDeleting} size="icon" variant="destructive" onClick={deleteGroup}>
            <Trash />
          </Button>
          {/* On click, it prepapared a .xlsx file with the first columnbeing the student fullname andn the second being the access code and downloads it */}
          {groupID && candidates.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const workbook = XLSX.utils.book_new();
                const worksheet = XLSX.utils.json_to_sheet(
                  candidates.map((candidate: any) => ({
                    "Candidate fullname": candidate.candidates.full_name,
                    "Access code": candidate.access_code,
                  }))
                );
                XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
                XLSX.writeFile(workbook, "access_codes.xlsx");
              }}
            >
              <FileSpreadsheet />
              Access codes
            </Button>
          )}
          <Button
            onClick={handleSubmit(onSubmitSaveGroup, onError)}
            variant="secondary"
            size="sm"
            isLoading={isSaving}
          >
            <CornerDownLeft />
            Save
          </Button>
        </div>
      </div>
    </FormContainerSideBySide>
  );
}

function GroupList({ testID }: { testID: string }) {
  const { apiRequest } = useApiRequest();
  const [group, setGroup] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const addNewGroup = () => {
    const newGroup = {
      test_id: testID,
      name: "New Group",
    };
    setGroup((prev: any) => [...prev, newGroup]);
  };

  const fetchTestGroup = useCallback(async () => {
    const data = await apiRequest(
      `/api/test-groups/${encodeURIComponent(testID)}`
    );

    if (data) {
      setGroup(data);
    }

    setIsFetching(false);
  }, [testID]);

  useEffect(() => {
    fetchTestGroup();
  }, [testID]);

  if (isFetching) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoaderCircle className="animate-spin size-[14px]" />
      </div>
    );
  }

  const RemoveGroup = (index: number) => {
    const newGroup = [...group];
    newGroup.splice(index, 1);
    setGroup(newGroup);
  };

  return (
    <div className="flex flex-col gap-[32px]">
      <Button size={"sm"} className="ml-auto" onClick={addNewGroup}>
        <Plus /> New group
      </Button>
      <div className="flex flex-col gap-[32px]">
        {group.map((item: any, index: number) => (
          <EachGroup
            RemoveGroup={() => RemoveGroup(index)}
            group={item}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

export default GroupList;
