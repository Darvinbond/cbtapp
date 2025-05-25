// utils/marking.ts
/**
 * Minimal shape of a question you need to mark.
 * Extend when you add more question types or fields.
 */
export interface RawQuestion {
  question_type: 'one' | 'many' | 'short';
  points: number;
  answer: string[];               // authoritative correct answers
}

export interface MarkedResult {
  awardedPoints: number;
  isCorrect: boolean;
}

/**
 * Pure, side-effect-free scoring helper.
 * Give it the question record and the candidate’s selected options;
 * it returns awarded points and a correctness flag.
 */
export function markQuestion(
  question: RawQuestion,
  selectedOptions: string[] | null | undefined
): MarkedResult {
  console.log("-------------------------------")
  console.log(question, selectedOptions)
  const opts = selectedOptions ?? [];
  const { points: maxPoints, question_type, answer: correct } = question;

  let awarded = 0;

  switch (question_type) {
    case 'one': {                                   // single-choice
      if (opts.length === 1 && correct.includes(opts[0])) awarded = maxPoints;
      break;
    }
    case 'many': {                                  // multiple-choice
      const correctChosen = opts.filter(o => correct.includes(o));
      const wrongChosen   = opts.filter(o => !correct.includes(o));
      if (wrongChosen.length === 0 && correctChosen.length > 0) {
        awarded = Math.round(
          (correctChosen.length / correct.length) * maxPoints
        );
      }
      break;
    }
    case 'short': {                                 // short answer
      const guess = (opts[0] ?? '').trim().toLowerCase();
      const hit   = correct.some(a => a.trim().toLowerCase() === guess);
      if (hit) awarded = maxPoints;
      break;
    }
    default:
      console.warn(`Unknown question_type “${question_type}” – awarding 0 pts`);
  }

  return { awardedPoints: awarded, isCorrect: awarded > 0 };
}
