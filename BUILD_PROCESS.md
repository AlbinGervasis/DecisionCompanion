# The DecisionCompanion Evolution: A Deep-Dive into the Engineering Process

This document provides a transparent look into my technical decision-making, the evolution of my system architecture, and the specific engineering trade-offs made during the development of the **Universal Decision Companion**.

---

## 1. How It Started: The "Static Baseline"
Originally, this project began as a specialized **Laptop Comparison Script**. 
*   **The Initial Approach**: I hardcoded criteria like "Price," "RAM," and "Storage" into a Python dictionary. 
*   **Thinking Behind It**: At first, I just wanted to solve the "Which Mac should I buy?" problem. I was focused on the formula itself, not the architecture.
*   **The Problem**: I realized that as soon as I wanted to compare "Job Offers" or "Travel Destinations," I had to rewrite the entire backend.

## 2. Thinking Evolution: From Script to Framework
I realized that the true value isn't in comparing laptops—it's in the **Generic Mathematical Logic** of comparing *anything* multi-dimensional.
*   **Evolutionary Shift**: I pivoted from a "Comparison Tool" to a **Universal Decision Context Framework**. 
*   **Key Insight**: A recruiter doesn't just want to see that I can code a laptop list; they want to see that I can build a **System** that handles dynamic, unknown data structures.

## 3. Alternative Approaches Considered & Rejected
During the design phase, I weighed three major architectural paths:

| Alternative | Rationale for Rejection |
| :--- | :--- |
| **Pure LLM Ranking** | I initially considered using GPT-4 to rank options based on descriptions. I rejected this because it is **non-deterministic** and "Black Box." A decision tool must be auditable; you should see the math. |
| **Analytical Hierarchy Process (AHP)** | AHP is mathematically superior for handling qualitative data (pairwise comparisons). However, it requires $O(n^2)$ inputs from the user. I rejected it because the **User Friction** was too high for a "Companion" tool. |
| **Weighted Sum Model (WSM)** | **The Chosen Path**: It provides $O(n)$ simplicity while being 100% transparent. To fix its weaknesses, I added a "Meta-Analysis" layer (v2.0). |

## 4. Major Refactoring Decisions
As the project grew, I made several critical "Course Correction" refactors:
*   **Decoupling the Logic**: Initially, the math was inside the FastAPI route. I refactored this into the `engine.py` with 4 distinct classes (`NormalizationLayer`, `ScoringLayer`, `ExplanationEngine`, `AnalysisEngine`). This allows the engine to be tested or reused in a CLI or Mobile app without the API.
*   **Stateless to Stateful UI**: The frontend began as a series of simple inputs. I refactored it into a **Stateful Context Injection Dashboard**, where things like `localStorage` and `Framer Motion` animations react to the data's rank (live-mode).

## 5. Mistakes & Corrections (Technical Debt Paid)
*   **The "Cost" Oversight (Mistake)**: In v1.0, I normalized everything as "Higher is Better." I quickly realized that for "Price" or "Commute Time," a higher value should yield a **lower** score. 
    *   **The Correction**: I implemented a `criteria_type` flag and updated the math to use $(max - x) / (max - min)$ for cost criteria.
*   **The Division-by-Zero Crash (Mistake)**: When two options had the exact same score for a criterion, the $max - min$ denominator became zero, crashing the engine.
    *   **The Correction**: Added a "Neutralization Guard" (Line 23 of `engine.py`) that returns a perfect 1.0 score if no variance exists, ensuring the engine is crash-proof.
*   **Raw Value Bias**: Initially, I compared raw scores (e.g., $1000 price vs 8.5 performance). The high prices were drowning out the performance scores in the sum. 
    *   **The Correction**: Introduced **Min-Max Normalization** as a mandatory first step before any weight multiplication occurs.

## 6. What Changed During Development & Why
1.  **Added Sensitivity Analysis**: I realized users often "guess" weights. I added the **Stability Score** (±10% variations) to tell users if their decision is actually stable or just a "lucky" result of a specific weight.
2.  **Shifted from Text to Visuals**: Initially, results were just a sorted list. I updated the UI to use **animated ranking bars** and **influence meters**. In professional software, "Perception is Reality"—the visualization makes the math feel more powerful.
3.  **Local Persistence**: Added `localStorage` because I realized that real-world complex decisions take hours or days of tweaking, not just one session.

## Summary: My Engineering Capability
This project demonstrates that I can:
1.  **Analyze** a complex domain (MCDA).
2.  **Evaluate** mathematical trade-offs (WSM vs AHP).
3.  **Refactor** code for modularity and scalability.
4.  **Polish** a product with production-grade UI/UX and persistence.
5.  **Acknowledge** and fix edge cases (Division-by-zero, Cost/Benefit flipping).

---
**Author**: Albin Gervasis
**Project Version**: 2.1.0 (LTS Architecture)
