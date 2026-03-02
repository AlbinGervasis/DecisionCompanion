# Research & Methodology Log: Decision Engine Synthesis

This document logs the research, mathematical validation, and prompt engineering used to develop the **Universal Decision Companion**. It demonstrates the transition from raw requirements to a logically sound engineering solution.

---

## 📋 1. Problem Understanding
The core challenge was to build a system that moves beyond "gut feeling" comparisons into a **Deterministic Decision Space**.

| Surface Requirement | Engineering Reality (Intellectual Depth) |
| :--- | :--- |
| "Compare three laptops" | Implement a multi-dimensional **Normalization Layer** to standardise units. |
| "Show which is better" | Execute a **Weighted Sum Model (WSM)** to calculate aggregate utility. |
| "Explain the choice" | Engineer a **Deficit Analysis Heuristic** to identify the primary reason for a lower rank. |
| "Make it reliable" | Implement a **Sensitivity Analysis Loop** to test decision stability ±10%. |

---

## 🧠 2. Methodology Research
I evaluated multiple **Multi-Criteria Decision Analysis (MCDA)** techniques:

### Research Cycle 1: Analytic Hierarchy Process (AHP)
*   **Search/Prompt**: "How to implement AHP in Python for small-scale consumer decisions?"
*   **Discovery**: AHP uses pairwise comparison matrices to calculate consistency ratios.
*   **Trade-off**: While mathematically rigorous, it requires $(n \times (n-1))/2$ inputs from the user. For 10 criteria, that's 45 questions.
*   **Decision**: **REJECTED** due to extreme user friction.

### Research Cycle 2: Weighted Sum Model (WSM) + Min-Max
*   **Search/Prompt**: "Linear normalization vs. vector normalization for decision support."
*   **Discovery**: **Min-Max Normalization** is ideal for linear preferences. It transforms any range into $[0, 1]$.
*   **Decision**: **SELECTED**. It provides the best balance of speed, transparency, and logical clarity.

---

## 🛠️ 3. Prompt Engineering Evolution
To refine the **Sentiment/Explanation Engine**, I used iterative prompting to move from "generic" to "contextual" insights.

### Iteration 1: The Basic Calculation
*   **Prompt**: "Calculate the weighted sum of these options."
*   **Result**: Valid math, but no "Why?"
*   **Learning**: The math is only half the solution; the *explanation* is the product.

### Iteration 2: The Deficit Logic
*   **Prompt**: "Identify which single criterion contributed most to the score difference between Rank 1 and Rank 2."
*   **Outcome**: Lead to the implementation of `ExplanationEngine.explain_why_not_others`. It identifies the **Max Negative Delta** per option.

---

## 📊 4. Logical Assumptions & Validations

| Assumption | Impact on Logic | Validation Strategy |
| :--- | :--- | :--- |
| **Linear Utility** | Assumes $2x$ cost is exactly $2x$ worse. | Documented in `README` Limitations. |
| **Independent Criteria** | Criteria like "Price" and "Performance" don't interact. | Standard WSM assumption; mitigated by Sensitivity Testing. |
| **Full Information** | Users provide all numeric values. | Implemented "Baseline Fallback" (0.0 score) for missing cells. |

---

## 🚀 5. Final Synthesis
The research phase concluded that a **Transparent, Deterministic Engine** is superior to a **Black-Box AI** for high-stakes decisions. The final architecture reflects this through its decoupled tiers of Normalization, Scoring, and Meta-Analysis.
