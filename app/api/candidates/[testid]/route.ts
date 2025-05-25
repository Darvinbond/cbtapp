// app/api/candidates/[testid]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { api } from '@/utils/apiResponse';

export async function GET(
  request: NextRequest,
  { params }: { params: { testid: string } }
) {
  const { testid } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('candidates')
    .select(`
      *,
      test_groups!inner( id )
    `)
    .eq('test_groups.test_id', testid)
    .order('created_at', { ascending: false });

  if (error) {
    return api.error(error.message);
  }
  return api.ok(data);
}

export async function POST(request: NextRequest,
    { params }: { params: { testid: string } }
  ) {
    const { testid } = await params;
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
            test_id: testid,
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