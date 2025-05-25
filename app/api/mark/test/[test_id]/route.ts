import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { api } from '@/utils/apiResponse';
import { markQuestion } from '@/utils/marking';           // NEW

export async function POST(
  request: NextRequest,
  { params }: { params: { test_id: string } }
) {
  const { test_id } = params;                             // (no await needed)

  try {
    const supabase = await createClient();

    // (unchanged) — verify test exists
    const { data: test } = await supabase
      .from('tests')
      .select('id, name, max_score, pass_score')
      .eq('id', test_id)
      .single();

    if (!test) return api.error('Test not found or access denied');

    // (unchanged) — fetch all candidate responses for this test
    const { data: allResponses } = await supabase
      .from('candidate_test_questions')
      .select(`
        candidate_id,
        candidates!inner (
          id, full_name, test_group_id,
          test_groups ( id, name )
        ),
        id,
        test_question_id,
        selected_options,
        awarded_points,
        test_questions!inner ( id, question, points, test_id )
      `)
      .eq('test_questions.test_id', test_id);

    if (!allResponses?.length)
      return api.error('No candidates have taken this test yet');

    // group by candidate
    const byCandidate = allResponses.reduce((acc, r) => {
      const cid = r.candidate_id;
      if (!acc[cid]) acc[cid] = { candidate: r.candidates, responses: [] };
      acc[cid].responses.push(r);
      return acc;
    }, {} as Record<string, any>);

    const markingResults             = [];
    let totalCandidatesProcessed     = 0;
    let totalCandidatesPassed        = 0;
    const groupStats: Record<string, any> = {};

    // ---------- candidate loop ----------
    for (const [cid, cData] of Object.entries(byCandidate)) {
      try {
        const cand      = cData.candidate;
        const responses = cData.responses;

        let totalScore = 0;
        const markedResponses = [];

        for (const r of responses) {
          const q = r.test_questions;

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

        const passed     = totalScore >= test.pass_score;
        const percentage = Math.round((totalScore / test.max_score) * 100);

        // (unchanged) — update attempt
        const { data: currentAttempt } = await supabase
          .from('attempts')
          .select('id')
          .eq('candidate_id', cid)
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

        // accumulate group stats
        const gId   = cand.test_group_id;
        const gName = cand.test_groups?.name || 'No Group';
        const key   = gId || 'ungrouped';

        if (!groupStats[key]) {
          groupStats[key] = {
            group_id: gId,
            group_name: gName,
            total_candidates: 0,
            passed_candidates: 0,
            failed_candidates: 0,
            scores: []
          };
        }
        groupStats[key].total_candidates++;
        groupStats[key].scores.push(totalScore);
        passed
          ? (groupStats[key].passed_candidates++)
          : (groupStats[key].failed_candidates++);

        totalCandidatesProcessed++;
        if (passed) totalCandidatesPassed++;

        markingResults.push({
          candidate_id: cid,
          candidate_name: cand.full_name,
          group_id: gId,
          group_name: gName,
          status: 'marked',
          total_score: totalScore,
          max_score: test.max_score,
          pass_score: test.pass_score,
          passed,
          percentage,
          responses_count: markedResponses.length,
          correct_responses: markedResponses.filter(r => r.is_correct).length
        });
      } catch (err) {
        console.error(`Error processing candidate ${cid}:`, err);
        const cand = (cData as any).candidate;
        markingResults.push({
          candidate_id: cid,
          candidate_name: cand.full_name,
          group_id: cand.test_group_id,
          group_name: cand.test_groups?.name || 'No Group',
          status: 'error',
          message: 'Error occurred during marking process'
        });
      }
    }

    // compute group averages / pass-rates
    Object.values(groupStats).forEach((g: any) => {
      if (g.scores.length) {
        g.average_score = Math.round(
          g.scores.reduce((s: number, v: number) => s + v, 0) / g.scores.length
        );
        g.pass_rate = Math.round((g.passed_candidates / g.total_candidates) * 100);
      }
      delete g.scores;                                  // don’t expose raw scores
    });

    // final response (unchanged except stats already updated)
    return api.ok({
      test_id,
      test_name: test.name,
      marking_completed_at: new Date().toISOString(),
      summary: {
        total_candidates: Object.keys(byCandidate).length,
        candidates_processed: totalCandidatesProcessed,
        candidates_passed: totalCandidatesPassed,
        candidates_failed: totalCandidatesProcessed - totalCandidatesPassed,
        overall_pass_rate: totalCandidatesProcessed
          ? Math.round((totalCandidatesPassed / totalCandidatesProcessed) * 100)
          : 0,
        average_score: markingResults.length
          ? Math.round(
              markingResults
                .filter(r => r.status === 'marked')
                .reduce((sum, r) => sum + r.total_score, 0) /
                markingResults.filter(r => r.status === 'marked').length
            )
          : 0,
        candidates_with_errors: markingResults.filter(r => r.status === 'error').length
      },
      group_statistics: Object.values(groupStats),
      results: markingResults
    });
  } catch (err) {
    console.error('Error in test marking:', err);
    return api.error('Internal server error during test marking process');
  }
}
