import { NextResponse } from "next/server";
// import { createServiceClient } from "@/utils/supabase/server";
import { createServiceClient } from '@/utils/supabase/service';
import { api } from '@/utils/apiResponse';

interface Params {
  testid: string;
}

// export async function PUT(request: Request, { params }: { params: Params }) {
//   try {
//     const { testid } = params;
//     const supabase = await createServiceClient();

//     const body = await request.json();

//     const { name, description, max_score, pass_score, time_limit_minutes, test_questions } = body;

//     const { data: updatedTest, error: updateError } = await supabase
//       .from("tests")
//       .update({
//         name,
//         description,
//         max_score,
//         pass_score,
//         time_limit_minutes,
//       })
//       .eq("id", testid)
//       .select()
//       .single();

//     if (updateError) {
//       console.error(updateError);
//       return new NextResponse(updateError.message, { status: 500 });
//     }

//     if (test_questions) {
//       const { error: deleteError } = await supabase
//         .from("test_questions")
//         .delete()
//         .eq("test_id", testid);

//       if (deleteError) {
//         console.error(deleteError);
//         return new NextResponse(deleteError.message, { status: 500 });
//       }

//       const { data: createdQuestions, error: createError } = await supabase
//         .from("test_questions")
//         .insert([...test_questions])
//         .select();

//       if (createError) {
//         console.error(createError);
//         return new NextResponse(createError.message, { status: 500 });
//       }
//     }

//     return NextResponse.json(updatedTest);
//   } catch (error: any) {
//     console.error(error);
//     return new NextResponse(error.message, { status: 500 });
//   }
// }

// export async function GET(request: Request, { params }: { params: Params }) {
//   try {
//     const { testid } = params;
//     const supabase = await createServiceClient();

//     const { data, error } = await supabase
//       .from("tests")
//       .select(`
//         *,
//         test_questions (
//           *
//         )
//       `)
//       .eq("id", testid)
//       .single();
    
//     const test = data;

//     if (error) {
//       console.error(error);
//       return new NextResponse(error.message, { status: 500 });
//     }

//     return NextResponse.json(test);
//   } catch (error: any) {
//     console.error(error);
//     return new NextResponse(error.message, { status: 500 });
//   }
// }



export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const { testid } = await params;
    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from("tests")
      .select()
      .eq("id", testid)
      .single();
    
    const test = data;

    if (error) {
      console.error(error);
      return api.error(error.message);
    }

    return api.ok(test);
  } catch (error: any) {
    console.error(error);
    return api.error(error.message);
  }
}



export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { testid } = await params;
    const supabase = await createServiceClient();

    const body = await request.json();

    const { name, description, max_score, pass_score, time_limit_minutes, question_per_candidate } = body;

    const { data: updatedTest, error: updateError } = await supabase
      .from("tests")
      .update({
        name,
        description,
        max_score,
        pass_score,
        time_limit_minutes,
        question_per_candidate
      })
      .eq("id", testid)
      .select()
      .single();

    if (updateError) {
      console.error(updateError);
      return api.error(updateError.message);
    }

    return api.ok(updatedTest, "Saved changes");
  } catch (error: any) {
    console.error(error);
    return api.error(error.message);
  }
}