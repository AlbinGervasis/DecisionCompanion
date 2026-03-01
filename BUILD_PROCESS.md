# Build Process Log

Here is a step-by-step breakdown of how this Decision Companion System was designed and implemented:

1. **Initial Concept**: The system was built out of the necessity to have a logical, reliable way to make smart decisions with multiple criteria. Initially considered relying purely on AI ranking.
2. **Methodology Selection**: We rejected a pure AI-based ranking due to its black-box nature which makes validating or adjusting a decision very difficult.
3. **Research**: Conducted deep research on Multi-Criteria Decision Analysis (MCDA).
4. **Model Comparison**: Examined the trade-offs between Analytic Hierarchy Process (AHP) versus the Weighted Sum Model (WSM).
5. **Final Choice**: Chose weighted sum for simplicity, speed, and clarity in code complexity.
6. **Architecture Extraction**: Refactored the core scoring engine (`engine.py`) into a separate backend module serving via FastAPI.
7. **Transparent Explainability**: After the initial prototype calculation worked, added an explanation generator that translates the logic process to human-readable strings.

**Feedback Note**: *This transparency is a key differentiator. The explanations provide confidence compared to a black box.*
