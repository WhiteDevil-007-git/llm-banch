"""
Router for Model Recommendations and Leaderboard API endpoints.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import HardwareSession, Model, ModelQuant
import schemas
from services.recommender import get_recommendations

router = APIRouter()

@router.get("/recommend", summary="Get Recommendations", description="Get model recommendations based on user hardware")
def recommend_models(
    token: str = Query(..., description="Hardware session token"),
    task: Optional[str] = Query(None, description="Optional task filter (e.g. chat, coding)"),
    limit: int = Query(5, le=10, description="Max number of recommendations to return"),
    db: Session = Depends(get_db)
):
    """Returns top recommended models for a user's hardware."""
    # 1. Get hardware session by token
    hw_session = db.query(HardwareSession).filter(HardwareSession.token == token).first()
    if not hw_session:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    # 2. Call get_recommendations
    recs = get_recommendations(
        db=db, 
        user_vram=hw_session.vram_gb, 
        user_ram=hw_session.ram_gb, 
        task=task, 
        limit=limit
    )
    
    # 3. Return list of recommendation dicts
    return recs


@router.get("/leaderboard", response_model=List[schemas.LeaderboardItem], summary="Get Leaderboard", description="Get a ranked list of models by metric")
def get_leaderboard(
    metric: str = Query("quality", description="Metric to rank by: speed, quality, efficiency"),
    limit: int = Query(10, description="Max number of models to return"),
    db: Session = Depends(get_db)
):
    """Returns the top models ranked by a specific metric."""
    results = []
    
    models = db.query(Model).all()
    
    for model in models:
        # Get quants for the model
        quants = db.query(ModelQuant).filter(ModelQuant.model_id == model.id).all()
        if not quants:
            continue
            
        # Calculate min_vram_gb (minimum across all quants)
        min_vram_gb = min(q.min_vram_gb for q in quants)
        
        # Calculate avg_tps_low
        avg_tps_low = sum(q.est_tps_low for q in quants) / len(quants)
        
        metric_value = 0.0
        
        if metric == "speed":
            metric_value = avg_tps_low
        elif metric == "efficiency":
            # Avoid division by zero
            safe_vram = min_vram_gb if min_vram_gb > 0 else 0.1
            metric_value = model.quality_score / safe_vram
        else: # default to quality
            metric_value = model.quality_score
            
        results.append(
            schemas.LeaderboardItem(
                id=model.id,
                name=model.name,
                ollama_tag=model.ollama_tag,
                family=model.family,
                params_b=model.params_b,
                quality_score=model.quality_score,
                min_vram_gb=min_vram_gb,
                avg_tps_low=avg_tps_low,
                metric_value=metric_value
            )
        )
        
    # Sort results
    results.sort(key=lambda x: x.metric_value, reverse=True)
    
    return results[:limit]
