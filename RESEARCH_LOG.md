# Research & Development Log

## AI Prompts Evaluated
* "How to implement a weighted decision model in Python?"
* "Difference between AHP and weighted sum model?"
* "How to structure a flexible decision companion dashboard using FastAPI and React Vite?"

## Google Code/Technical Searches
* "Multi-criteria decision analysis methods"
* "Normalization formula for benefit vs cost criteria MCDA"
* "FastAPI response models for dynamic dictionaries dict[str, dict]"

## Discarded Concepts (What Was Rejected)
* Fully AI-based scoring: The lack of predictability and difficulty tracking the origin of the logic rendered it unsuitable as a primary, trustworthy companion.
* Static hardcoded criteria: To act as a universal companion for *any* decision (laptops, locations, jobs, cars), the criteria must be dynamic dictionaries built at runtime.

## Technical Pivots (What Was Modified)
* Adjusted normalization logic to inherently handle scenarios dividing by zero (i.e., all user inputs for a certain option carry the same score value). Instead of collapsing, it normalizes each value uniformly.
