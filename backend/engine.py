from typing import List, Dict, Union, Tuple, Any
import copy

class NormalizationLayer:
    @staticmethod
    def normalize(options: Dict[str, Dict[str, float]],
                  criteria: List[str],
                  criteria_type: Dict[str, str]) -> Tuple[Dict[str, Dict[str, float]], Dict[str, Dict[str, float]]]:
        normalized = {}
        min_max = {}
        for c in criteria:
            values = [options[o].get(c, 0) for o in options]
            min_max[c] = {"min": min(values), "max": max(values), "avg": sum(values)/len(values) if values else 0}

        for o in options:
            if o not in normalized:
                normalized[o] = {}
            for c in criteria:
                val = options[o].get(c, 0)
                c_min = min_max[c]["min"]
                c_max = min_max[c]["max"]
                
                if c_max == c_min:
                    norm_val = 1.0
                else:
                    if criteria_type.get(c, "benefit") == "benefit":
                        norm_val = (val - c_min) / (c_max - c_min)
                    else:
                        norm_val = (c_max - val) / (c_max - c_min)
                normalized[o][c] = norm_val
        return normalized, min_max


class ScoringLayer:
    @staticmethod
    def calculate_scores(normalized: Dict[str, Dict[str, float]],
                         options: Dict[str, Dict[str, float]],
                         criteria: List[str],
                         weights: Dict[str, float],
                         criteria_type: Dict[str, str],
                         min_max: Dict[str, Dict[str, float]]) -> Tuple[Dict[str, float], Dict]:
        scores = {}
        explanations = {}
        
        for o in normalized:
            explanations[o] = {"details": []}
            total_score = 0
            for c in criteria:
                norm_val = normalized[o][c]
                val = options[o].get(c, 0)
                weight_contrib = norm_val * weights.get(c, 0)
                total_score += weight_contrib
                
                avg = min_max[c]["avg"]
                diff_from_avg = ((val - avg) / avg * 100) if avg != 0 else 0
                
                if criteria_type.get(c, "benefit") == "benefit":
                    desc = f"above average ({val})" if diff_from_avg > 0 else f"below average ({val})"
                else:
                    desc = f"better than average lower cost ({val})" if diff_from_avg < 0 else f"higher than average cost ({val})"
                
                explanations[o]["details"].append({
                    "criterion": c,
                    "normalized_score": round(norm_val, 3),
                    "weighted_contribution": round(weight_contrib, 4),
                    "insight": f"{c} is {desc}"
                })
            scores[o] = round(total_score, 4)
            explanations[o]["total_score"] = scores[o]
            
        return scores, explanations


class ExplanationEngine:
    @staticmethod
    def explain_winner(ranked: List[Tuple[str, float]], explanations: Dict):
        if not ranked: return
        winner, win_score = ranked[0]
        explanations[winner]["summary"] = f"{winner} is the optimal choice with a score of {win_score}."
        strongest_c = max(explanations[winner]["details"], key=lambda x: x["weighted_contribution"])
        explanations[winner]["summary"] += f" Its strongest factor was {strongest_c['criterion']}."

    @staticmethod
    def explain_why_not_others(ranked: List[Tuple[str, float]], explanations: Dict):
        if len(ranked) < 2: return
        winner = ranked[0][0]
        for name, score in ranked[1:]:
            # Find the criterion where this option suffered the most compared to the winner
            weakest_details = min(explanations[name]["details"], key=lambda x: x["normalized_score"])
            crit = weakest_details["criterion"]
            norm_sc = weakest_details["normalized_score"]
            explanations[name]["why_not_winner"] = f"Compared to {winner}, {name} was penalized by weak performance in {crit} (normalized score: {norm_sc})."


