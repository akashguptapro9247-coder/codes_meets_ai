// ==========================================================================
// CODE MEETS AI - LAYER 2 EXECUTION SERVICE
// ==========================================================================

export async function executeAndEvaluateCode(language, source, expectedOutput, stdin = '') {
  try {
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ language, source, stdin })
    });

    if (!response.ok) {
      return { status: 'EXECUTION_SERVICE_ERROR', message: 'Evaluation temporarily unavailable. Your attempt has NOT been consumed. Please try again.' };
    }

    const result = await response.json();
    
    // Infrastructure/API errors handled by our backend proxy
    if (!result.success) {
      return { status: 'EXECUTION_SERVICE_ERROR', message: result.message || 'Execution service error.' };
    }
    
    // Check for compilation errors
    if (result.status === 'COMPILE_ERROR') {
      return { status: 'COMPILE_ERROR', output: result.compile_output || result.stderr || 'Compilation failed.' };
    }
    
    // Check for runtime errors
    if (result.status === 'RUNTIME_ERROR' || result.status === 'EXEC_FORMAT_ERROR' || result.status === 'INTERNAL_ERROR') {
      return { status: 'RUNTIME_ERROR', output: result.stderr || 'Runtime error occurred.' };
    }

    if (result.status === 'TIME_LIMIT_EXCEEDED') {
      return { status: 'TIMEOUT', output: 'Execution timed out.' };
    }
    
    // Evaluate correctness
    const actualOutput = (result.stdout || '').trim();
    const expected = (expectedOutput || '').trim();
    
    // Normalize newlines and trailing whitespace for fair comparison
    const normalize = (str) => str.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').trim();
    
    if (normalize(actualOutput) === normalize(expected)) {
      return { status: 'CORRECT', output: actualOutput };
    } else {
      return { status: 'WRONG_ANSWER', output: actualOutput, expected: expected };
    }

  } catch (error) {
    console.error('[ExecutionService] Network or parsing error:', error);
    return { status: 'EXECUTION_SERVICE_ERROR', message: 'Evaluation temporarily unavailable. Your attempt has NOT been consumed. Please try again.' };
  }
}
