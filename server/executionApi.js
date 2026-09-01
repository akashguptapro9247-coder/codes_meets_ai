// ==========================================================================
// CODE MEETS AI - SECURE EXECUTION PROXY (Judge0)
// ==========================================================================

export async function executeCodeOnPiston(reqBody) {
  const { language, source, stdin = '' } = reqBody;

  // 1. Validation
  const supportedLanguages = {
    'c': { id: 50 },
    'java': { id: 62 },
    'python': { id: 71 }
  };

  const langKey = language ? language.toLowerCase() : '';

  if (!supportedLanguages[langKey]) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // 2. Resource limits
  if (!source || source.length > 5000) {
    throw new Error('Source code exceeds maximum length of 5000 characters.');
  }

  if (stdin.length > 2000) {
    throw new Error('Stdin exceeds maximum length of 2000 characters.');
  }

  const JUDGE0_URL = process.env.JUDGE0_URL || 'https://ce.judge0.com';
  const language_id = supportedLanguages[langKey].id;

  const payload = {
    source_code: Buffer.from(source).toString('base64'),
    language_id: language_id,
    stdin: Buffer.from(stdin).toString('base64'),
    cpu_time_limit: 3,
    wall_time_limit: 5,
    memory_limit: 128000,
    max_processes_and_or_threads: 20
  };

  try {
    console.log('[EXECUTION] Sending request to Judge0');
    const submitResponse = await fetch(`${JUDGE0_URL}/submissions/?base64_encoded=true&wait=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!submitResponse.ok) {
      if (submitResponse.status === 429 || submitResponse.status >= 500) {
         return {
           success: false,
           errorType: "EXECUTION_QUEUE_FULL",
           message: "The execution service is currently busy. Please try again."
         };
      }
      throw new Error(`Execution Service Error: ${submitResponse.status}`);
    }

    const submitData = await submitResponse.json();
    const token = submitData.token;
    
    if (!token) {
        throw new Error('No token received from Judge0');
    }

    // Polling
    const maxPolls = 30; // 30 * 500ms = 15s max
    for (let i = 0; i < maxPolls; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const pollResponse = await fetch(`${JUDGE0_URL}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,status,time,memory`, {
            method: 'GET'
        });

        if (!pollResponse.ok) {
            const errorText = await pollResponse.text();
            throw new Error(`Polling Error: ${pollResponse.status} - ${errorText}`);
        }

        const pollData = await pollResponse.json();
        const statusId = pollData.status?.id;

        // 1 = In Queue, 2 = Processing
        if (statusId !== 1 && statusId !== 2) {
            return formatJudge0Response(pollData);
        }
    }

    return {
      success: false,
      errorType: "EXECUTION_TIMEOUT",
      message: "Code execution service timed out."
    };

  } catch (error) {
    console.error('[Execution Proxy Error]', error);
    return {
      success: false,
      errorType: "EXECUTION_SERVICE_ERROR",
      message: "Evaluation temporarily unavailable. Your attempt has NOT been consumed. Please try again."
    };
  }
}

function decodeBase64(str) {
    if (!str) return "";
    return Buffer.from(str, 'base64').toString('utf8');
}

function formatJudge0Response(data) {
    const statusId = data.status?.id;
    let statusString = "INTERNAL_ERROR";
    
    if (statusId === 3) statusString = "ACCEPTED";
    else if (statusId === 4) statusString = "WRONG_ANSWER";
    else if (statusId === 5) statusString = "TIME_LIMIT_EXCEEDED";
    else if (statusId === 6) statusString = "COMPILE_ERROR";
    else if (statusId >= 7 && statusId <= 12) statusString = "RUNTIME_ERROR";
    else if (statusId === 13) statusString = "INTERNAL_ERROR";
    else if (statusId === 14) statusString = "EXEC_FORMAT_ERROR";
    
    return {
        success: true,
        status: statusString,
        stdout: decodeBase64(data.stdout),
        stderr: decodeBase64(data.stderr),
        compile_output: decodeBase64(data.compile_output),
        time: data.time || "0",
        memory: data.memory || 0
    };
}
