import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { TestGroup } from "@/types";
import { api } from '@/utils/apiResponse';

interface Params {
  testid: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  const { testid } = params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("test_groups")
    .select("*")
    .eq("test_id", testid)
    .order("id", { ascending: false });

  if (error) {
    return api.error(error.message);
  }
  return api.ok(data as TestGroup[]);
}

export async function POST(request: Request, { params }: { params: Params }) {
  const { testid } = params;
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("test_groups")
    .insert([body])
    .select()
    .single();

  if (error) {
    return api.error(error.message);
  }
  return api.created(data as TestGroup, "Group created successfully");
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
  return api.ok(data as TestGroup, "Group updated successfully");
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { id } = await request.json();

  const { error: error2 } = await supabase.from("candidates").delete().eq("test_group_id", id);
  const { error } = await supabase.from("test_groups").delete().eq("id", id);

  if (error || error2) {
    return api.error(error?.message || error2?.message);
  }
  return api.ok({ success: true }, "Group deleted successfully");
}
