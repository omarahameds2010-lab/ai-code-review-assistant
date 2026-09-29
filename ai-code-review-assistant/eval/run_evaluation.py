#!/usr/bin/env python3
"""
AI Code Review Assistant - Evaluation Script

This script evaluates the code review assistant's performance by:
1. Uploading test files with known bugs
2. Running reviews on each file
3. Comparing results with ground truth
4. Calculating precision, recall, and other metrics
5. Comparing different AI models
"""

import json
import requests
import time
from typing import Dict, List, Tuple
from pathlib import Path

# Configuration
API_BASE = "http://localhost:3001"
EVAL_DIR = Path(__file__).parent
GROUND_TRUTH_FILE = EVAL_DIR / "ground_truth.json"
RESULTS_FILE = EVAL_DIR / "results.json"
METRICS_FILE = EVAL_DIR / "metrics.json"

# Test files
TEST_FILES = {
    "auth_bug_01.py": EVAL_DIR / "auth_bug_01.py",
    "performance_bug_01.py": EVAL_DIR / "performance_bug_01.py",
    "quality_bug_01.py": EVAL_DIR / "quality_bug_01.py",
    "xss_bug_01.js": EVAL_DIR / "xss_bug_01.js",
    "input_validation_bug_01.py": EVAL_DIR / "input_validation_bug_01.py",
    "memory_leak_01.js": EVAL_DIR / "memory_leak_01.js",
    "hardcoded_secret_01.ts": EVAL_DIR / "hardcoded_secret_01.ts",
    "clean_01.py": EVAL_DIR / "clean_01.py",
}

