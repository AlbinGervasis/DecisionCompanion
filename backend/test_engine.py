import pytest
from engine import DecisionEngine

def test_engine_basic():
    engine = DecisionEngine()
    options = {
        "A": {"Price": 100, "Quality": 10},
        "B": {"Price": 200, "Quality": 20}
    }
    criteria = ["Price", "Quality"]
    weights = {"Price": 0.5, "Quality": 0.5}
    criteria_type = {"Price": "cost", "Quality": "benefit"}
    
    ranked, explanations, analysis = engine.calculate_scores(options, criteria, weights, criteria_type)
    assert len(ranked) == 2
    # Options A Price 100 -> Cost, 
    # Price min 100, max 200. A score (200-100)/(200-100)=1.0
    # Quality min 10, max 20. A score (10-10)/(20-10)=0.0
    # B Price 200 -> Score 0.0, Quality -> Score 1.0
    # Both score exactly 0.5 * 1.0 + 0.5 * 0.0 = 0.5
    assert "A" in [r[0] for r in ranked]
    assert explanations["A"]["total_score"] == 0.5

def test_zero_weights():
    engine = DecisionEngine()
    options = {"A": {"Price": 100}, "B": {"Price": 50}}
    ranked, _, _ = engine.calculate_scores(options, ["Price"], {"Price": 0.0}, {"Price": "cost"})
    assert ranked[0][1] == 0

def test_same_values_division_by_zero():
    engine = DecisionEngine()
    options = {"A": {"Price": 100}, "B": {"Price": 100}}
    ranked, _, _ = engine.calculate_scores(options, ["Price"], {"Price": 1.0}, {"Price": "cost"})
    assert ranked[0][1] == 1.0
    assert ranked[1][1] == 1.0

def test_missing_data():
    engine = DecisionEngine()
    options = {"A": {"Price": 100}, "B": {}}
    ranked, _, _ = engine.calculate_scores(options, ["Price"], {"Price": 1.0}, {"Price": "cost"})
    # A=100, B=0 (default fallback)
    assert len(ranked) == 2

def test_empty():
    engine = DecisionEngine()
    r, e, a = engine.calculate_scores({}, [], {}, {})
    assert r == []
