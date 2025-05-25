import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { TestQuestion } from '@/types';
import { api } from '@/utils/apiResponse';

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

  const { data, error } = await query.order('id', { ascending: false });

  if (error) {
    return api.error(error.message);
  }
  return api.ok(data as TestQuestion[]);
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
    return api.error(error.message);
  }
  return api.ok(data as TestQuestion[]);
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  
  // Extract test_id from the first question
  const testId = Array.isArray(body) && body.length > 0 ? body[0].test_id : null;
  
  if (!testId) {
    return api.error('test_id is required');
  }

  // Start a transaction
  const { error: deleteError } = await supabase
    .from('test_questions')
    .delete()
    .eq('test_id', testId);

  if (deleteError) {
    return api.error(deleteError.message);
  }

  // If there are new questions to insert
  if (Array.isArray(body) && body.length > 0) {
    const { data, error: insertError } = await supabase
      .from('test_questions')
      .insert(body)
      .select();

    if (insertError) {
      return api.error(insertError.message);
    }

    return api.ok(data as TestQuestion[]);
  }

  return api.ok({ success: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { id } = await request.json();
  
  const { error } = await supabase
    .from('test_questions')
    .delete()
    .eq('id', id);

  if (error) {
    return api.error(error.message);
  }
  return api.ok({ success: true });
}