class ReviewEvaluator:
    def __init__(self, api_base: str, token: str):
        self.api_base = api_base
        self.token = token
        self.headers = {"Authorization": f"Bearer {token}"}
        self.project_id = None
        self.file_ids = {}
        
    def login(self, email: str, password: str) -> str:
        """Login and get JWT token."""
        response = requests.post(
            f"{self.api_base}/auth/login",
            json={"email": email, "password": password}
        )
        if response.status_code == 200:
            return response.json()["token"]
        raise Exception(f"Login failed: {response.text}")
    
    def create_project(self, name: str = "Evaluation Project") -> str:
        """Create a project for evaluation."""
        response = requests.post(
            f"{self.api_base}/projects",
            headers=self.headers,
            json={"name": name, "description": "Automated evaluation project"}
        )
        if response.status_code == 201:
            self.project_id = response.json()["id"]
            print(f"✓ Created project: {self.project_id}")
            return self.project_id
        raise Exception(f"Project creation failed: {response.text}")
    
    def upload_file(self, file_path: Path) -> str:
        """Upload a single file to the project."""
        if not self.project_id:
            raise Exception("No project created")
        
        with open(file_path, 'rb') as f:
            files = {'files': (file_path.name, f, 'text/plain')}
            data = {
                'type': 'files',
                'projectId': self.project_id
            }
            response = requests.post(
                f"{self.api_base}/files/upload",
                headers=self.headers,
                files=files,
                data=data
            )
        
        if response.status_code == 201:
            file_data = response.json()[0] if isinstance(response.json(), list) else response.json()
            file_id = file_data.get("id")
            self.file_ids[file_path.name] = file_id
            print(f"✓ Uploaded {file_path.name} -> {file_id}")
            return file_id
        raise Exception(f"File upload failed: {response.text}")
    
    def upload_all_files(self) -> Dict[str, str]:
        """Upload all test files."""
        print("\n📤 Uploading test files...")
        for file_name, file_path in TEST_FILES.items():
            if file_path.exists():
                self.upload_file(file_path)
            else:
                print(f"⚠ File not found: {file_path}")
        return self.file_ids
    
    def run_review(self, file_name: str, template: str, ai_provider_id: str = None) -> dict:
        """Run a review on a specific file."""
        if file_name not in self.file_ids:
            raise Exception(f"File not uploaded: {file_name}")
        
        payload = {
            "name": f"Evaluation: {file_name}",
            "template": template,
            "projectId": self.project_id,
            "fileIds": [self.file_ids[file_name]],
            "aiProviderId": ai_provider_id or self.get_default_provider()
        }
        
        response = requests.post(
            f"{self.api_base}/reviews",
            headers=self.headers,
            json=payload
        )
        
        if response.status_code == 201:
            return response.json()
        raise Exception(f"Review failed: {response.text}")
    
    def get_default_provider(self) -> str:
        """Get the default AI provider ID."""
        response = requests.get(
            f"{self.api_base}/ai-providers/default",
            headers=self.headers
        )
        if response.status_code == 200:
            return response.json()["id"]
        raise Exception("No default AI provider found")
    
    def evaluate_all(self, ground_truth: List[dict]) -> Dict[str, dict]:
        """Run reviews on all files and collect results."""
        print("\n🔍 Running reviews...")
        results = {}
        
        for item in ground_truth:
            file_name = item["file"]
            template = item["template"]
            
            try:
                print(f"  Reviewing {file_name} with {template} template...")
                start_time = time.time()
                review_result = self.run_review(file_name, template)
                elapsed_time = time.time() - start_time
                
                results[file_name] = {
                    "ground_truth": item["bugs"],
                    "detected": review_result.get("issues", []),
                    "summary": review_result.get("summary", ""),
                    "elapsed_time": elapsed_time
                }
                print(f"    ✓ Completed in {elapsed_time:.2f}s")
            except Exception as e:
                print(f"    ✗ Failed: {e}")
                results[file_name] = {
                    "ground_truth": item["bugs"],
                    "detected": [],
                    "error": str(e),
                    "elapsed_time": 0
                }
        
        return results
    
    def calculate_metrics(self, results: Dict[str, dict]) -> dict:
        """Calculate precision, recall, and other metrics."""
        print("\n📊 Calculating metrics...")
        
        total_tp = 0  # True Positives
        total_fp = 0  # False Positives
        total_fn = 0  # False Negatives
        total_tn = 0  # True Negatives
        
        file_metrics = {}
        
        for file_name, result in results.items():
            ground_truth_bugs = result["ground_truth"]
            detected_issues = result.get("detected", [])
            
            # Convert ground truth to matchable format
            gt_bugs = []
            for bug in ground_truth_bugs:
                gt_bugs.append({
                    "type": bug["type"],
                    "line": bug["line"]
                })
            
            # Match detected issues with ground truth
            tp = 0
            fp = 0
            fn = 0
            matched_gt = set()
            matched_detected = set()
            
            for i, detected in enumerate(detected_issues):
                detected_type = self.normalize_bug_type(detected.get("description", ""))
                detected_line = detected.get("line")
                
                matched = False
                for j, gt_bug in enumerate(gt_bugs):
                    if j in matched_gt:
                        continue
                    
                    gt_type = gt_bug["type"]
                    gt_line = gt_bug["line"]
                    
                    # Check if types match and lines are close (±3)
                    if (self.types_match(detected_type, gt_type) and 
                        detected_line and 
                        abs(detected_line - gt_line) <= 3):
                        tp += 1
                        matched_gt.add(j)
                        matched_detected.add(i)
                        matched = True
                        break
                
                if not matched:
                    fp += 1
            
            # Count unmatched ground truth bugs as false negatives
            fn = len(gt_bugs) - len(matched_gt)
            
            # True negatives: clean files with no false positives
            if len(gt_bugs) == 0 and fp == 0:
                total_tn += 1
            
            total_tp += tp
            total_fp += fp
            total_fn += fn
            
            # Calculate per-file metrics
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0
            f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
            
            file_metrics[file_name] = {
                "tp": tp,
                "fp": fp,
                "fn": fn,
                "precision": precision,
                "recall": recall,
                "f1": f1,
                "elapsed_time": result.get("elapsed_time", 0)
            }
        
        # Calculate overall metrics
        overall_precision = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 0
        overall_recall = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 0
        overall_f1 = 2 * (overall_precision * overall_recall) / (overall_precision + overall_recall) if (overall_precision + overall_recall) > 0 else 0
        
        avg_time = sum(m["elapsed_time"] for m in file_metrics.values()) / len(file_metrics) if file_metrics else 0
        
        metrics = {
            "overall": {
                "true_positives": total_tp,
                "false_positives": total_fp,
                "false_negatives": total_fn,
                "true_negatives": total_tn,
                "precision": overall_precision,
                "recall": overall_recall,
                "f1_score": overall_f1,
                "avg_time": avg_time
            },
            "per_file": file_metrics
        }
        
        print(f"\n  📈 Overall Results:")
        print(f"    Precision: {overall_precision:.2%}")
        print(f"    Recall: {overall_recall:.2%}")
        print(f"    F1 Score: {overall_f1:.2%}")
        print(f"    Avg Time: {avg_time:.2f}s")
        
        return metrics
    
    def normalize_bug_type(self, description: str) -> str:
        """Normalize bug type from description."""
        desc_lower = description.lower()
        
        type_mapping = {
            "sql injection": "sql_injection",
            "hardcoded": "hardcoded_credential",
            "api key": "hardcoded_credential",
            "password": "hardcoded_credential",
            "xss": "xss_vulnerability",
            "injection": "injection_risk",
            "validation": "input_validation",
            "memory leak": "memory_leak",
            "efficient": "inefficient_algorithm",
            "algorithm": "inefficient_algorithm",
            "query": "n_plus_one_query",
            "blocking": "blocking_operation",
            "naming": "poor_naming",
            "magic": "magic_number",
            "duplicate": "code_duplication",
            "error handling": "missing_error_handling",
            "complex": "complex_function",
        }
        
        for keyword, bug_type in type_mapping.items():
            if keyword in desc_lower:
                return bug_type
        
        return "other"
    
    def types_match(self, detected_type: str, gt_type: str) -> bool:
        """Check if detected bug type matches ground truth type."""
        # Exact match
        if detected_type == gt_type:
            return True
        
        # Fuzzy matching for similar types
        type_groups = {
            "hardcoded_credential": ["hardcoded_credential", "hardcoded_secret"],
            "injection_risk": ["sql_injection", "xss_vulnerability", "injection_risk"],
            "inefficient_algorithm": ["inefficient_algorithm", "inefficient_operation"],
        }
        
        for group in type_groups.values():
            if detected_type in group and gt_type in group:
                return True
        
        return False
    
    def save_results(self, results: dict, metrics: dict):
        """Save results and metrics to files."""
        with open(RESULTS_FILE, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n💾 Results saved to {RESULTS_FILE}")
        
        with open(METRICS_FILE, 'w') as f:
            json.dump(metrics, f, indent=2)
        print(f"💾 Metrics saved to {METRICS_FILE}")
    
    def cleanup(self):
        """Clean up by deleting the evaluation project."""
        if self.project_id:
            try:
                requests.delete(
                    f"{self.api_base}/projects/{self.project_id}",
                    headers=self.headers
                )
                print(f"\n🧹 Cleaned up evaluation project")
            except Exception as e:
                print(f"⚠ Cleanup failed: {e}")


def main():
    """Main evaluation workflow."""
    print("🚀 AI Code Review Assistant - Evaluation")
    print("=" * 50)
    
    # Load ground truth
    with open(GROUND_TRUTH_FILE) as f:
        ground_truth = json.load(f)
    total_bugs = sum(len(item["bugs"]) for item in ground_truth)
    print(f"✓ Loaded {len(ground_truth)} test cases with {total_bugs} known bugs")
    
    # Get credentials
    email = input("\n📧 Email: ")
    password = input("🔑 Password: ")
    
    # Initialize evaluator
    try:
        evaluator = ReviewEvaluator(API_BASE, "")
        
        # Login
        print("\n🔐 Logging in...")
        token = evaluator.login(email, password)
        evaluator.token = token
        evaluator.headers = {"Authorization": f"Bearer {token}"}
        print("✓ Login successful")
        
        # Create project
        evaluator.create_project()
        
        # Upload files
        evaluator.upload_all_files()
        
        # Run evaluations
        results = evaluator.evaluate_all(ground_truth)
        
        # Calculate metrics
        metrics = evaluator.calculate_metrics(results)
        
        # Save results
        evaluator.save_results(results, metrics)
        
        # Cleanup
        evaluator.cleanup()
        
        print("\n✅ Evaluation complete!")
        print(f"\n📊 Summary:")
        print(f"  Precision: {metrics['overall']['precision']:.2%}")
        print(f"  Recall: {metrics['overall']['recall']:.2%}")
        print(f"  F1 Score: {metrics['overall']['f1_score']:.2%}")
        print(f"  Avg Time: {metrics['overall']['avg_time']:.2f}s")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
