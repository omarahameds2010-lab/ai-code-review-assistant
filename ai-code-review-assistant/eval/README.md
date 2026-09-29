# AI Code Review Assistant - Evaluation Suite

This evaluation suite measures the accuracy and performance of the AI code review assistant using a curated dataset of files with known bugs.

## Purpose

To quantify the code review assistant's performance with metrics like:
- **Precision**: Of all issues detected, how many are real bugs?
- **Recall**: Of all real bugs, how many were detected?
- **F1 Score**: Harmonic mean of precision and recall
- **Response Time**: Average time per review

## Test Dataset

### Files with Known Bugs (7 files)

1. **auth_bug_01.py** - Security issues
   - SQL injection vulnerability
   - Hardcoded API key

2. **performance_bug_01.py** - Performance issues
   - O(n²) nested loop
   - N+1 query problem
   - Blocking operation

3. **quality_bug_01.py** - Code quality issues
   - Poor naming conventions
   - Magic numbers
   - Code duplication
   - Missing error handling
   - Complex function structure

4. **xss_bug_01.js** - Security issues
   - XSS vulnerability
   - Hardcoded API key
   - Missing error handling

5. **input_validation_bug_01.py** - Security issues
   - No input validation
   - No file validation

6. **memory_leak_01.js** - Performance issues
   - Memory leak
   - Inefficient operations
   - Event listener leak

7. **hardcoded_secret_01.ts** - Security issues
   - Hardcoded database password
   - Hardcoded AWS secret key

### Clean Files (1 file)

8. **clean_01.py** - No bugs (tests false positives)

**Total: 8 files, 21 known bugs**

## Ground Truth

The `ground_truth.json` file contains the exact bugs in each file:
- File name
- Review template to use
- Bug type
- Line number
- Description

## Running the Evaluation

### Prerequisites

1. Backend server running on `http://localhost:3001`
2. At least one AI provider configured in settings
3. Python 3.7+ with `requests` library

### Installation

```bash
pip install requests
```

### Usage

```bash
cd eval
python run_evaluation.py
```

The script will:
1. Prompt for your email and password
2. Login to the application
3. Create an evaluation project
4. Upload all test files
5. Run reviews on each file
6. Compare results with ground truth
7. Calculate metrics
8. Save results to `results.json`
9. Save metrics to `metrics.json`
10. Clean up the evaluation project

### Example Output

```
🚀 AI Code Review Assistant - Evaluation
==================================================
✓ Loaded 8 test cases

🔐 Logging in...
✓ Login successful

✓ Created project: <project-id>

📤 Uploading test files...
✓ Uploaded auth_bug_01.py -> <file-id>
✓ Uploaded performance_bug_01.py -> <file-id>
✓ Uploaded quality_bug_01.py -> <file-id>
✓ Uploaded xss_bug_01.js -> <file-id>
✓ Uploaded input_validation_bug_01.py -> <file-id>
✓ Uploaded memory_leak_01.js -> <file-id>
✓ Uploaded hardcoded_secret_01.ts -> <file-id>
✓ Uploaded clean_01.py -> <file-id>

🔍 Running reviews...
  Reviewing auth_bug_01.py with security template...
    ✓ Completed in 3.45s
  Reviewing performance_bug_01.py with performance template...
    ✓ Completed in 2.87s
  ...

📊 Calculating metrics...

  📈 Overall Results:
    Precision: 82.35%
    Recall: 77.78%
    F1 Score: 80.00%
    Avg Time: 3.12s

💾 Results saved to results.json
💾 Metrics saved to metrics.json

🧹 Cleaned up evaluation project

✅ Evaluation complete!

📊 Summary:
  Precision: 82.35%
  Recall: 77.78%
  F1 Score: 80.00%
  Avg Time: 3.12s
```

## Metrics Explained

### Precision
**Formula**: TP / (TP + FP)

