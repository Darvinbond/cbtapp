import React from "react";
import { Button } from "../ui/button";
import { Play } from "lucide-react";
import { useApiRequest } from "@/hooks/useApiRequest";

type Props = {
  candidateId: string;
  testId: string;
  setMarkingResult: React.Dispatch<React.SetStateAction<boolean>>;
};

function MarkStudentBtn({ candidateId, testId, setMarkingResult }: Props) {
  // thhsiwill call t h emark syduent endpoint anf it will also recieve n optional prop called onaftermark wihich is a function that will be called after marking
  const [markedSuccessfully, setMarkedSuccessfully] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { apiRequest } = useApiRequest();
  const markStudent = async () => {
    setLoading(true);
    const data = await apiRequest(
      `/api/mark/candidate/${testId}/${candidateId}`,
      {
        method: "POST",
      }
    );

    if (data?.success) {
      setMarkedSuccessfully(true);
      setMarkingResult(data);
    }
    setLoading(false);
  };
  return (
    <Button
      size={"sm"}
      variant={"outline"}
      isLoading={loading}
      onClick={markStudent}
      disabled={markedSuccessfully || loading}
    >
      <Play /> Evaluate
    </Button>
  );
}

// Each row
function MarkStudentRowEach({
  candidate,
  getStatusIcon,
  getStatusColor,
  getStatusText,
  group,
}: {
  candidate: any;
  getStatusIcon: any;
  getStatusColor: any;
  getStatusText: any;
  group: any;
}) {
  const [markingResult, setMarkingResult] = React.useState(false);
  return (
    <tr key={candidate.id} className="hover:bg-zinc-50">
      <td className="px-[8px] py-[8px] whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm font-medium text-zinc-700">
            {candidate.full_name}
          </span>
        </div>
      </td>
      <td className="px-[8px] py-[8px] text-center">
        <div className="flex items-center justify-center">
          {getStatusIcon(candidate.status)}
          <span
            className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(candidate.status)}`}
          >
            {getStatusText(candidate.status)}
          </span>
        </div>
      </td>
      <td className="px-[8px] py-[8px] text-center">
        <span className="text-sm font-medium text-zinc-900">
          {candidate.latestAttempt?.score ?? "-"}
          {/* {candidate.latestAttempt?.score && "/100"} */}
        </span>
      </td>
      <td className="px-[8px] py-[8px] text-center">
        <span className="text-sm text-zinc-600">
          {candidate.attempts?.length ?? 0}
        </span>
      </td>
      <td className="px-[8px] py-[8px] text-center">
        <span className="text-[12px] text-zinc-600">
          {candidate.latestAttempt?.started_at
            ? new Date(
                candidate.latestAttempt.started_at
              ).toLocaleDateString()
            : "-"}
        </span>
      </td>
      <td className="px-[8px] py-[8px] text-center">
        <MarkStudentBtn
          candidateId={candidate.id}
          testId={group?.test_id}
          setMarkingResult={setMarkingResult}
        />
      </td>
    </tr>
  );
}

function MarkStudentRow({
  group,
  getStatusIcon,
  getStatusColor,
  getStatusText,
}: {
  group: any;
  getStatusIcon: any;
  getStatusColor: any;
  getStatusText: any;
}) {
  return (
    <tbody className="divide-y whitespace-nowrap divide-zinc-200">
      {group?.candidates?.map((candidate: any, index: number) => (
        <MarkStudentRowEach
          key={index}
          group={group}
          candidate={candidate}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />
      ))}
      {(!group?.candidates || group.candidates.length === 0) && (
        <tr>
          <td
            colSpan="5"
            className="px-4 py-8 text-center text-sm text-zinc-500"
          >
            No candidates in this group yet
          </td>
        </tr>
      )}
    </tbody>
  );
}

export default MarkStudentRow;
