import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { Candidate } from "@/types";
import { api } from '@/utils/apiResponse';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return api.error(error.message);
  }
  return api.ok(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { arrayData } = await request.json();

  const { data, error } = await supabase
    .from("candidates")
    .insert(arrayData)
    .select();

  if (error) {
    return api.error(error.message);
  } else {
    const { data: candidateTestsData, error: candidateTestsError } =
      await supabase
        .from("candidate_tests")
        .insert(
          data.map((candidate: any) => ({
            candidate_id: candidate.id,
            test_id: candidate.test_id,
            access_code: Math.random().toString(36).slice(2, 10).toUpperCase(),
          }))
        )
        .select();

    if (candidateTestsError) {
      await supabase
        .from("candidates")
        .delete()
        .in(
          "id",
          data.map((candidate: any) => candidate.id)
        );
      return api.error(candidateTestsError.message);
    }
    return api.ok(candidateTestsData);
  }
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { id, ...updateData } = await request.json();

  const { data, error } = await supabase
    .from("candidates")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return api.error(error.message);
  }

  return api.ok(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { id } = await request.json();

  const { error } = await supabase.from("candidates").delete().eq("id", id);

  if (error) {
    return api.error(error.message);
  }
  return api.ok({ success: true });
}
