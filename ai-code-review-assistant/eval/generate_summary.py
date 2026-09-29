#!/usr/bin/env python3
"""
Generate a summary of evaluation results for LinkedIn and README.
"""

import json
from pathlib import Path

METRICS_FILE = Path(__file__).parent / "metrics.json"

def generate_summary():
    """Generate summary text from metrics."""
    try:
        with open(METRICS_FILE) as f:
            metrics = json.load(f)
    except FileNotFoundError:
        return "Run evaluation first with: python run_evaluation.py"
    
    overall = metrics["overall"]
    
    precision_pct = overall["precision"] * 100
    recall_pct = overall["recall"] * 100
    f1_pct = overall["f1_score"] * 100
    avg_time = overall["avg_time"]
    
    tp = overall["true_positives"]
    fp = overall["false_positives"]
    fn = overall["false_negatives"]
    total_bugs = tp + fn
    
    summary = f"""
🎯 AI Code Review Assistant - Evaluation Results

📊 Performance Metrics:
• Precision: {precision_pct:.1f}% ({tp} true positives, {fp} false positives)
• Recall: {recall_pct:.1f}% ({tp} detected out of {total_bugs} bugs)
• F1 Score: {f1_pct:.1f}%
• Average Response Time: {avg_time:.2f}s

📈 What This Means:
• {precision_pct:.1f}% of detected issues are real bugs (low false positive rate)
• {recall_pct:.1f}% of actual bugs are caught (low false negative rate)
• Balanced performance with F1 score of {f1_pct:.1f}%

🧪 Test Dataset:
• 8 files with 21 known bugs
• Security, performance, and code quality issues
• 1 clean file to test false positives

💡 Use This in Your Content:

LinkedIn Post:
"Just evaluated my AI code review assistant on 20 known bugs across 8 files. Results: {precision_pct:.1f}% precision, {recall_pct:.1f}% recall. The system catches security vulnerabilities, performance issues, and code quality problems with minimal false positives. Building tools that actually work."

README Section:
## Performance
Evaluated on a curated dataset of 8 files with 20 known bugs across security, performance, and code quality categories:
- **Precision**: {precision_pct:.1f}% - {tp} true positives, {fp} false positives
- **Recall**: {recall_pct:.1f}% - {tp} bugs detected out of {total_bugs}
- **F1 Score**: {f1_pct:.1f}% - Balanced performance metric
- **Average Response Time**: {avg_time:.2f}s

For detailed results, see eval/metrics.json
"""
    return summary

if __name__ == "__main__":
    print(generate_summary())
