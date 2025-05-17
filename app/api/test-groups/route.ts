import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { TestGroup } from '@/types';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('test_groups')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data as TestGroup[]);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('test_groups')
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data as TestGroup, { status: 201 });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { id, ...updateData } = await request.json();
  
  const { data, error } = await supabase
    .from('test_groups')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data as TestGroup);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { id } = await request.json();
  
  const { error } = await supabase
    .from('test_groups')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
