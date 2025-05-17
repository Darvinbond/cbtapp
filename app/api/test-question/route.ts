import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { TestQuestion } from '@/types';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const testId = searchParams.get('testId');

  let query = supabase
    .from('test_questions')
    .select('*')

  if (testId) {
    query = query.eq('test_id', testId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data as TestQuestion[]);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  
  // Ensure body is an array
  const questions = Array.isArray(body) ? body : [body];
  
  const { data, error } = await supabase
    .from('test_questions')
    .insert(questions)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data as TestQuestion[], { status: 201 });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  
  // Extract test_id from the first question
  const testId = Array.isArray(body) && body.length > 0 ? body[0].test_id : null;
  
  if (!testId) {
    return NextResponse.json({ error: 'test_id is required' }, { status: 400 });
  }

  // Start a transaction
  const { error: deleteError } = await supabase
    .from('test_questions')
    .delete()
    .eq('test_id', testId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // If there are new questions to insert
  if (Array.isArray(body) && body.length > 0) {
    const { data, error: insertError } = await supabase
      .from('test_questions')
      .insert(body)
      .select();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(data as TestQuestion[]);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { id } = await request.json();
  
  const { error } = await supabase
    .from('test_questions')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
