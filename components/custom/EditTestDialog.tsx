"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import FormContainer from "./FormContainer";

export function EditTest() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    max_score: 100,
    pass_score: 50,
    time_limit_minutes: 60 as number | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create test");
      }

      const data = await response.json();
      router.push(`/test/${data.id}`);
    } catch (error) {
      console.error("Error creating test:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormContainer label="Test Information">
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter test name"
          required
        />
      </FormContainer>
      <FormContainer label="Description">
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Enter test description"
          className="h-[200px]"
        />
      </FormContainer>
        <FormContainer label="Maximum Score">
          <Input
            id="max_score"
            type="number"
            value={formData.max_score}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                max_score: parseInt(e.target.value),
              }))
            }
            required
          />
        </FormContainer>
        <FormContainer label="Pass Score">
          <Input
            id="pass_score"
            type="number"
            value={formData.pass_score}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                pass_score: parseInt(e.target.value),
              }))
            }
            required
          />
        </FormContainer>
      <FormContainer label="Time">
        <Input
          id="time_limit_minutes"
          type="number"
          value={formData.time_limit_minutes || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              time_limit_minutes: e.target.value
                ? parseInt(e.target.value)
                : null,
            }))
          }
          placeholder="Optional"
        />
      </FormContainer>
    </form>
  );
}
