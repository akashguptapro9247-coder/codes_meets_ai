-- ============================================================================
-- CODE MEETS AI — LAYER 1 MANUAL: SECURITY HARDENING
-- ============================================================================
-- STEP 1: Create server-side question bank (correct_answer NEVER sent to client)
-- STEP 2: RPC rpc_start_layer1_manual_session   — random question selection + timer
-- STEP 3: RPC rpc_submit_layer1_manual_answer   — server-side correctness check
-- STEP 4: RPC rpc_complete_layer1_manual_session — final score calculation
--
-- Run this ONCE in Supabase SQL Editor → New Query → Run
-- ============================================================================

-- ============================================================================
-- STEP 1A: Create layer_1_question_bank table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.layer_1_question_bank (
  id            INT PRIMARY KEY,
  difficulty    TEXT NOT NULL CHECK (difficulty IN ('easy', 'hard')),
  subject       TEXT,
  marks         INT  NOT NULL DEFAULT 10,
  question      TEXT NOT NULL,
  code          TEXT,
  option_a      TEXT NOT NULL,
  option_b      TEXT NOT NULL,
  option_c      TEXT NOT NULL,
  option_d      TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Only admins / service role can read correct answers; no public SELECT
ALTER TABLE public.layer_1_question_bank ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No public access to question bank" ON public.layer_1_question_bank;
CREATE POLICY "No public access to question bank"
  ON public.layer_1_question_bank
  FOR ALL
  USING (false);

-- ============================================================================
-- STEP 1B: Seed all 40 questions (20 Easy + 20 Hard)
-- ============================================================================
INSERT INTO public.layer_1_question_bank
  (id, difficulty, subject, marks, question, code, option_a, option_b, option_c, option_d, correct_answer)
VALUES

-- ── EASY QUESTIONS (id 1-20) ──────────────────────────────────────────────
(1,  'easy', 'C', 10,
 'Which header file is required for printf() and scanf()?',
 NULL,
 '<conio.h>', '<stdio.h>', '<string.h>', '<math.h>', 'B'),

(2,  'easy', 'C', 10,
 'Which of these correctly declares an integer variable?',
 NULL,
 'int x;', 'integer x;', 'x int;', 'int x=;', 'A'),

(3,  'easy', 'C', 10,
 'What is the size of int on most modern systems (in bytes)?',
 NULL,
 '2', '4', '8', '1', 'B'),

(4,  'easy', 'C', 10,
 'Which operator is used for addition assignment?',
 NULL,
 '=+', '+=', '++', '+=+', 'B'),

(5,  'easy', 'C', 10,
 'What does & mean before a variable name in C (e.g. &a)?',
 NULL,
 'Value of a', 'Address of a', 'Pointer type', 'Size of a', 'B'),

(6,  'easy', 'C', 10,
 'Which loop is guaranteed to execute at least once?',
 NULL,
 'for', 'while', 'do-while', 'nested for', 'C'),

(7,  'easy', 'C', 10,
 'What is the output?',
 'printf("%d", 7/2);',
 '3', '3.5', '4', '3.0', 'A'),

(8,  'easy', 'C', 10,
 'What is the output?',
 'printf("%d", 7%2);',
 '0', '1', '3', '3.5', 'B'),

(9,  'easy', 'C', 10,
 'Which symbol marks the end of a statement in C?',
 NULL,
 ':', ',', ';', '.', 'C'),

(10, 'easy', 'C', 10,
 'Which is the correct way to declare a function that returns nothing?',
 NULL,
 'void func();', 'null func();', 'empty func();', 'none func();', 'A'),

(11, 'easy', 'C', 10,
 'Which is a valid if statement syntax?',
 NULL,
 'if (a=5)', 'if a==5', 'if (a==5)', 'if a=5:', 'C'),

(12, 'easy', 'C', 10,
 'What is the output?',
 E'int a = 5;\nif (a = 0) printf("Yes"); else printf("No");',
 'Yes', 'No', 'Compile Error', 'Nothing prints', 'B'),

(13, 'easy', 'C', 10,
 'Which loop is best when the number of iterations is known in advance?',
 NULL,
 'while', 'do-while', 'for', 'if', 'C'),

(14, 'easy', 'C', 10,
 'What is an array in C?',
 NULL,
 'A function',
 'A collection of variables of the same type stored in contiguous memory',
 'A pointer type',
 'A loop structure',
 'B'),

(15, 'easy', 'C', 10,
 'Which operator is used to access the value at a pointer''s address?',
 NULL,
 '&', '*', '%', '#', 'B'),

(16, 'easy', 'C', 10,
 'What does sizeof(char) return?',
 NULL,
 '1', '2', '4', '8', 'A'),

(17, 'easy', 'C', 10,
 'Which is the correct format specifier for a float?',
 NULL,
 '%d', '%f', '%c', '%s', 'B'),

(18, 'easy', 'C', 10,
 'What is the output?',
 'for(int i=0;i<3;i++) printf("%d ", i);',
 '1 2 3', '0 1 2', '0 1 2 3', '1 2', 'B'),

(19, 'easy', 'C', 10,
 'Which keyword is used to exit a loop early?',
 NULL,
 'exit', 'return', 'break', 'stop', 'C'),

(20, 'easy', 'C', 10,
 'What is the difference between break and continue?',
 NULL,
 'break exits the loop entirely, continue skips to the next iteration',
 'break skips the current iteration, continue exits the loop',
 'Both exit the loop',
 'Both skip the current iteration',
 'A'),

-- ── HARD QUESTIONS (id 21-40) ─────────────────────────────────────────────
(21, 'hard', 'C', 10,
 'What is the output?',
 E'int arr[5] = {1,2,3,4,5};\nint *p = arr;\nprintf("%d", *(p+2) + *p);',
 '3', '4', '6', '8', 'B'),

(22, 'hard', 'C', 10,
 'What is the output?',
 E'void func(int x) {\n    x = x + 5;\n}\nint main() {\n    int a = 10;\n    func(a);\n    printf("%d", a);\n}',
 '10', '15', '5', 'Error', 'A'),

(23, 'hard', 'Data Structures (C)', 10,
 'A stack is used to check balanced parentheses in {[()]}. At what point does the stack become empty again (before the string ends)?',
 NULL,
 'Never until the end',
 'After processing (',
 'It becomes empty only once, right at the end',
 'It''s never empty during processing',
 'C'),

(24, 'hard', 'Data Structures (C)', 10,
 'Which data structure is best suited for implementing Breadth-First Search (BFS)?',
 NULL,
 'Stack', 'Queue', 'Heap', 'Array', 'B'),

(25, 'hard', 'Data Structures (C)', 10,
 'What is the time complexity of searching an element in a balanced Binary Search Tree?',
 NULL,
 'O(1)', 'O(n)', 'O(log n)', 'O(n log n)', 'C'),

(26, 'hard', 'Python', 10,
 'What is the output?',
 E'def add_item(item, lst=[]):\n    lst.append(item)\n    return lst\nprint(add_item(1))\nprint(add_item(2))',
 '[1] then [2]', '[1] then [1, 2]', '[2] then [2]', 'Error', 'B'),

(27, 'hard', 'Python', 10,
 'What is the output?',
 E'a = [1,2,3]\nb = a\nb.append(4)\nprint(a)',
 '[1, 2, 3]', '[1, 2, 3, 4]', 'Error', 'None', 'B'),

(28, 'hard', 'Python', 10,
 'What is the output?',
 'print(2 ** 3 ** 2)',
 '64', '512', '128', '256', 'B'),

(29, 'hard', 'Java', 10,
 'What is the output?',
 E'class A {\n    static int x = 5;\n    void show() { x++; System.out.print(x); }\n}\npublic class Main {\n    public static void main(String[] args) {\n        A a1 = new A();\n        A a2 = new A();\n        a1.show();\n        a2.show();\n    }\n}',
 '55', '56', '67', '66', 'C'),

(30, 'hard', 'Java', 10,
 'What is the output?',
 E'try {\n    int x = 5/0;\n} catch (ArithmeticException e) {\n    System.out.print("A");\n} finally {\n    System.out.print("B");\n}',
 'A', 'B', 'AB', 'BA', 'C'),

(31, 'hard', 'Java', 10,
 'Which overloaded method is called?',
 E'void show(int a) { System.out.print("int"); }\nvoid show(double a) { System.out.print("double"); }\n...\nshow(5);',
 'int', 'double', 'Compile error', 'Runtime error', 'A'),

(32, 'hard', 'OOP (Java)', 10,
 'What is the key difference between method overloading and method overriding?',
 NULL,
 'Overloading happens in the same class with different parameters; overriding happens in a subclass with the same signature',
 'Overloading happens across classes; overriding happens in the same class',
 'Both mean the same thing in Java',
 'Overriding requires different return types only',
 'A'),

(33, 'hard', 'OOP (Java)', 10,
 'What happens if a concrete (non-abstract) subclass does not override an abstract method of its abstract parent class?',
 NULL,
 'It runs fine with a default empty method',
 'Compile-time error',
 'Runtime exception only',
 'The abstract method is simply ignored',
 'B'),

(34, 'hard', 'OOP (Java)', 10,
 'In Java, if a subclass constructor does not explicitly call super(), when is the parent class constructor executed?',
 NULL,
 'It is never called automatically',
 'Only if the parent class has no constructor',
 'Automatically, as the first statement of the subclass constructor',
 'Only after the subclass constructor finishes',
 'C'),

(35, 'hard', 'Node.js', 10,
 'What does require() do when the same module is required multiple times in a Node.js application?',
 NULL,
 'It re-executes and re-loads the module file every time',
 'It returns a cached instance after the first load',
 'It throws an error on the second call',
 'It creates a new isolated copy of the module each time',
 'B'),

(36, 'hard', 'Node.js', 10,
 'Node.js handles many concurrent I/O operations efficiently mainly because of:',
 NULL,
 'Multiple OS-level threads for every request',
 'A single-threaded event loop with non-blocking I/O',
 'It compiles JavaScript to native machine code',
 'It uses multiple JavaScript engines in parallel',
 'B'),

(37, 'hard', 'CO/OS/DBMS', 10,
 'A process references pages in this order: 1, 2, 3, 4, 1, 2, 5. With 3 page frames and FIFO replacement, how many page faults occur?',
 NULL,
 '4', '5', '6', '7', 'C'),

(38, 'hard', 'CO/OS/DBMS', 10,
 'Which of these is NOT one of the four necessary conditions for deadlock?',
 NULL,
 'Mutual Exclusion', 'Hold and Wait', 'Preemption', 'Circular Wait', 'C'),

(39, 'hard', 'CO/OS/DBMS', 10,
 'Which normal form removes transitive dependency from a relation?',
 NULL,
 '1NF', '2NF', '3NF', 'BCNF', 'C'),

(40, 'hard', 'CO/OS/DBMS', 10,
 'Which best describes a key difference between RISC and CISC architectures?',
 NULL,
 'RISC uses fewer, simpler instructions executed in fewer cycles; CISC uses more complex, multi-cycle instructions',
 'CISC is always faster than RISC in every scenario',
 'RISC cannot support pipelining',
 'CISC processors do not use registers',
 'A')

ON CONFLICT (id) DO UPDATE SET
  difficulty    = EXCLUDED.difficulty,
  subject       = EXCLUDED.subject,
  marks         = EXCLUDED.marks,
  question      = EXCLUDED.question,
  code          = EXCLUDED.code,
  option_a      = EXCLUDED.option_a,
  option_b      = EXCLUDED.option_b,
  option_c      = EXCLUDED.option_c,
  option_d      = EXCLUDED.option_d,
  correct_answer = EXCLUDED.correct_answer;

-- ============================================================================
-- STEP 1C: Add attempt_id and expires_at columns to layer_1_manual_attempts
-- (idempotent — safe to run multiple times)
-- ============================================================================
ALTER TABLE public.layer_1_manual_attempts
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

ALTER TABLE public.layer_1_manual_attempts
  ADD COLUMN IF NOT EXISTS answer_log JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Fix old score constraint to allow 0–150
ALTER TABLE public.layer_1_manual_attempts
  DROP CONSTRAINT IF EXISTS layer_1_manual_attempts_score_check;
ALTER TABLE public.layer_1_manual_attempts
  ADD CONSTRAINT layer_1_manual_attempts_score_check
    CHECK (score >= 0.0 AND score <= 150.0);

-- ============================================================================
-- STEP 2: RPC — rpc_start_layer1_manual_session
-- Called ONCE per student when they enter Layer 1 Manual.
-- Returns 15 safe questions (NO correct_answer) + attempt metadata.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.rpc_start_layer1_manual_session(
  p_user_id    UUID,
  p_roll_number TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prefix        TEXT;
  v_easy_count    INT;
  v_hard_count    INT;
  v_year_name     TEXT;
  v_batch         TEXT;
  v_attempt_id    UUID;
  v_started_at    TIMESTAMPTZ;
  v_expires_at    TIMESTAMPTZ;
  v_remaining_sec INT;
  v_questions     JSONB;
  v_existing      RECORD;
BEGIN
  -- 1. Validate roll number
  IF p_roll_number IS NULL OR LENGTH(TRIM(p_roll_number)) <> 10 THEN
    RETURN jsonb_build_object('error', 'Invalid roll number: must be exactly 10 characters.');
  END IF;

  IF UPPER(TRIM(p_roll_number)) !~ '^[A-Z0-9]{10}$' THEN
    RETURN jsonb_build_object('error', 'Invalid roll number format: letters and numbers only.');
  END IF;

  v_prefix := SUBSTRING(UPPER(TRIM(p_roll_number)), 1, 2);

  IF v_prefix = '26' THEN
    v_batch      := '26';
    v_year_name  := 'First Year';
    v_easy_count := 10;
    v_hard_count := 5;
  ELSIF v_prefix = '25' THEN
    v_batch      := '25';
    v_year_name  := 'Second Year';
    v_easy_count := 5;
    v_hard_count := 10;
  ELSE
    RETURN jsonb_build_object('error', 'Unsupported batch: roll number must start with 25 or 26.');
  END IF;

  -- 2. Check if a completed attempt already exists for this user
  SELECT id, score, correct_count, status, started_at, expires_at, questions_pool
  INTO v_existing
  FROM public.layer_1_manual_attempts
  WHERE user_id = p_user_id
  LIMIT 1;

  IF FOUND AND v_existing.status = 'completed' THEN
    -- Return the existing completed result (no new session)
    RETURN jsonb_build_object(
      'already_completed', true,
      'attempt_id',        v_existing.id,
      'score',             v_existing.score,
      'correct_count',     v_existing.correct_count
    );
  END IF;

  -- 3. If an in-progress attempt exists and timer has not expired, resume it
  IF FOUND AND v_existing.status = 'in_progress' AND v_existing.expires_at > NOW() THEN
    v_remaining_sec := EXTRACT(EPOCH FROM (v_existing.expires_at - NOW()))::INT;

    -- Return existing questions (already stripped of correct_answer in original insert)
    RETURN jsonb_build_object(
      'resumed',              true,
      'attempt_id',           v_existing.id,
      'expires_at',           v_existing.expires_at,
      'remaining_seconds',    v_remaining_sec,
      'questions',            v_existing.questions_pool
    );
  END IF;

  -- 4. Build randomized 15-question set (server-side, stripped of correct_answer)
  SELECT jsonb_agg(q ORDER BY RANDOM()) INTO v_questions
  FROM (
    (
      SELECT jsonb_build_object(
        'id',         id,
        'difficulty', difficulty,
        'subject',    subject,
        'marks',      marks,
        'question',   question,
        'code',       code,
        'options',    jsonb_build_object('A', option_a, 'B', option_b, 'C', option_c, 'D', option_d)
      ) AS q
      FROM public.layer_1_question_bank
      WHERE difficulty = 'easy'
      ORDER BY RANDOM()
      LIMIT v_easy_count
    )
    UNION ALL
    (
      SELECT jsonb_build_object(
        'id',         id,
        'difficulty', difficulty,
        'subject',    subject,
        'marks',      marks,
        'question',   question,
        'code',       code,
        'options',    jsonb_build_object('A', option_a, 'B', option_b, 'C', option_c, 'D', option_d)
      ) AS q
      FROM public.layer_1_question_bank
      WHERE difficulty = 'hard'
      ORDER BY RANDOM()
      LIMIT v_hard_count
    )
  ) sub;

  -- Shuffle combined 15 questions again
  SELECT jsonb_agg(elem ORDER BY RANDOM())
  INTO v_questions
  FROM jsonb_array_elements(v_questions) elem;

  -- 5. Set server-side timer (15 minutes)
  v_started_at := NOW();
  v_expires_at := v_started_at + INTERVAL '15 minutes';
  v_remaining_sec := 900; -- 15 * 60

  -- 6. Upsert attempt record (in_progress)
  INSERT INTO public.layer_1_manual_attempts (
    user_id, roll_number, year, batch,
    questions_pool, selected_answers, answer_log,
    score, total_questions, correct_count,
    status, started_at, expires_at,
    created_at, updated_at
  ) VALUES (
    p_user_id, UPPER(TRIM(p_roll_number)), v_year_name, v_batch,
    v_questions, '{}'::jsonb, '[]'::jsonb,
    0, 15, 0,
    'in_progress', v_started_at, v_expires_at,
    v_started_at, v_started_at
  )
  ON CONFLICT (user_id) DO UPDATE SET
    roll_number     = EXCLUDED.roll_number,
    year            = EXCLUDED.year,
    batch           = EXCLUDED.batch,
    questions_pool  = EXCLUDED.questions_pool,
    selected_answers = '{}'::jsonb,
    answer_log      = '[]'::jsonb,
    score           = 0,
    correct_count   = 0,
    status          = 'in_progress',
    started_at      = EXCLUDED.started_at,
    expires_at      = EXCLUDED.expires_at,
    updated_at      = EXCLUDED.started_at
  RETURNING id INTO v_attempt_id;

  -- 7. Return safe session data (no correct_answer in questions)
  RETURN jsonb_build_object(
    'attempt_id',        v_attempt_id,
    'expires_at',        v_expires_at,
    'remaining_seconds', v_remaining_sec,
    'questions',         v_questions,
    'batch',             v_batch,
    'year_name',         v_year_name
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_start_layer1_manual_session(UUID, TEXT) TO anon, authenticated;

-- ============================================================================
-- STEP 3: RPC — rpc_submit_layer1_manual_answer
-- Called each time student clicks NEXT.
-- Server validates timer, looks up correct_answer, records in answer_log,
-- and returns { is_correct, correct_answer } for 2s UI feedback.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.rpc_submit_layer1_manual_answer(
  p_attempt_id      UUID,
  p_user_id         UUID,
  p_question_id     INT,
  p_selected_option TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt       RECORD;
  v_correct       TEXT;
  v_is_correct    BOOLEAN;
  v_already_ans   JSONB;
  v_log_entry     JSONB;
  v_new_log       JSONB;
  v_new_answers   JSONB;
  v_new_score     INT;
  v_new_correct   INT;
BEGIN
  -- 1. Load the attempt row
  SELECT * INTO v_attempt
  FROM public.layer_1_manual_attempts
  WHERE id = p_attempt_id AND user_id = p_user_id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Attempt not found.');
  END IF;

  -- 2. Reject if already completed
  IF v_attempt.status = 'completed' THEN
    RETURN jsonb_build_object('error', 'Attempt is already completed.');
  END IF;

  -- 3. Reject if timer expired
  IF v_attempt.expires_at < NOW() THEN
    RETURN jsonb_build_object('error', 'Time expired. Attempt auto-submitted.');
  END IF;

  -- 4. Validate selected option
  IF p_selected_option NOT IN ('A', 'B', 'C', 'D') THEN
    RETURN jsonb_build_object('error', 'Invalid option. Must be A, B, C, or D.');
  END IF;

  -- 5. Get correct answer from protected question bank
  SELECT correct_answer INTO v_correct
  FROM public.layer_1_question_bank
  WHERE id = p_question_id;

  IF v_correct IS NULL THEN
    RETURN jsonb_build_object('error', 'Question not found in bank.');
  END IF;

  -- 6. Check if this question was already answered
  v_already_ans := v_attempt.selected_answers -> (p_question_id::TEXT);

  IF v_already_ans IS NOT NULL THEN
    -- Already answered — return cached result (idempotent, no score double-count)
    v_is_correct := (v_already_ans #>> '{}') = v_correct;
    RETURN jsonb_build_object(
      'is_correct',     v_is_correct,
      'correct_answer', v_correct
    );
  END IF;

  -- 7. Compute correctness
  v_is_correct := (UPPER(TRIM(p_selected_option)) = v_correct);

  -- 8. Build new log entry
  v_log_entry := jsonb_build_object(
    'question_id',     p_question_id,
    'selected_option', p_selected_option,
    'correct_answer',  v_correct,
    'is_correct',      v_is_correct,
    'answered_at',     NOW()
  );

  -- 9. Update attempt atomically
  v_new_answers := v_attempt.selected_answers || jsonb_build_object(p_question_id::TEXT, p_selected_option);
  v_new_log     := v_attempt.answer_log || jsonb_build_array(v_log_entry);
  v_new_score   := v_attempt.score + (CASE WHEN v_is_correct THEN 10 ELSE 0 END);
  v_new_correct := v_attempt.correct_count + (CASE WHEN v_is_correct THEN 1 ELSE 0 END);

  UPDATE public.layer_1_manual_attempts
  SET
    selected_answers = v_new_answers,
    answer_log       = v_new_log,
    score            = v_new_score,
    correct_count    = v_new_correct,
    updated_at       = NOW()
  WHERE id = p_attempt_id AND user_id = p_user_id;

  -- 10. Return feedback (is_correct + correct_answer for 2s UI reveal)
  RETURN jsonb_build_object(
    'is_correct',     v_is_correct,
    'correct_answer', v_correct
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_submit_layer1_manual_answer(UUID, UUID, INT, TEXT) TO anon, authenticated;

-- ============================================================================
-- STEP 4: RPC — rpc_complete_layer1_manual_session
-- Called after the last question is answered (or when timer expires).
-- Server recalculates final authoritative score from answer_log,
-- marks status = 'completed', and syncs to layer_1 marks table.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.rpc_complete_layer1_manual_session(
  p_attempt_id UUID,
  p_user_id    UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt       RECORD;
  v_final_score   INT := 0;
  v_correct_count INT := 0;
  v_total         INT := 15;
  v_entry         JSONB;
  v_l1_record     RECORD;
  v_genai_marks   NUMERIC;
BEGIN
  -- 1. Load the attempt
  SELECT * INTO v_attempt
  FROM public.layer_1_manual_attempts
  WHERE id = p_attempt_id AND user_id = p_user_id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Attempt not found.');
  END IF;

  -- 2. If already completed, return cached result (idempotent)
  IF v_attempt.status = 'completed' THEN
    RETURN jsonb_build_object(
      'already_completed', true,
      'score',             v_attempt.score,
      'correct_count',     v_attempt.correct_count,
      'total_questions',   15,
      'max_score',         150
    );
  END IF;

  -- 3. Authoritative score recalculation from answer_log
  FOR v_entry IN SELECT jsonb_array_elements(v_attempt.answer_log)
  LOOP
    IF (v_entry -> 'is_correct')::BOOLEAN THEN
      v_final_score   := v_final_score + 10;
      v_correct_count := v_correct_count + 1;
    END IF;
  END LOOP;

  -- 4. Mark attempt as completed
  UPDATE public.layer_1_manual_attempts
  SET
    score         = v_final_score,
    correct_count = v_correct_count,
    total_questions = 15,
    status        = 'completed',
    completed_at  = NOW(),
    updated_at    = NOW()
  WHERE id = p_attempt_id AND user_id = p_user_id;

  -- 5. Sync to layer_1 table (fetch existing GenAI marks first)
  SELECT layer_1_gen_ai_marks, name INTO v_l1_record
  FROM public.layer_1
  WHERE user_id = p_user_id
  LIMIT 1;

  v_genai_marks := COALESCE(v_l1_record.layer_1_gen_ai_marks, 0);

  -- Upsert layer_1 marks (manual marks column)
  INSERT INTO public.layer_1 (
    user_id, name,
    layer_1_manual_marks,
    layer_1_gen_ai_marks,
    layer_1_marks,
    updated_at
  )
  SELECT
    p_user_id,
    COALESCE(v_l1_record.name, u.name, ''),
    v_final_score,
    v_genai_marks,
    ((v_final_score + v_genai_marks) / 2.0),
    NOW()
  FROM public.users u WHERE u.user_id = p_user_id
  ON CONFLICT (user_id) DO UPDATE SET
    layer_1_manual_marks = EXCLUDED.layer_1_manual_marks,
    layer_1_marks        = (EXCLUDED.layer_1_manual_marks + COALESCE(public.layer_1.layer_1_gen_ai_marks, 0)) / 2.0,
    updated_at           = NOW();

  -- 6. Return final result
  RETURN jsonb_build_object(
    'score',           v_final_score,
    'correct_count',   v_correct_count,
    'total_questions', 15,
    'max_score',       150,
    'accuracy',        ROUND((v_correct_count::NUMERIC / 15.0) * 100, 1)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_complete_layer1_manual_session(UUID, UUID) TO anon, authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (optional — run to confirm)
-- ============================================================================
-- SELECT COUNT(*) FROM public.layer_1_question_bank;               -- expect 40
-- SELECT COUNT(*) FROM public.layer_1_question_bank WHERE difficulty='easy';  -- expect 20
-- SELECT COUNT(*) FROM public.layer_1_question_bank WHERE difficulty='hard';  -- expect 20
-- SELECT rpc_start_layer1_manual_session('00000000-0000-0000-0000-000000000001'::UUID, '26ABCDEFGH');
