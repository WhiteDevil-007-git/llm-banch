"""
Router for Models API endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Model as db_models
from models import ModelQuant as db_quants
import schemas

router = APIRouter()

@router.get("/models", response_model=List[schemas.ModelListItem], summary="List Models", description="Get a list of models with optional filtering")
def list_models(
    search: Optional[str] = Query(None, description="Filter by name containing this string (case-insensitive)"),
    family: Optional[str] = Query(None, description="Filter by exact family match"),
    task: Optional[str] = Query(None, description="Filter models where tasks JSON string contains this task"),
    max_vram: Optional[float] = Query(None, description="Filter models that fit within this VRAM (GB)"),
    min_params: Optional[float] = Query(None, description="Filter by minimum parameters (B)"),
    max_params: Optional[float] = Query(None, description="Filter by maximum parameters (B)"),
    db: Session = Depends(get_db)
):
    """Returns a list of models applying filters."""
    query = db.query(db_models)
    
    # Filter by search string in name (case-insensitive)
    if search:
        query = query.filter(db_models.name.ilike(f"%{search}%"))
        
    # Filter by exact family match
    if family:
        query = query.filter(db_models.family == family)
        
    # Filter by task string
    if task:
        query = query.filter(db_models.tasks.ilike(f"%{task}%"))
        
    # Filter by parameter counts
    if min_params is not None:
        query = query.filter(db_models.params_b >= min_params)
    if max_params is not None:
        query = query.filter(db_models.params_b <= max_params)
        
    # Filter by maximum VRAM
    if max_vram is not None:
        # We want models that have at least one quant where min_vram_gb <= max_vram
        query = query.filter(db_models.quants.any(db_quants.min_vram_gb <= max_vram))
        
    # Order by quality score descending
    query = query.order_by(db_models.quality_score.desc())
    
    # Execute query
    models = query.all()
    
    # Build lightweight ModelListItem response manually since computed fields are needed
    result = []
    for model in models:
        # Compute min_vram across all quants
        min_v = 0.0
        if model.quants:
            min_v = min(q.min_vram_gb for q in model.quants)
            
        result.append(
            schemas.ModelListItem(
                id=model.id,
                name=model.name,
                ollama_tag=model.ollama_tag,
                family=model.family,
                params_b=model.params_b,
                context_length=model.context_length,
                licence=model.licence,
                description=model.description,
                tasks=model.tasks,
                quality_score=model.quality_score,
                downloads_last_month=model.downloads_last_month,
                likes=model.likes,
                min_vram=min_v,
                quant_count=len(model.quants)
            )
        )
        
    return result

@router.get("/models/{model_id}", response_model=schemas.ModelResponse, summary="Get Model", description="Get full details for a single model")
def get_model(model_id: int, db: Session = Depends(get_db)):
    """Returns full model details including quants."""
    model = db.query(db_models).filter(db_models.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model

@router.get("/models/tag/{ollama_tag}", response_model=schemas.ModelResponse, summary="Get Model by Tag", description="Get full model details by Ollama tag")
def get_model_by_tag(ollama_tag: str, db: Session = Depends(get_db)):
    """Returns full model details by its ollama tag."""
    model = db.query(db_models).filter(db_models.ollama_tag == ollama_tag).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model

@router.get("/models/{model_id}/quants", response_model=List[schemas.ModelQuantResponse], summary="Get Model Quants", description="Get all quantizations for a model")
def get_model_quants(model_id: int, db: Session = Depends(get_db)):
    """Returns all quants for a specific model."""
    quants = db.query(db_quants).filter(db_quants.model_id == model_id).all()
    if not quants:
        # Also check if model exists
        model = db.query(db_models).filter(db_models.id == model_id).first()
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")
    return quants
