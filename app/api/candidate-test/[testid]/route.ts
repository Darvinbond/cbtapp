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
    .from('candidate_tests')
    .select(`
      *,
      candidates!inner( full_name )
    `)
    .eq('test_id', testid)
    .order('created_at', { ascending: false });

  if (error) {
    return api.error(error.message);
  }
  return api.ok(data);
}