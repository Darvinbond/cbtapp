import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { api } from '@/utils/apiResponse';
import { markQuestion } from '@/utils/marking';           // NEW

export async function POST(
  request: NextRequest,
  { params }: { params: { group_id: string; test_id: string } }
) {
  const { group_id, test_id } = params;                            // (no await needed)



  try {
    const supabase = await createClient();

    const { data: test, error: testError } = await supabase
      .from("tests")
      .select()
      .eq("id", test_id)
      .single();

    if (testError || !test) {
      return api.error("Test not found or access denied");
    }

    // (unchanged) — verify group & fetch candidates
    const { data: group } = await supabase
      .from('test_groups')
      .select(`
        id, name, test_id,
        tests!inner ( id, name, max_score, pass_score )
      `)
      .eq('id', group_id)
      .single();

    if (!group) return api.error('Test group not found or access denied');

    const { data: candidates } = await supabase
      .from('candidates')
      .select('id, full_name')
      .eq('test_group_id', group_id);

    if (!candidates?.length)
      return api.error('No candidates found in this group');

    const markingResults = [];
    let totalCandidatesProcessed = 0;
    let totalCandidatesPassed    = 0;

    // ---------- candidate loop ----------
    for (const cand of candidates) {
      try {
        const { data: responses } = await supabase
          .from('candidate_test_questions')
          .select(`
            id,
            test_question_id,
            selected_options,
            awarded_points,
            question
          `)
          .eq('candidate_id', cand.id)
          .eq('test_questions.test_id', test_id);

        if (!responses?.length) {
          markingResults.push({
            candidate_id: cand.id,
            candidate_name: cand.full_name,
            status: 'no_responses',
            message: 'This candidate have not completed the test'
          });
          continue;
        }

        let totalScore = 0;
        const markedResponses = [];

        for (const r of responses) {
          const q = r.question;

          // NEW — centralised scoring
          const { awardedPoints, isCorrect } = markQuestion(
            {
              question_type: q.question.question_type,
              points: q.points,
              answer: q.question.answer || []
            },
            r.selected_options
          );

          totalScore += awardedPoints;

          await supabase
            .from('candidate_test_questions')
            .update({ awarded_points: awardedPoints })
            .eq('id', r.id);

          markedResponses.push({
            question_id: r.test_question_id,
            max_points: q.points,
            awarded_points: awardedPoints,
            is_correct: isCorrect
          });
        }

        const passed = totalScore >= test.pass_score;

        // (unchanged) — update attempt
        const { data: currentAttempt } = await supabase
          .from('attempts')
          .select('id')
          .eq('candidate_id', cand.id)
          .eq('test_id', test_id)
          .is('finished_at', null)
          .order('started_at', { ascending: false })
          .limit(1)
          .single();

        if (currentAttempt) {
          await supabase
            .from('attempts')
            .update({
              finished_at: new Date().toISOString(),
              score: totalScore,
              passed
            })
            .eq('id', currentAttempt.id);
        }

        totalCandidatesProcessed++;
        if (passed) totalCandidatesPassed++;

        markingResults.push({
          candidate_id: cand.id,
          candidate_name: cand.full_name,
          status: 'marked',
          total_score: totalScore,
          max_score: test.max_score,
          pass_score: test.pass_score,
          passed,
          percentage: Math.round((totalScore / test.max_score) * 100),
          responses_count: markedResponses.length,
          correct_responses: markedResponses.filter(r => r.is_correct).length
        });
      } catch (err) {
        console.error(`Error processing candidate: ${cand.full_name}:`, err);
        markingResults.push({
          candidate_id: cand.id,
          candidate_name: cand.full_name,
          status: 'error',
          message: 'Error occurred during marking process'
        });
      }
    }

    // (unchanged) — final response
    return api.ok({
      group_id,
      group_name: group.name,
      test_id: group.test_id,
      test_name: group.tests.name,
      marking_completed_at: new Date().toISOString(),
      summary: {
        total_candidates: candidates.length,
        candidates_processed: totalCandidatesProcessed,
        candidates_passed: totalCandidatesPassed,
        candidates_failed: totalCandidatesProcessed - totalCandidatesPassed,
        pass_rate: totalCandidatesProcessed
          ? Math.round((totalCandidatesPassed / totalCandidatesProcessed) * 100)
          : 0,
        candidates_with_errors: markingResults.filter(r => r.status === 'error').length,
        candidates_with_no_responses: markingResults.filter(r => r.status === 'no_responses').length
      },
      results: markingResults
    });
  } catch (err) {
    console.error('Error in group marking:', err);
    return api.error('Internal server error during group marking process');
  }
}
