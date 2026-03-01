# Universal Decision Companion – A Transparent Multi-Criteria Framework

## 1. Problem Understanding
Decisions like comparing job offers, buying a laptop, or picking a tech stack are often made with gut feelings or messy spreadsheets. This system functions as a **Universal Multi-Criteria Decision Framework**. It isn't just a basic app—it is a deeply contextual engine capable of evaluating *any* multi-dimensional scenario using weighted matrices. 

## Supported Decision Domains (Templates Built-In)
The system algorithm is fully abstracted, meaning it supports any numeric decision path without hardcoded variables. Examples built directly into the UI include:
*   **Job Offer Selection**: Evaluates Base Salary, Commute Time, Growth Potential, and Culture.
*   **Laptop Purchase**: Evaluates Price, Performance, Battery Life, and Weight.
*   **Travel Destination**: Evaluates Flight Cost, Weather Score, Safety, and Activities.
*   **Enterprise Scaling**: Can easily be configured ad-hoc to evaluate Vendor Selection, Cloud Providers, or Hiring Candidates.

## 2. Assumptions
*   Criteria weights typically map to a relative scale (e.g., summing to 1.0 or 100).
*   Users provide numerical values for the evaluated options.
*   At least 2 options are required for meaningful ranking.
*   Criteria types must be explicitly defined as "benefit" (higher is better) or "cost" (lower is better).

## 3. Architecture Overview & Maturity
The engine is structured modularly with clear separation of concerns to handle scoring, explanation generation, and meta-analysis independently.

```mermaid
flowchart TD
    UI[Frontend (React/Vite)] -->|Live Sliders & Options| API[FastAPI API Layer]
    API -->|Validation Layer| Engine[Decision Engine]
    
    subgraph Engine [Backend Process]
        Norm[Normalization Layer] --> Scorer[Scoring Layer]
        Scorer --> Exp[Explanation Engine]
        Scorer --> Meta[Analysis Engine\nSensitivity & Confidence]
    end
    
    Engine --> |Rich JSON Payload| API
    API --> |Dashboard & Meta-Insights| UI
```

## 4. Mathematical Justification
Why use the **Weighted Sum Model (WSM)** combined with **Min-Max Normalization**?

*   **Simplicity & Interpretability**: WSM allows users to literally trace the math (Score = Weight * Normalized Value), ensuring zero "black box" behavior.
*   **Deterministic Behavior**: The exact same inputs will perfectly yield the exact same ranks and explanations every single time, which is critical for trustworthy decision-making software.
*   **Why NOT Pure AI or ML?**: While AI is great for heuristics, it acts as a black box and requires massive training datasets. Decision companions require strict, auditable arithmetic logic.
*   **Why NOT AHP (Analytic Hierarchy Process)?**: AHP is extremely mathematically robust but often too heavy for everyday consumer scenarios due to its requirement for exhaustive pairwise comparison matrices. 

## 5. Explainability & Analysis Outputs
The system does not just spit out a final score. Our `Explanation Engine` and `Analysis Engine` execute meta-reviews on the outcomes:

*   **Why NOT Others**: Identifies exactly why a losing option lost compared to the winner (e.g., *“Compared to Dell XPS, MacBook Air was penalized by weak performance in Price”*).
*   **Conflict Detection**: Identifies objective trade-offs (e.g., *“Trade-off identified: Option A is best in Performance BUT Option B is best in Price.”*).
*   **Decision Confidence**: Analyzes the mathematical margin between rank 1 and rank 2 to declare if the decision is computationally "strong" or "weak/competitive".
*   **Sensitivity Analysis (Stability Score)**: The backend automatically loops weight variations (±10%) to see if the current #1 choice remains #1 when preferences shift, signaling robustness against uncertainty.

## 6. Limitations (Crucial Engineering Context)
Awareness of algorithmic limits is essential for mature engineering:
*   **Assumes Linear Preference**: The model assumes that moving from a $100 to $200 cost carries the exact same weight penalty as moving from $1000 to $1100.
*   **Does Not Capture Interaction**: The criteria are considered completely independent. Interaction terms (e.g., High Performance + Low Battery = negative synergy) are not automatically factored.
*   **Sensitive to Extreme Values (Outliers)**: Because it relies on basic Min-Max normalization, a single extreme outlier can skew the normalization bounds for all subsequent options.
*   **Requires Numeric Scoring**: Qualitative assessments must be manually converted to a numeric rating scale by the user.

## 7. Edge Case Handling Strategies
*   **Identical Values (Division-by-Zero Prevention)**: If Option A and Option B both score the exact same value in a specific criteria, the `NormalizationLayer` bypasses the Min-Max formula and applies a flat `1.0` bonus to both simultaneously.
*   **Zero-Weight Criteria**: Normalizes naturally but multiplies by exactly `0` gracefully.
*   **Missing Data gracefully handled** via baseline fallback parameters.
