import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { api } from "@/utils/apiResponse";
import { markQuestion } from "@/utils/marking"; // NEW

export async function POST(
  request: NextRequest,
  { params }: { params: { candidate_id: string; test_id: string } }
) {
  const { candidate_id, test_id } = await params; // (no await needed)

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

    // (unchanged) — verify candidate exists and belongs to user
    const { data: candidate, error: candidateError } = await supabase
      .from("candidates")
      .select("id, full_name, test_group_id")
      .eq("id", candidate_id)
      .single();

    if (candidateError || !candidate) {
      return api.error("Candidate not found or access denied");
    }

    // (unchanged) — fetch responses with questions & tests
    const { data: responses, error: responsesError } = await supabase
      .from("candidate_test_questions")
      .select(
        `
        id,
        test_question_id,
        selected_options,
        awarded_points,
        question
      `
      )
      .eq("candidate_id", candidate_id);

    if (responsesError) {
      return api.error(`Error fetching responses: ${responsesError.message}`);
    }
    // console.log(responses);
    if (!responses?.length) {
      return api.error("This candidate have not completed the test");
    }

    let totalScore = 0;
    const markedResponses = [];

    for (const response of responses) {
      const q = response.question;

      console.log(q)
      // NEW — centralised scoring
      const { awardedPoints, isCorrect } = markQuestion(
        {
          question_type: q.question.question_type,
          points: q.points,
          answer: q.question.answer || [],
        },
        response.selected_options
      );
      console.log(awardedPoints)

      totalScore += awardedPoints;

      // update DB
      await supabase
        .from("candidate_test_questions")
        .update({ awarded_points: awardedPoints })
        .eq("id", response.id);

      markedResponses.push({
        question_id: response.test_question_id,
        question_text: q.text,
        correct_answers: q.answer,
        selected_options: response.selected_options,
        max_points: q.points,
        awarded_points: awardedPoints,
        is_correct: isCorrect,
      });
    }

    // (unchanged) — attempt update, summarise test
    console.log(test.pass_score)
    const passed = totalScore >= test.pass_score;

    const { data: currentAttempt } = await supabase
      .from("attempts")
      .select("id")
      .eq("candidate_id", candidate_id)
      .eq("test_id", test.id)
      // .is("finished_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    if (currentAttempt) {
      await supabase
        .from("attempts")
        .update({
          finished_at: new Date().toISOString(),
          score: totalScore,
          passed,
        })
        .eq("id", currentAttempt.id);
    }

    const markingResults = {
      test_id: test.id,
      test_name: test.name,
      total_score: totalScore,
      max_score: test.max_score,
      pass_score: test.pass_score,
      passed,
      percentage: Math.round((totalScore / test.max_score) * 100),
      responses: markedResponses,
    };

    // (unchanged) — final response
    return api.ok({
      candidate_id,
      candidate_name: candidate.full_name,
      marking_completed_at: new Date().toISOString(),
      tests: markingResults,
    }, "Marking completed successfully");
  } catch (err) {
    console.error("Error in marking candidate:", err);
    return api.error("Internal server error during marking process");
  }
}
