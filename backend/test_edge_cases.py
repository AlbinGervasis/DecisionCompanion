from engine import DecisionEngine
import json

def test_identical_values():
    print("--- Edge Case 1: Identical Values ---")
    engine = DecisionEngine()
    options = {
        "A": {"Price": 100},
        "B": {"Price": 100}
    }
    criteria = ["Price"]
    weights = {"Price": 1.0}
    criteria_type = {"Price": "cost"}
    
    ranked, explanations, analysis = engine.calculate_scores(options, criteria, weights, criteria_type)
    print("Ranked:", ranked)
    print("Explanation for A:", explanations["A"]["details"][0]["normalized_score"])
    print("Explanation for B:", explanations["B"]["details"][0]["normalized_score"])
    print("Both receive an equal normalized score of 1.0 to prevent division by zero.")
    print()

def test_missing_or_zero_weight():
    print("--- Edge Case 2: Zero Weight Criterion ---")
    engine = DecisionEngine()
    options = {
        "A": {"Speed": 50, "Style": 10},
        "B": {"Speed": 100, "Style": 5}
    }
    criteria = ["Speed", "Style"]
    weights = {"Speed": 1.0, "Style": 0.0} # Style has zero weight
    criteria_type = {"Speed": "benefit", "Style": "benefit"}
    
    ranked, explanations, analysis = engine.calculate_scores(options, criteria, weights, criteria_type)
    print("Ranked:", ranked)
    print("B wins purely due to speed, style is calculated but contributes exactly 0.")
    print("Style Contribution for A:", explanations["A"]["details"][1]["weighted_contribution"])
    print("Style Contribution for B:", explanations["B"]["details"][1]["weighted_contribution"])
    print()

def test_empty_inputs():
    print("--- Edge Case 3: Empty inputs ---")
    engine = DecisionEngine()
    ranked, explanations, analysis = engine.calculate_scores({}, [], {}, {})
    print("Empty Ranked:", ranked)
    print("Empty Explanations:", explanations)
    print()

if __name__ == "__main__":
    test_identical_values()
    test_missing_or_zero_weight()
    test_empty_inputs()
