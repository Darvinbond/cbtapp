"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Plus, Search } from "lucide-react";
import TestCard from "@/components/custom/TestCard";
import { CreateTestDialog } from "@/components/custom/CreateTestDialog";
import Image from "next/image";
import Banner from "@/assets/banner.jpg";
import { useApiRequest } from "@/hooks/useApiRequest";
import { LoadingOverlay } from "@/components/custom/LoadingOverlay";

interface Test {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export default function TestList() {
  const { apiRequest } = useApiRequest();
  const [isListView, setIsListView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      const data = await apiRequest("/api/tests");
      if (data) {
        setTests(data);
      }
      setIsLoading(false);
    };

    fetchTests();
  }, []);

  const filteredTests = tests.filter(
    (test) =>
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="w-full flex flex-col justify-start items-center space-y-6">
        <div className="w-full relative h-[250px]">
          <Image
            src={Banner}
            alt="banner"
            width={1000}
            height={240}
            className="w-full h-full object-cover"
          />
          <div className="absolute bg-gradient-to-b from-transparent to-white dbg-black/20 inset-0 flex items-center justify-center w-full h-full">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search tests"
                className="pl-9 rounded-[12px] h-[40px] dshadow-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="sm:max-w-6xl w-full px-[16px] mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-md border bg-white">
                <Button
                  variant="ghost"
                  size="icon"
                  className={!isListView ? "bg-zinc-100" : ""}
                  onClick={() => setIsListView(false)}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={isListView ? "bg-zinc-100" : ""}
                  onClick={() => setIsListView(true)}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <CreateTestDialog />
            </div>
          </div>

          <div
            className={`${
              isListView
                ? "space-y-3"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            }`}
          >
            {filteredTests.map((test) => (
              <TestCard key={test.id} {...test} isListView={isListView} />
            ))}
          </div>

          {!isLoading && filteredTests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500">No tests found</p>
            </div>
          )}
        </div>
      </div>
      <LoadingOverlay isLoading={isLoading} message="Fetching past tests" />
    </>
  );
}
