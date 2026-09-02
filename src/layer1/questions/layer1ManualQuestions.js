// ==========================================================================
// CODE MEETS AI — LAYER 1 MANUAL QUESTION BANK & SESSION UTILITIES
// ==========================================================================
// Contains all 40 technical questions (20 Easy + 20 Hard).
// Generates random 15-question sets per batch:
//   - Batch 26 (First Year):  10 Easy + 5 Hard = 15 questions (150 marks)
//   - Batch 25 (Second Year): 10 Hard + 5 Easy = 15 questions (150 marks)
// ==========================================================================

export const QUESTION_BANK = {
  1: {
    id: 1,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'Which header file is required for printf() and scanf()?',
    code: null,
    options: { A: '<conio.h>', B: '<stdio.h>', C: '<string.h>', D: '<math.h>' },
    correct_answer: 'B'
  },
  2: {
    id: 2,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'Which of these correctly declares an integer variable?',
    code: null,
    options: { A: 'int x;', B: 'integer x;', C: 'x int;', D: 'int x=;' },
    correct_answer: 'A'
  },
  3: {
    id: 3,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'What is the size of int on most modern systems (in bytes)?',
    code: null,
    options: { A: '2', B: '4', C: '8', D: '1' },
    correct_answer: 'B'
  },
  4: {
    id: 4,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'Which operator is used for addition assignment?',
    code: null,
    options: { A: '=+', B: '+=', C: '++', D: '+=+' },
    correct_answer: 'B'
  },
  5: {
    id: 5,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'What does & mean before a variable name in C (e.g. &a)?',
    code: null,
    options: { A: 'Value of a', B: 'Address of a', C: 'Pointer type', D: 'Size of a' },
    correct_answer: 'B'
  },
  6: {
    id: 6,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'Which loop is guaranteed to execute at least once?',
    code: null,
    options: { A: 'for', B: 'while', C: 'do-while', D: 'nested for' },
    correct_answer: 'C'
  },
  7: {
    id: 7,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'What is the output?',
    code: 'printf("%d", 7/2);',
    options: { A: '3', B: '3.5', C: '4', D: '3.0' },
    correct_answer: 'A'
  },
  8: {
    id: 8,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'What is the output?',
    code: 'printf("%d", 7%2);',
    options: { A: '0', B: '1', C: '3', D: '3.5' },
    correct_answer: 'B'
  },
  9: {
    id: 9,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'Which symbol marks the end of a statement in C?',
    code: null,
    options: { A: ':', B: ',', C: ';', D: '.' },
    correct_answer: 'C'
  },
  10: {
    id: 10,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'Which is the correct way to declare a function that returns nothing?',
    code: null,
    options: { A: 'void func();', B: 'null func();', C: 'empty func();', D: 'none func();' },
    correct_answer: 'A'
  },
  11: {
    id: 11,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'Which is a valid if statement syntax?',
    code: null,
    options: { A: 'if (a=5)', B: 'if a==5', C: 'if (a==5)', D: 'if a=5:' },
    correct_answer: 'C'
  },
  12: {
    id: 12,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'What is the output?',
    code: 'int a = 5;\nif (a = 0) printf("Yes"); else printf("No");',
    options: { A: 'Yes', B: 'No', C: 'Compile Error', D: 'Nothing prints' },
    correct_answer: 'B'
  },
  13: {
    id: 13,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'Which loop is best when the number of iterations is known in advance?',
    code: null,
    options: { A: 'while', B: 'do-while', C: 'for', D: 'if' },
    correct_answer: 'C'
  },
  14: {
    id: 14,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'What is an array in C?',
    code: null,
    options: {
      A: 'A function',
      B: 'A collection of variables of the same type stored in contiguous memory',
      C: 'A pointer type',
      D: 'A loop structure'
    },
    correct_answer: 'B'
  },
  15: {
    id: 15,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: "Which operator is used to access the value at a pointer's address?",
    code: null,
    options: { A: '&', B: '*', C: '%', D: '#' },
    correct_answer: 'B'
  },
  16: {
    id: 16,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'What does sizeof(char) return?',
    code: null,
    options: { A: '1', B: '2', C: '4', D: '8' },
    correct_answer: 'A'
  },
  17: {
    id: 17,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'Which is the correct format specifier for a float?',
    code: null,
    options: { A: '%d', B: '%f', C: '%c', D: '%s' },
    correct_answer: 'B'
  },
  18: {
    id: 18,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'What is the output?',
    code: 'for(int i=0;i<3;i++) printf("%d ", i);',
    options: { A: '1 2 3', B: '0 1 2', C: '0 1 2 3', D: '1 2' },
    correct_answer: 'B'
  },
  19: {
    id: 19,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'Which keyword is used to exit a loop early?',
    code: null,
    options: { A: 'exit', B: 'return', C: 'break', D: 'stop' },
    correct_answer: 'C'
  },
  20: {
    id: 20,
    difficulty: 'easy',
    subject: 'C',
    marks: 10,
    question: 'What is the difference between break and continue?',
    code: null,
    options: {
      A: 'break exits the loop entirely, continue skips to the next iteration',
      B: 'break skips the current iteration, continue exits the loop',
      C: 'Both exit the loop',
      D: 'Both skip the current iteration'
    },
    correct_answer: 'A'
  },

  // ── HARD QUESTIONS (id 21-40) ─────────────────────────────────────────────
  21: {
    id: 21,
    difficulty: 'hard',
    subject: 'C',
    marks: 10,
    question: 'What is the output?',
    code: 'int arr[5] = {1,2,3,4,5};\nint *p = arr;\nprintf("%d", *(p+2) + *p);',
    options: { A: '3', B: '4', C: '6', D: '8' },
    correct_answer: 'B'
  },
  22: {
    id: 22,
    difficulty: 'hard',
    subject: 'C',
    marks: 10,
    question: 'What is the output?',
    code: 'void func(int x) {\n    x = x + 5;\n}\nint main() {\n    int a = 10;\n    func(a);\n    printf("%d", a);\n}',
    options: { A: '10', B: '15', C: '5', D: 'Error' },
    correct_answer: 'A'
  },
  23: {
    id: 23,
    difficulty: 'hard',
    subject: 'Data Structures (C)',
    marks: 10,
    question: 'A stack is used to check balanced parentheses in {[()]}. At what point does the stack become empty again (before the string ends)?',
    code: null,
    options: {
      A: 'Never until the end',
      B: 'After processing (',
      C: 'It becomes empty only once, right at the end',
      D: "It's never empty during processing"
    },
    correct_answer: 'C'
  },
  24: {
    id: 24,
    difficulty: 'hard',
    subject: 'Data Structures (C)',
    marks: 10,
    question: 'Which data structure is best suited for implementing Breadth-First Search (BFS)?',
    code: null,
    options: { A: 'Stack', B: 'Queue', C: 'Heap', D: 'Array' },
    correct_answer: 'B'
  },
  25: {
    id: 25,
    difficulty: 'hard',
    subject: 'Data Structures (C)',
    marks: 10,
    question: 'What is the time complexity of searching an element in a balanced Binary Search Tree?',
    code: null,
    options: { A: 'O(1)', B: 'O(n)', C: 'O(log n)', D: 'O(n log n)' },
    correct_answer: 'C'
  },
  26: {
    id: 26,
    difficulty: 'hard',
    subject: 'Python',
    marks: 10,
    question: 'What is the output?',
    code: 'def add_item(item, lst=[]):\n    lst.append(item)\n    return lst\nprint(add_item(1))\nprint(add_item(2))',
    options: { A: '[1] then [2]', B: '[1] then [1, 2]', C: '[2] then [2]', D: 'Error' },
    correct_answer: 'B'
  },
  27: {
    id: 27,
    difficulty: 'hard',
    subject: 'Python',
    marks: 10,
    question: 'What is the output?',
    code: 'a = [1,2,3]\nb = a\nb.append(4)\nprint(a)',
    options: { A: '[1, 2, 3]', B: '[1, 2, 3, 4]', C: 'Error', D: 'None' },
    correct_answer: 'B'
  },
  28: {
    id: 28,
    difficulty: 'hard',
    subject: 'Python',
    marks: 10,
    question: 'What is the output?',
    code: 'print(2 ** 3 ** 2)',
    options: { A: '64', B: '512', C: '128', D: '256' },
    correct_answer: 'B'
  },
  29: {
    id: 29,
    difficulty: 'hard',
    subject: 'Java',
    marks: 10,
    question: 'What is the output?',
    code: 'class A {\n    static int x = 5;\n    void show() { x++; System.out.print(x); }\n}\npublic class Main {\n    public static void main(String[] args) {\n        A a1 = new A();\n        A a2 = new A();\n        a1.show();\n        a2.show();\n    }\n}',
    options: { A: '55', B: '56', C: '67', D: '66' },
    correct_answer: 'C'
  },
  30: {
    id: 30,
    difficulty: 'hard',
    subject: 'Java',
    marks: 10,
    question: 'What is the output?',
    code: 'try {\n    int x = 5/0;\n} catch (ArithmeticException e) {\n    System.out.print("A");\n} finally {\n    System.out.print("B");\n}',
    options: { A: 'A', B: 'B', C: 'AB', D: 'BA' },
    correct_answer: 'C'
  },
  31: {
    id: 31,
    difficulty: 'hard',
    subject: 'Java',
    marks: 10,
    question: 'Which overloaded method is called?',
    code: 'void show(int a) { System.out.print("int"); }\nvoid show(double a) { System.out.print("double"); }\n...\nshow(5);',
    options: { A: 'int', B: 'double', C: 'Compile error', D: 'Runtime error' },
    correct_answer: 'A'
  },
  32: {
    id: 32,
    difficulty: 'hard',
    subject: 'OOP (Java)',
    marks: 10,
    question: 'What is the key difference between method overloading and method overriding?',
    code: null,
    options: {
      A: 'Overloading happens in the same class with different parameters; overriding happens in a subclass with the same signature',
      B: 'Overloading happens across classes; overriding happens in the same class',
      C: 'Both mean the same thing in Java',
      D: 'Overriding requires different return types only'
    },
    correct_answer: 'A'
  },
  33: {
    id: 33,
    difficulty: 'hard',
    subject: 'OOP (Java)',
    marks: 10,
    question: 'What happens if a concrete (non-abstract) subclass does not override an abstract method of its abstract parent class?',
    code: null,
    options: {
      A: 'It runs fine with a default empty method',
      B: 'Compile-time error',
      C: 'Runtime exception only',
      D: 'The abstract method is simply ignored'
    },
    correct_answer: 'B'
  },
  34: {
    id: 34,
    difficulty: 'hard',
    subject: 'OOP (Java)',
    marks: 10,
    question: 'In Java, if a subclass constructor does not explicitly call super(), when is the parent class constructor executed?',
    code: null,
    options: {
      A: 'It is never called automatically',
      B: 'Only if the parent class has no constructor',
      C: 'Automatically, as the first statement of the subclass constructor',
      D: 'Only after the subclass constructor finishes'
    },
    correct_answer: 'C'
  },
  35: {
    id: 35,
    difficulty: 'hard',
    subject: 'Node.js',
    marks: 10,
    question: 'What does require() do when the same module is required multiple times in a Node.js application?',
    code: null,
    options: {
      A: 'It re-executes and re-loads the module file every time',
      B: 'It returns a cached instance after the first load',
      C: 'It throws an error on the second call',
      D: 'It creates a new isolated copy of the module each time'
    },
    correct_answer: 'B'
  },
  36: {
    id: 36,
    difficulty: 'hard',
    subject: 'Node.js',
    marks: 10,
    question: 'Node.js handles many concurrent I/O operations efficiently mainly because of:',
    code: null,
    options: {
      A: 'Multiple OS-level threads for every request',
      B: 'A single-threaded event loop with non-blocking I/O',
      C: 'It compiles JavaScript to native machine code',
      D: 'It uses multiple JavaScript engines in parallel'
    },
    correct_answer: 'B'
  },
  37: {
    id: 37,
    difficulty: 'hard',
    subject: 'CO/OS/DBMS',
    marks: 10,
    question: 'A process references pages in this order: 1, 2, 3, 4, 1, 2, 5. With 3 page frames and FIFO replacement, how many page faults occur?',
    code: null,
    options: { A: '4', B: '5', C: '6', D: '7' },
    correct_answer: 'C'
  },
  38: {
    id: 38,
    difficulty: 'hard',
    subject: 'CO/OS/DBMS',
    marks: 10,
    question: 'Which of these is NOT one of the four necessary conditions for deadlock?',
    code: null,
    options: { A: 'Mutual Exclusion', B: 'Hold and Wait', C: 'Preemption', D: 'Circular Wait' },
    correct_answer: 'C'
  },
  39: {
    id: 39,
    difficulty: 'hard',
    subject: 'CO/OS/DBMS',
    marks: 10,
    question: 'Which normal form removes transitive dependency from a relation?',
    code: null,
    options: { A: '1NF', B: '2NF', C: '3NF', D: 'BCNF' },
    correct_answer: 'C'
  },
  40: {
    id: 40,
    difficulty: 'hard',
    subject: 'CO/OS/DBMS',
    marks: 10,
    question: 'Which best describes a key difference between RISC and CISC architectures?',
    code: null,
    options: {
      A: 'RISC uses fewer, simpler instructions executed in fewer cycles; CISC uses more complex, multi-cycle instructions',
      B: 'CISC is always faster than RISC in every scenario',
      C: 'RISC cannot support pipelining',
      D: 'CISC processors do not use registers'
    },
    correct_answer: 'A'
  }
};

