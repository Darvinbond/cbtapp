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

  // Fetch all groups for this test with comprehensive statistics
  const { data, error } = await supabase
    .from('test_groups')
    .select(`
      id,
      name,
      start_at,
      end_at,
      test_id,
      candidates!inner (
        id,
        full_name,
        created_at,
        attempts (
          id,
          started_at,
          finished_at,
          score,
          passed
        )
      )
    `)
    .eq('test_id', testid);

  if (error) {
    return api.error(error.message);
  }

  // Transform the data to include statistics
  const groupsWithStats = data?.map(group => {
    const candidates = group.candidates || [];
    const totalCandidates = candidates.length;
    
    // Flatten all attempts across all candidates in this group
    const allAttempts = candidates.flatMap(candidate => candidate.attempts || []);
    
    const totalAttempts = allAttempts.length;
    const finishedAttempts = allAttempts.filter(attempt => attempt.finished_at !== null);
    const unfinishedAttempts = allAttempts.filter(attempt => attempt.finished_at === null);
    const passedAttempts = allAttempts.filter(attempt => attempt.passed === true);
    const failedAttempts = allAttempts.filter(attempt => attempt.passed === false);
    
    // Calculate candidate-level statistics
    const candidatesWithAttempts = candidates.filter(candidate => 
      candidate.attempts && candidate.attempts.length > 0
    );
    const candidatesWithoutAttempts = candidates.filter(candidate => 
      !candidate.attempts || candidate.attempts.length === 0
    );
    
    // Get latest attempt for each candidate to determine current status
    const candidateStatuses = candidates.map(candidate => {
      const attempts = candidate.attempts || [];
      if (attempts.length === 0) {
        return { ...candidate, status: 'not_started', latestAttempt: null };
      }
      
      const latestAttempt = attempts.reduce((latest, current) => 
        new Date(current.started_at) > new Date(latest.started_at) ? current : latest
      );
      
      let status = 'taking';
      if (latestAttempt.finished_at && latestAttempt.score != null) {
        status = latestAttempt.passed ? 'passed' : 'failed';
      }else{
        status = 'in_progress';
      }
      
      return { ...candidate, status, latestAttempt };
    });

    return {
      id: group.id,
      name: group.name,
      start_at: group.start_at,
      end_at: group.end_at,
      test_id: group.test_id,
      statistics: {
        totalCandidates,
        candidatesWithAttempts: candidatesWithAttempts.length,
        candidatesWithoutAttempts: candidatesWithoutAttempts.length,
        totalAttempts,
        finishedAttempts: finishedAttempts.length,
        unfinishedAttempts: unfinishedAttempts.length,
        passedAttempts: passedAttempts.length,
        failedAttempts: failedAttempts.length,
        passRate: totalAttempts > 0 ? ((passedAttempts.length / finishedAttempts.length) * 100).toFixed(2) : '0.00',
        completionRate: totalCandidates > 0 ? ((candidatesWithAttempts.length / totalCandidates) * 100).toFixed(2) : '0.00'
      },
      candidates: candidateStatuses
    };
  }) || [];

  return api.ok(groupsWithStats);
}

// Optional: Add POST endpoint to create a new test group
export async function POST(
  request: NextRequest,
  { params }: { params: { testid: string } }
) {
  const { testid } = await params;
  
  try {
    const body = await request.json();
    const { name, start_at, end_at } = body;

    if (!name) {
      return api.error('Group name is required');
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('test_groups')
      .insert({
        test_id: testid,
        name,
        start_at: start_at || null,
        end_at: end_at || null
      })
      .select()
      .single();

    if (error) {
      return api.error(error.message);
    }

    return api.ok(data);
  } catch (error) {
    return api.error('Invalid request body');
  }
}