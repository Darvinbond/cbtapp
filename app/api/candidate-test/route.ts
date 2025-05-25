import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { CandidateTest } from '@/types';
import { Params } from 'next/dist/server/request/params';
import { api } from '@/utils/apiResponse';

export async function GET(request: Request, { params }: { params: Params }) {
  const { testid } = params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('candidate_tests')
    .select('*')
    .eq('test_id', testid)
    .order('created_at', { ascending: false });

  if (error) {
    return api.error(error.message);
  }
  return api.ok(data as CandidateTest[]);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('candidate_tests')
    .insert([body])
    .select()
    .single();

  if (error) {
    return api.error(error.message);
  }
  return api.ok(data as CandidateTest);
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { id, ...updateData } = await request.json();
  
  const { data, error } = await supabase
    .from('candidate_tests')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return api.error(error.message);
  }
  return api.ok(data as CandidateTest);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { id } = await request.json();
  
  const { error } = await supabase
    .from('candidate_tests')
    .delete()
    .eq('id', id);

  if (error) {
    return api.error(error.message);
  }
  return api.ok({ success: true });
}
