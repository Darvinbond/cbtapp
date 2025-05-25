import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { TestGroup, TestQuestion } from "@/types";
import { api } from '@/utils/apiResponse';

interface Params {
  testid: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  const { testid } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("test_questions")
    .select("*")
    .eq("test_id", testid)
    .order("id", { ascending: false });

  if (error) {
    return api.error(error.message);
  }
  return api.ok(data as TestQuestion[]);
}

export async function POST(request: Request, { params }: { params: Params }) {
  const { testid } = await params;
  const supabase = await createClient();
  const body = await request.json();

  // first fof all delelte all test_questions that belong to this test then add teh ne wincoming ones
  const { error: deleteError } = await supabase
    .from("test_questions")
    .delete()
    .eq("test_id", testid);

  if (deleteError) {
    return api.error(deleteError.message);
  }

  const { data, error } = await supabase
    .from("test_questions")
    .insert([...body])
    .eq("test_id", testid)
    .select();

  if (error) {
    return api.error(error.message);
  }
  return api.ok(data as TestQuestion[], "Questions added successfully");
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { id, ...updateData } = await request.json();

  const { data, error } = await supabase
    .from("test_groups")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return api.error(error.message);
  }
  return api.ok(data as TestGroup);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { id } = await request.json();

  const { error } = await supabase.from("test_groups").delete().eq("id", id);

  if (error) {
    return api.error(error.message);
  }
  return api.ok({ success: true });
}