class AnalysisEngine:
    @staticmethod
    def calculate_confidence(ranked: List[Tuple[str, float]]) -> Dict[str, Any]:
        if len(ranked) < 2:
            return {"score": 1.0, "message": "Only one option available."}
        top_score = ranked[0][1]
        second_score = ranked[1][1]
        diff = top_score - second_score
        
        if diff < 0.05:
            msg = f"Decision is weak (Margin of {round(diff,3)}). {ranked[0][0]} and {ranked[1][0]} are highly competitive."
        elif diff < 0.15:
            msg = f"Decision is moderate (Margin of {round(diff,3)})."
        else:
            msg = f"Decision is strong (Margin of {round(diff,3)}). {ranked[0][0]} is a clear winner."
            
        return {"score": round(diff, 4), "message": msg}

    @staticmethod
    def detect_conflicts(normalized: Dict[str, Dict[str, float]], criteria: List[str]) -> List[str]:
        # Finds if Option A is best in Crit1 and Option B is best in Crit2
        best_in = {}
        for c in criteria:
            try:
                best_opt = max(normalized.keys(), key=lambda o: normalized[o][c])
                if normalized[best_opt][c] == 1.0: # Only count if it's the actual distinct best
                    best_in[c] = best_opt
            except ValueError:
                pass
                
        # Group by option
        opt_to_best_crits = {}
        for c, o in best_in.items():
            if o not in opt_to_best_crits:
                opt_to_best_crits[o] = []
            opt_to_best_crits[o].append(c)
            
        conflicts = []
        opts = list(opt_to_best_crits.keys())
        for i in range(len(opts)):
            for j in range(i+1, len(opts)):
                o1 = opts[i]
                o2 = opts[j]
                conflicts.append(f"Trade-off identified: {o1} is best in {', '.join(opt_to_best_crits[o1])} BUT {o2} is best in {', '.join(opt_to_best_crits[o2])}.")
        return conflicts

    @staticmethod
    def run_sensitivity(options: Dict[str, Dict[str, float]], 
                        criteria: List[str], 
                        base_weights: Dict[str, float], 
                        criteria_type: Dict[str, str],
                        current_winner: str) -> Dict[str, Any]:
        variations_run = 0
        winner_held_count = 0
        
        # Test ±10% on each weight independently
        for c in criteria:
            for variation in [0.9, 1.1]:
                test_weights = copy.deepcopy(base_weights)
                test_weights[c] = test_weights[c] * variation
                
                normalized, min_max = NormalizationLayer.normalize(options, criteria, criteria_type)
                scores, _ = ScoringLayer.calculate_scores(normalized, options, criteria, test_weights, criteria_type, min_max)
                ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
                
                if ranked and ranked[0][0] == current_winner:
                    winner_held_count += 1
                variations_run += 1
                
        stability = (winner_held_count / variations_run) * 100 if variations_run > 0 else 100
        return {
            "stability_score": round(stability, 2),
            "total_variations": variations_run,
            "message": f"Stability Score: {current_winner} remained rank 1 in {round(stability, 1)}% of ±10% weight variations."
        }

class DecisionEngine:
    def calculate_scores(self, options: Dict[str, Dict[str, float]], 
                        criteria: List[str], 
                        weights: Dict[str, float], 
                        criteria_type: Dict[str, str]) -> Tuple[List[Tuple[str, float]], Dict, Dict]:
        
        if not options or not criteria:
            return [], {}, {}

        # 1. Normalization
        normalized, min_max = NormalizationLayer.normalize(options, criteria, criteria_type)
        
        # 2. Base Scoring
        scores, explanations = ScoringLayer.calculate_scores(normalized, options, criteria, weights, criteria_type, min_max)
        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        winner = ranked[0][0] if ranked else None

        # 3. Explainability
        ExplanationEngine.explain_winner(ranked, explanations)
        ExplanationEngine.explain_why_not_others(ranked, explanations)

        # 4. Meta-Analysis Features
        confidence = AnalysisEngine.calculate_confidence(ranked)
        conflicts = AnalysisEngine.detect_conflicts(normalized, criteria)
        sensitivity = AnalysisEngine.run_sensitivity(options, criteria, weights, criteria_type, winner)

        analysis = {
            "confidence": confidence,
            "tradeoffs": conflicts,
            "sensitivity": sensitivity
        }

        return ranked, explanations, analysis