**Meaning**: Of all issues the AI detected, what percentage were actual bugs?

- High precision = Few false positives
- Low precision = Many false positives (AI hallucinates issues)

### Recall
**Formula**: TP / (TP + FN)

**Meaning**: Of all actual bugs, what percentage did the AI detect?

- High recall = Few false negatives (AI misses few bugs)
- Low recall = Many false negatives (AI misses many bugs)

### F1 Score
**Formula**: 2 × (Precision × Recall) / (Precision + Recall)

**Meaning**: Harmonic mean of precision and recall

- Balances both metrics
- Better single metric than accuracy for imbalanced datasets

### Response Time
**Formula**: Average time per review

**Meaning**: How fast the AI completes a review

- Important for user experience
- Varies by AI model and provider

## Bug Matching Logic

A detected issue is considered a match if:
1. **Type matches**: The bug type is similar (e.g., "hardcoded" matches "hardcoded_credential")
2. **Line proximity**: The line number is within ±3 lines of the ground truth

This allows for some flexibility since AI might report issues on nearby lines.

## Model Comparison

To compare different AI models:

1. Configure multiple AI providers in settings
2. Modify the script to use different providers
3. Run evaluation for each provider
4. Compare metrics in `metrics.json`

Example comparison table:

| Model | Precision | Recall | F1 Score | Avg Time |
|-------|-----------|--------|----------|----------|
| GPT-4 | 85% | 80% | 82% | 4.5s |
| GPT-3.5-Turbo | 78% | 72% | 75% | 2.1s |
| Llama 2 (Ollama) | 65% | 60% | 62% | 8.3s |

## Interpreting Results

### Good Results
- Precision > 70%
- Recall > 70%
- F1 Score > 70%

### Excellent Results
- Precision > 80%
- Recall > 80%
- F1 Score > 80%

### Needs Improvement
- Precision < 60% or Recall < 60%

## Using Results for Marketing

Based on your evaluation results, you can say:

**Example:**
> "On a test set of 8 files with 20 known bugs, my AI code review assistant achieved 82% precision and 78% recall, detecting 16 out of 20 bugs with only 3 false positives."

**For LinkedIn:**
> "I built an AI code review assistant that detects security vulnerabilities, performance issues, and code quality problems. In evaluation on 20 known bugs across 8 files, it achieved 82% precision and 78% recall."

**For README:**
> ## Performance
> Evaluated on a curated dataset of 8 files with 20 known bugs:
> - **Precision**: 82.35% (few false positives)
> - **Recall**: 77.78% (catches most bugs)
> - **F1 Score**: 80.00% (balanced performance)
> - **Average Response Time**: 3.12s

## Improving Metrics

### To Improve Precision (reduce false positives)
- Refine prompts to be more specific
- Add confidence thresholds
- Improve bug type classification
- Add post-processing filters

### To Improve Recall (reduce false negatives)
- Expand prompt coverage
- Add more examples to prompts
- Increase context window
- Try more capable models

### To Improve Response Time
- Use faster models (GPT-3.5 vs GPT-4)
- Implement caching
- Use local models (Ollama, LM Studio)
- Optimize prompt length

## Troubleshooting

### "Login failed"
- Check email and password
- Ensure backend is running
- Check API URL is correct

### "File upload failed"
- Check file exists in eval/ directory
- Check file size (< 50MB)
- Check backend logs

### "Review failed"
- Check AI provider is configured
- Check API key is valid
- Check model name is correct
- Check network connectivity

### Low metrics
- Review the detected issues in `results.json`
- Check if bug types are being classified correctly
- Adjust line matching tolerance
- Try different AI models

## Contributing

To add more test cases:

1. Create a new file in `eval/` with known bugs
2. Add the file to `TEST_FILES` in `run_evaluation.py`
3. Add ground truth to `ground_truth.json`
4. Re-run evaluation

## License

Same as main project (MIT)
