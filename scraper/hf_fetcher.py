"""
Fetches quality scores and metadata from HuggingFace API for each model.
Calculates a quality score based on MMLU metric or a fallback parameter map.
"""

import time
import requests
from huggingface_hub import HfApi, ModelCard

# Fallback mapping if MMLU score cannot be scraped
SIZE_QUALITY_MAP = {
    1.1: 0.42, 
    1.7: 0.45, 
    3.0: 0.50, 
    3.8: 0.52,
    7.0: 0.62, 
    8.0: 0.64, 
    9.0: 0.66, 
    14.0: 0.72
}

def get_hf_metadata(hf_model_id: str, token: str) -> dict:
    """
    Uses huggingface_hub.model_info() to fetch model metadata.
    Returns dict with: downloads_last_month, likes, quality_score.
    """
    fallback_data = {
        "downloads_last_month": 0,
        "likes": 0,
        "quality_score": 0.55
    }
    
    if not hf_model_id or hf_model_id == "unknown/unknown":
        return fallback_data
        
    try:
        api = HfApi(token=token)
        # Fetch model info for downloads and likes (network call wrapped in try)
        info = api.model_info(hf_model_id)
        
        downloads = getattr(info, 'downloads', 0)
        likes = getattr(info, 'likes', 0)
        
        quality_score = 0.55
        
        # Try to read "mmlu" from model card metadata
        try:
            card = ModelCard.load(hf_model_id, token=token)
            if card.data and hasattr(card.data, 'eval_results'):
                results = card.data.eval_results
                if results:
                    for res in results:
                        if isinstance(res, dict):
                            dataset = res.get("dataset", "")
                            if isinstance(dataset, str) and "mmlu" in dataset.lower():
                                metrics = res.get("metrics", [])
                                for m in metrics:
                                    val = m.get("value")
                                    if val:
                                        # Normalize if represented as percentage
                                        if float(val) > 1.0:
                                            quality_score = float(val) / 100.0
                                        else:
                                            quality_score = float(val)
                                        break
        except Exception:
            # Fallback if card parsing fails
            pass
            
        return {
            "downloads_last_month": downloads,
            "likes": likes,
            "quality_score": quality_score
        }
    except Exception as e:
        # On any error -> return fallback dict
        return fallback_data

def enrich_models(models: list, token: str) -> list:
    """
    Takes the list from ollama_scraper.
    For each model calls get_hf_metadata using model["hf_model_id"].
    Merges downloads_last_month, likes, quality_score into each model dict.
    Returns enriched list.
    """
    enriched_models = []
    
    for i, model in enumerate(models, 1):
        hf_id = model.get("hf_model_id", "")
        print(f"Fetching HF data {i}/{len(models)}: {hf_id} ...", end=" ", flush=True)
        
        try:
            # Fetch metadata
            hf_meta = get_hf_metadata(hf_id, token)
            
            params_b = model.get("params_b", 7.0)
            
            # Fallback: map params_b to score using SIZE_QUALITY_MAP
            # If get_hf_metadata couldn't parse mmlu and returned default 0.55
            if hf_meta["quality_score"] == 0.55:
                # Find exact match or use default
                if params_b in SIZE_QUALITY_MAP:
                    hf_meta["quality_score"] = SIZE_QUALITY_MAP[params_b]
                else:
                    hf_meta["quality_score"] = 0.55
            
            # Merge data into model
            model["downloads_last_month"] = hf_meta["downloads_last_month"]
            model["likes"] = hf_meta["likes"]
            model["quality_score"] = hf_meta["quality_score"]
            
            enriched_models.append(model)
            print("done")
            
        except Exception as e:
            # Never crash if one model fails — always use fallback
            model["downloads_last_month"] = 0
            model["likes"] = 0
            model["quality_score"] = 0.55
            enriched_models.append(model)
            print(f"failed (used fallback: {str(e)})")
            
        # Use time.sleep(0.5) between HuggingFace API requests
        time.sleep(0.5)
        
    return enriched_models