/**
 * Validates 10-character alphanumeric roll number and detects batch & year.
 */
export function validateRollNumber(rollNumberRaw) {
  if (!rollNumberRaw) {
    return {
      valid: false,
      error: 'Roll number is required.'
    };
  }

  const rollNumber = String(rollNumberRaw).trim().toUpperCase();

  if (rollNumber.length !== 10) {
    return {
      valid: false,
      error: `Invalid roll number length: must be exactly 10 characters (received ${rollNumber.length} characters).`
    };
  }

  if (!/^[A-Z0-9]{10}$/i.test(rollNumber)) {
    return {
      valid: false,
      error: 'Invalid roll number format: must contain only letters and numbers (no special characters or spaces).'
    };
  }

  const prefix = rollNumber.substring(0, 2);

  if (prefix === '26') {
    return {
      valid: true,
      batch: '26',
      yearName: 'First Year',
      easyCount: 10,
      hardCount: 5,
      totalQuestions: 15
    };
  } else if (prefix === '25') {
    return {
      valid: true,
      batch: '25',
      yearName: 'Second Year',
      easyCount: 5,
      hardCount: 10,
      totalQuestions: 15
    };
  }

  return {
    valid: false,
    error: `Invalid roll number prefix: must start with '26' (First Year) or '25' (Second Year). Received: '${prefix}'.`
  };
}

