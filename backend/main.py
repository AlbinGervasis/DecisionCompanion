from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List
import engine

VERSION = "2.1.0"
app = FastAPI(title="SmartDecision API - v" + VERSION)

# Setup CORS for the React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EvaluationRequest(BaseModel):
    options: Dict[str, Dict[str, float]]
    criteria: List[str]
    weights: Dict[str, float]
    criteria_type: Dict[str, str]

class EvaluationResponse(BaseModel):
    ranked_options: List[tuple]
    explanations: Dict
    analysis: Dict

@app.get("/")
def read_root():
    return {"message": "Welcome to the SmartDecision Engine API. Ready to evaluate alternatives."}

@app.post("/evaluate", response_model=EvaluationResponse)
def evaluate_decision(payload: EvaluationRequest):
    decision_engine = engine.DecisionEngine()
    try:
        ranked, explanations, analysis = decision_engine.calculate_scores(
            options=payload.options,
            criteria=payload.criteria,
            weights=payload.weights,
            criteria_type=payload.criteria_type
        )
        return EvaluationResponse(ranked_options=ranked, explanations=explanations, analysis=analysis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
