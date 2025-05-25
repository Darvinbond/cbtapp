// app/api/candidates/[testid]/route.ts
import { NextRequest, NextResponse } from "next/server";
// import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { Params } from "next/dist/server/request/params";
import { api } from '@/utils/apiResponse';

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const { testid } = await params;
    const supabase = await createServiceClient();

    const body = await request.json();

    const { access_code, selections } = body;



    const { data: candidateTest, error: candidateTestError } = await supabase
      .from("candidate_tests")
      .select("*")
      .eq("access_code", access_code)
      .eq("test_id", testid)
      .single();

    if (candidateTestError) {
      console.error(candidateTestError);
      return api.error(candidateTestError.message);
    }


    // GUARDING AGAIN TAKING TEST MORE THAN ONCE
    const { data: attemptDataFetch, error: attemptErrorFetch } = await supabase
      .from("attempts")
      .select()
      .eq("candidate_id", candidateTest.candidate_id)
      .eq("test_id", candidateTest.test_id);

    if (attemptDataFetch && attemptDataFetch?.length > 1) {
      console.error(attemptDataFetch);
      return api.error("Test attempt has reached its limit(s)");
    }

    const {
      data: candidateTestQuestionsFetch,
      error: candidateTestQuestionsFetchError,
    } = await supabase
      .from("candidate_test_questions")
      .select()
      .eq("candidate_id", candidateTest.candidate_id);

    if (candidateTestQuestionsFetchError) {
      console.error(candidateTestQuestionsFetchError);
      return api.error(candidateTestQuestionsFetchError.message);
    }

    const payload = candidateTestQuestionsFetch.flatMap((q: any) => {
      const join = selections.find((s: any) => s.id === q.id);
      return join
        ? [
            {
              id: q.id,
              candidate_id: q.candidate_id,
              question: q.question,
              selected_options: join.selected_options ?? [],
              awarded_points: 0,
            },
          ]
        : [];
    });

    console.log(payload, payload.length);

    if (payload.length > 0) {
      const {
        data: candidateTestQuestions,
        error: candidateTestQuestionsError,
      } = await supabase.from("candidate_test_questions").upsert(payload, {
        onConflict: "id",
        defaultToNull: false,
      });

      if (candidateTestQuestionsError) {
        console.error(candidateTestQuestionsError);
        return api.error(candidateTestQuestionsError.message);
      }
    }

    const { data: attemptData, error: attemptError } = await supabase
      .from("attempts")
      .update({
        finished_at: new Date(),
      })
      .eq("candidate_id", candidateTest.candidate_id)
      .eq("test_id", candidateTest.test_id)
      .single();

    console.log(attemptData);

    if (attemptError) {
      console.error(attemptError);
      return api.error(attemptError.message);
    }

    return api.ok({
      attempt: attemptData,
    });
  } catch (error: any) {
    return api.error(error.message);
  }
}
