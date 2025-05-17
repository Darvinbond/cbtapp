export interface QuestionBank {
  id: string;
  owner_id: string;
  text: string;
  question_type: 'one' | 'many' | 'short';
  options?: string[];
  answer: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Test {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  max_score: number;
  pass_score: number;
  time_limit_minutes?: number;
  created_at: string;
  updated_at: string;
}

export interface TestGroup {
  id: string;
  owner_id: string;
  test_id: string;
  name: string;
  start_at?: string;
  end_at?: string;
}

export interface Candidate {
  id: string;
  owner_id: string;
  full_name: string;
  test_group_id?: string;
  created_at: string;
}

export interface TestQuestion {
  id: string;
  test_id: string;
  question: Record<string, unknown>;
  points: number;
}

export interface CandidateTest {
  id: string;
  candidate_id: string;
  test_id: string;
  access_code: string;
  created_at: string;
}

export interface CandidateTestQuestion {
  id: string;
  candidate_id: string;
  test_question_id: string;
  selected_options?: string[];
  awarded_points?: number;
  created_at: string;
}

export interface Attempt {
  id: string;
  candidate_id: string;
  test_id: string;
  started_at: string;
  finished_at?: string;
  score?: number;
  passed?: boolean;
}