/**
 * Shuffles an array randomly.
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates a randomized 15-question set based on the student's batch.
 * Junior (26): 10 Easy + 5 Hard
 * Senior (25): 10 Hard + 5 Easy
 */
export function generateRandomQuestionSet(rollNumberRaw) {
  const validation = validateRollNumber(rollNumberRaw);
  if (!validation.valid) {
    return { error: validation.error, questions: [] };
  }

  const easyList = Object.values(QUESTION_BANK).filter((q) => q.difficulty === 'easy');
  const hardList = Object.values(QUESTION_BANK).filter((q) => q.difficulty === 'hard');

  const selectedEasy = shuffleArray(easyList).slice(0, validation.easyCount);
  const selectedHard = shuffleArray(hardList).slice(0, validation.hardCount);

  // Combine and shuffle order
  const combined = shuffleArray([...selectedEasy, ...selectedHard]);

  // Strip correct_answer before returning to UI components
  const safeQuestions = combined.map((q) => ({
    id: q.id,
    difficulty: q.difficulty,
    subject: q.subject,
    marks: q.marks,
    question: q.question,
    code: q.code,
    options: { ...q.options }
  }));

  return {
    valid: true,
    batch: validation.batch,
    yearName: validation.yearName,
    questions: safeQuestions
  };
}

/**
 * Evaluates a single selected answer against the question bank.
 */
export function evaluateSingleAnswer(questionId, selectedOption) {
  const question = QUESTION_BANK[questionId];
  if (!question) {
    return { is_correct: false, correct_answer: null };
  }
  const isCorrect = (question.correct_answer || '').toUpperCase() === (selectedOption || '').toUpperCase();
  return {
    is_correct: isCorrect,
    correct_answer: question.correct_answer
  };
}

/**
 * Evaluates an entire map of selected answers and calculates the total score.
 * (10 marks per correct answer, max 150)
 */
export function evaluateManualAnswers(selectedAnswers = {}) {
  let correctCount = 0;
  const totalQuestions = 15;

  Object.entries(selectedAnswers).forEach(([qId, option]) => {
    const question = QUESTION_BANK[qId];
    if (question && question.correct_answer && String(option).toUpperCase() === question.correct_answer.toUpperCase()) {
      correctCount += 1;
    }
  });

  const score = correctCount * 10;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return {
    score,
    correctCount,
    totalQuestions,
    accuracy
  };
}
