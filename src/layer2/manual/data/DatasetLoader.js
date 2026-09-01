// ==========================================================================
// CODE MEETS AI - LAYER 2 DATASET LOADER
// ==========================================================================

export async function loadDataset(language, batchYear) {
  // language: 'C' | 'Java' | 'Python'
  // batchYear: '26' (1st Year) | '25' (2nd Year)
  
  const langKey = language.toLowerCase();
  const yearKey = batchYear === '26' ? 'first_year' : 'second_year';
  
  const fileName = `/layer2_${yearKey}_${langKey}_questions.json`;
  
  try {
    // Note: Since these JSONs are in the root directory and likely served or bundled,
    // we can either import them statically or fetch them. 
    // In Vite, it's safer to dynamically import if they are in src, but they are in root.
    // Assuming they are accessible via fetch from public/ or root if aliased.
    // For safety, we use Vite's dynamic import with a relative path workaround or import them directly.
    // Since we don't want to bundle all of them if not needed, we'll try to fetch or dynamic import.
    
    // As per the repo structure, files are in the root directory. 
    // Vite does not serve root files via fetch unless they are in public/.
    // Let's use dynamic import.
    let dataset;
    if (batchYear === '26') {
      if (langKey === 'c') dataset = await import('../../../../layer2_first_year_c_questions.json');
      else if (langKey === 'java') dataset = await import('../../../../layer2_first_year_java_questions.json');
      else if (langKey === 'python') dataset = await import('../../../../layer2_first_year_python_questions.json');
    } else {
      if (langKey === 'c') dataset = await import('../../../../layer2_second_year_c_questions.json');
      else if (langKey === 'java') dataset = await import('../../../../layer2_second_year_java_questions.json');
      else if (langKey === 'python') dataset = await import('../../../../layer2_second_year_python_questions.json');
    }

    return dataset.default || dataset;
  } catch (err) {
    console.error('Failed to load dataset', err);
    throw new Error('DATASET_LOAD_ERROR');
  }
}

export function randomizeQuestions(dataset) {
  // Returns exactly 5 questions (one from q1, q2, q3, q4, q5)
  if (!dataset || !dataset.questionPools) return [];
  
  const selected = [];
  const pools = ['q1', 'q2', 'q3', 'q4', 'q5'];
  
  pools.forEach(poolKey => {
    const pool = dataset.questionPools[poolKey];
    if (pool && pool.questions && pool.questions.length > 0) {
      const randomIndex = Math.floor(Math.random() * pool.questions.length);
      const question = pool.questions[randomIndex];
      selected.push({
        ...question,
        _poolType: pool.type,
        _poolKey: poolKey,
        _instruction: pool.instruction,
        _poolTitle: pool.title
      });
    }
  });
  
  return selected;
}
