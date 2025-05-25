import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { Attempt } from '@/types';
import { api } from '@/utils/apiResponse';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return api.error(error.message);
  }
  return api.ok(data as Attempt[]);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('attempts')
    .insert([body])
    .select()
    .single();

  if (error) {
    return api.error(error.message);
  }
  return api.ok(data as Attempt);
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { id, ...updateData } = await request.json();
  
  const { data, error } = await supabase
    .from('attempts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return api.error(error.message);
  }
  return api.ok(data as Attempt);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { id } = await request.json();
  
  const { error } = await supabase
    .from('attempts')
    .delete()
    .eq('id', id);

  if (error) {
    return api.error(error.message);
  }
  return api.ok({ success: true });
}
