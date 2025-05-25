import React, { useEffect, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  LoaderCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Hourglass,
} from "lucide-react";
import { useApiRequest } from "@/hooks/useApiRequest";
import MarkStudentBtn from "./MarkStudentBtn";
import MarkStudentRow from "./MarkStudentBtn";

const TestProgress = ({ testid }: { testid: string }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const { apiRequest } = useApiRequest();
  const [isLoading, setIsLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);

  const fetchTestProgress = async () => {
    setIsLoading(true);
    const data = await apiRequest(
      `/api/progress/${encodeURIComponent(testid)}`
    );
    if (data) {
      setProgressData(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTestProgress();
  }, [testid]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoaderCircle className="animate-spin size-[14px]" />
      </div>
    );
  }

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "patakingssed":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "in_progress":
        return <Hourglass className="w-4 h-4 text-orange-500" />;
      case "not_started":
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "passed":
        return "Passed";
      case "taking":
        return "Currently Taking";
      case "failed":
        return "Failed";
      case "in_progress":
        return "Awaiting Results";
      case "not_started":
        return "Not Started";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "passed":
        return "text-green-600 bg-green-50";
      case "taking":
        return "text-blue-600 bg-blue-50";
      case "failed":
        return "text-red-600 bg-red-50";
      case "in_progress":
        return "text-orange-600 bg-orange-50";
      case "not_started":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="overflow-x-auto">
      {/* {JSON.stringify(progressData)} */}
      <table className="w-full">
        <thead className="bg-zinc-50 whitespace-nowrap border-b border-zinc-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Test Group
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Candidates
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Completion Rate
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Pass Rate
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Results
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-zinc-200">
          {progressData.map((group) => (
            <React.Fragment key={group.id}>
              {/* Main Row */}
              <tr
                className="cursor-pointer transition-all duration-300 hover:bg-zinc-50"
                onClick={() => toggleRow(group.id)}
              >
                <td className="px-[8px] py-[8px] whitespace-nowrap">
                  <div className="flex items-center">
                    <button className="mr-2 p-1 hover:bg-zinc-200 rounded">
                      {expandedRows.has(group.id) ? (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                      )}
                    </button>
                    <div className="flex items-center">
                      {/* <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div> */}
                      <div>
                        <div className="text-sm font-medium text-zinc-900">
                          {group.name}
                        </div>
                        {(group.start_at || group.end_at) && (
                          <div className="text-xs text-zinc-500">
                            {group.start_at &&
                              new Date(group.start_at).toLocaleDateString()}
                            {group.start_at && group.end_at && " - "}
                            {group.end_at &&
                              new Date(group.end_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-[8px] py-[8px] whitespace-nowrap text-center">
                  <div className="text-sm font-medium text-zinc-900">
                    {group?.statistics?.totalCandidates ?? 0}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {group?.statistics?.candidatesWithAttempts ?? 0} active
                  </div>
                </td>
                <td className="px-[8px] py-[8px] whitespace-nowrap text-center">
                  <div className="text-sm font-medium text-zinc-900">
                    {group?.statistics?.completionRate ?? 0}%
                  </div>
                  <div className="text-xs text-zinc-500">
                    {group?.statistics?.finishedAttempts ?? 0} /{" "}
                    {group?.statistics?.totalAttempts ?? 0} attempts
                  </div>
                </td>
                <td className="px-[8px] py-[8px] whitespace-nowrap text-center">
                  <div className="text-sm font-medium text-zinc-900">
                    {group?.statistics?.passRate ?? 0}%
                  </div>
                  <div className="text-xs text-zinc-500">
                    of completed tests
                  </div>
                </td>
                <td className="px-[8px] py-[8px] whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-4 text-xs">
                    <span className="text-green-600 font-medium">
                      {group?.statistics?.passedAttempts ?? 0} passed
                    </span>
                    <span className="text-red-600 font-medium">
                      {group?.statistics?.failedAttempts ?? 0} failed
                    </span>
                  </div>
                </td>
              </tr>

              {/* Nested Rows */}
              {expandedRows.has(group.id) && (
                <tr>
                  <td colSpan="5" className="px-0 py-0">
                    <div className="bg-zinc-50 border-t border-zinc-100">
                      <div className="px-6 py-3">
                        <div className="text-[12px] text-zinc-500 uppercase tracking-wider mb-3">
                          Individual Candidate Progress
                        </div>
                        <div className="bg-white rounded-md overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-zinc-200 whitespace-nowrap">
                              <tr>
                                <th className="px-4 py-2 text-left text-[10px] font-[400] text-zinc-500 uppercase">
                                  Candidate Name
                                </th>
                                <th className="px-4 py-2 text-center text-[10px] font-[400] text-zinc-500 uppercase">
                                  Status
                                </th>
                                <th className="px-4 py-2 text-center text-[10px] font-[400] text-zinc-500 uppercase">
                                  Score
                                </th>
                                <th className="px-4 py-2 text-center text-[10px] font-[400] text-zinc-500 uppercase">
                                  Attempts
                                </th>
                                <th className="px-4 py-2 text-center text-[10px] font-[400] text-zinc-500 uppercase">
                                  Last Activity
                                </th>
                                <th className="px-4 py-2 text-center text-[10px] font-[400] text-zinc-500 uppercase">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <MarkStudentRow group={group} getStatusIcon={getStatusIcon} getStatusColor={getStatusColor} getStatusText={getStatusText} />
                          </table>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          {progressData.length === 0 && (
            <tr>
              <td
                colSpan="5"
                className="px-6 py-12 text-center text-sm text-zinc-500"
              >
                No test groups found for this test
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TestProgress;
