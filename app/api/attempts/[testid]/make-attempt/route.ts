import { NextResponse } from "next/server";
// import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { api } from '@/utils/apiResponse';

interface Params {
  testid: string;
}

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const { testid } = await params;
    const supabase = await createServiceClient();

    const body = await request.json();

    const { access_code } = body;

    const { data, error } = await supabase
      .from("candidate_tests")
      .select(
        `
        *,
        tests!inner( id, question_per_candidate )
      `
      )
      .eq("access_code", access_code)
      .eq("tests.id", testid)
      .single();

    if (error) {
      return api.error(error.message);
    }

    // GUARDING AGAIN TAKING TEST MORE THAN ONCE
    const { data: attemptDataFetch, error: attemptErrorFetch } = await supabase
      .from("attempts")
      .select()
      .eq("candidate_id", data.candidate_id)
      .eq("test_id", data.tests.id);

    if (attemptDataFetch && attemptDataFetch?.length > 0) {
      return api.error("Test attempt has reached its limit(s)");
    }

    const { data: attemptData, error: attemptError } = await supabase
      .from("attempts")
      .insert({
        candidate_id: data.candidate_id,
        test_id: data.tests.id,
        started_at: new Date(),
      })
      .single();

    if (attemptError) {
      return api.error(attemptError.message);
    }

    const { data: allQuestions, error: questionsError } = await supabase
      .from("test_questions")
      .select("*")
      .eq("test_id", testid);

    const questions = allQuestions
      ?.sort(() => Math.random() - 0.5)
      .slice(0, data.tests.question_per_candidate);

    if (questionsError || !allQuestions) {
      return api.error(questionsError.message);
    }

    const { data: candidateTestQuestions, error: candidateTestQuestionsError } =
      await supabase
        .from("candidate_test_questions")
        .insert(
          questions?.map((question: any) => ({
            candidate_id: data.candidate_id,
            question: question,
            selected_options: [],
            awarded_points: question.points,
          }))
        )
        .select();

    if (candidateTestQuestionsError) {
      return api.error(candidateTestQuestionsError.message);
    }

    return api.ok({
      attempt: attemptData,
      candidateTestQuestions: candidateTestQuestions,
    });
  } catch (error: any) {
    return api.error(error.message);
  }
}
