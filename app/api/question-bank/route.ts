import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { QuestionBank } from '@/types';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('question_bank')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('question_bank')
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { id, ...updateData } = await request.json();
  
  const { data, error } = await supabase
    .from('question_bank')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { id } = await request.json();
  
  const { error } = await supabase
    .from('question_bank')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
