"""
Logic for evaluating user hardware against model requirements.
"""

def get_verdict(
    user_vram: float,
    user_ram: float,
    min_vram: float,
    rec_vram: float,
    min_ram: float,
    rec_ram: float
) -> dict:
    """
    Compares user hardware against model requirements and returns a verdict.
    """
    if user_vram >= rec_vram and user_ram >= rec_ram:
        verdict = "recommended"
        reason = "Your hardware meets or exceeds recommended requirements."
    elif user_vram >= min_vram and user_ram >= min_ram:
        verdict = "minimum"
        reason = (
            "Your hardware meets minimum requirements but may run slowly. "
            f"VRAM: you have {user_vram}GB, recommended is {rec_vram}GB. "
            f"RAM: you have {user_ram}GB, recommended is {rec_ram}GB."
        )
    else:
        verdict = "not_recommended"
        reason = (
            "Your hardware does not meet minimum requirements. "
            f"VRAM needed: {min_vram}GB minimum, you have {user_vram}GB. "
            f"RAM needed: {min_ram}GB minimum, you have {user_ram}GB."
        )

    return {
        "verdict": verdict,
        "reason": reason,
        "user_hw": {"vram_gb": user_vram, "ram_gb": user_ram},
        "model_req": {
            "min_vram_gb": min_vram,
            "rec_vram_gb": rec_vram,
            "min_ram_gb": min_ram,
            "rec_ram_gb": rec_ram
        }
    }

def get_best_quant_for_hardware(
    quants: list,
    user_vram: float,
    user_ram: float
) -> dict | None:
    """
    Returns the best quant the user can run based on VRAM and RAM.
    """
    valid_quants = []
    
    # Filter quants that fit within user's minimum requirements
    for q in quants:
        min_vram = q.min_vram_gb if hasattr(q, "min_vram_gb") else q.get("min_vram_gb", 999)
        min_ram = q.min_ram_gb if hasattr(q, "min_ram_gb") else q.get("min_ram_gb", 999)
        
        if min_vram <= user_vram and min_ram <= user_ram:
            valid_quants.append(q)
            
    if not valid_quants:
        return None
        
    # Return the one with highest size_gb (best quality they can run)
    valid_quants.sort(key=lambda x: x.size_gb if hasattr(x, "size_gb") else x.get("size_gb", 0), reverse=True)
    return valid_quants[0]
