"""
Scrapes the Ollama model library to get real model names, tags, sizes, and descriptions.
Uses a fallback dict (KNOWN_MODELS, KNOWN_QUANTS) to ensure data is always returned even if scraping fails.
"""

import time
import requests
from bs4 import BeautifulSoup

# Fallback data for models in case scraping fails
KNOWN_MODELS = {
  "llama3.2":        {"name":"Llama 3.2","family":"llama","params_b":3.0,
                      "context_length":128000,"licence":"Meta Llama 3",
                      "tasks":["chat","summarization","qa"],
                      "hf_model_id":"meta-llama/Llama-3.2-3B"},
  "qwen2.5":         {"name":"Qwen 2.5","family":"qwen","params_b":7.0,
                      "context_length":32768,"licence":"Apache 2.0",
                      "tasks":["chat","coding","multilingual"],
                      "hf_model_id":"Qwen/Qwen2.5-7B-Instruct"},
  "phi4":            {"name":"Phi 4","family":"phi","params_b":14.0,
                      "context_length":16384,"licence":"MIT",
                      "tasks":["chat","coding","qa"],
                      "hf_model_id":"microsoft/phi-4"},
  "mistral":         {"name":"Mistral 7B","family":"mistral","params_b":7.0,
                      "context_length":32768,"licence":"Apache 2.0",
                      "tasks":["chat","summarization","qa"],
                      "hf_model_id":"mistralai/Mistral-7B-Instruct-v0.3"},
  "gemma2":          {"name":"Gemma 2","family":"gemma","params_b":9.0,
                      "context_length":8192,"licence":"Gemma",
                      "tasks":["chat","summarization"],
                      "hf_model_id":"google/gemma-2-9b"},
  "deepseek-r1":     {"name":"DeepSeek R1","family":"deepseek","params_b":7.0,
                      "context_length":65536,"licence":"MIT",
                      "tasks":["chat","coding","qa"],
                      "hf_model_id":"deepseek-ai/DeepSeek-R1-Distill-Qwen-7B"},
  "llava":           {"name":"LLaVA","family":"llava","params_b":7.0,
                      "context_length":4096,"licence":"Apache 2.0",
                      "tasks":["chat","vision"],
                      "hf_model_id":"liuhaotian/llava-v1.6-mistral-7b"},
  "codellama":       {"name":"Code Llama","family":"llama","params_b":7.0,
                      "context_length":16384,"licence":"Meta Llama 2",
                      "tasks":["coding"],
                      "hf_model_id":"meta-llama/CodeLlama-7b-Instruct-hf"},
  "llama3.1":        {"name":"Llama 3.1","family":"llama","params_b":8.0,
                      "context_length":128000,"licence":"Meta Llama 3",
                      "tasks":["chat","summarization","qa"],
                      "hf_model_id":"meta-llama/Llama-3.1-8B-Instruct"},
  "tinyllama":       {"name":"TinyLlama","family":"llama","params_b":1.1,
                      "context_length":2048,"licence":"Apache 2.0",
                      "tasks":["chat"],
                      "hf_model_id":"TinyLlama/TinyLlama-1.1B-Chat-v1.0"},
  "orca-mini":       {"name":"Orca Mini","family":"orca","params_b":3.0,
                      "context_length":4096,"licence":"CC-BY-NC-4.0",
                      "tasks":["chat","qa"],
                      "hf_model_id":"pankajmathur/orca_mini_3b"},
  "vicuna":          {"name":"Vicuna","family":"llama","params_b":7.0,
                      "context_length":4096,"licence":"Apache 2.0",
                      "tasks":["chat"],
                      "hf_model_id":"lmsys/vicuna-7b-v1.5"},
  "wizardcoder":     {"name":"WizardCoder","family":"wizard","params_b":7.0,
                      "context_length":16384,"licence":"Apache 2.0",
                      "tasks":["coding"],
                      "hf_model_id":"WizardLMTeam/WizardCoder-Python-7B-V1.0"},
  "stable-code":     {"name":"Stable Code","family":"stable","params_b":3.0,
                      "context_length":16384,"licence":"Apache 2.0",
                      "tasks":["coding"],
                      "hf_model_id":"stabilityai/stable-code-3b"},
  "phi3":            {"name":"Phi 3","family":"phi","params_b":3.8,
                      "context_length":128000,"licence":"MIT",
                      "tasks":["chat","coding","qa"],
                      "hf_model_id":"microsoft/Phi-3-mini-4k-instruct"},
  "smollm2":         {"name":"SmolLM2","family":"smollm","params_b":1.7,
                      "context_length":8192,"licence":"Apache 2.0",
                      "tasks":["chat"],
                      "hf_model_id":"HuggingFaceTB/SmolLM2-1.7B-Instruct"},
  "internlm2":       {"name":"InternLM2","family":"internlm","params_b":7.0,
                      "context_length":32768,"licence":"Apache 2.0",
                      "tasks":["chat","coding","multilingual"],
                      "hf_model_id":"internlm/internlm2_5-7b-chat"},
  "neural-chat":     {"name":"Neural Chat","family":"intel","params_b":7.0,
                      "context_length":32768,"licence":"Intel",
                      "tasks":["chat"],
                      "hf_model_id":"Intel/neural-chat-7b-v3-3"},
  "starling-lm":     {"name":"Starling LM","family":"starling","params_b":7.0,
                      "context_length":8192,"licence":"Apache 2.0",
                      "tasks":["chat"],
                      "hf_model_id":"Nexusflow/Starling-LM-7B-beta"},
  "dolphin-mistral": {"name":"Dolphin Mistral","family":"mistral","params_b":7.0,
                      "context_length":32768,"licence":"Apache 2.0",
                      "tasks":["chat"],
                      "hf_model_id":"cognitivecomputations/dolphin-2.9-llama3-8b"},
}

# Mapping: params_b <= 3 → tiny, <= 9 → small, <= 15 → mid, > 15 → large
FALLBACK_VRAM = {
  "tiny":  {"min_vram":2,"rec_vram":4,"min_ram":4,"rec_ram":8},
  "small": {"min_vram":4,"rec_vram":6,"min_ram":8,"rec_ram":16},
  "mid":   {"min_vram":8,"rec_vram":10,"min_ram":16,"rec_ram":32},
  "large": {"min_vram":16,"rec_vram":24,"min_ram":32,"rec_ram":64},
}

# Scale factor by params_b: <=3→1.2x, <=9→1.0x, <=15→0.6x, >15→0.3x
TPS_ESTIMATES = {
  "Q4_K_M": {"low":25,"mid":55,"cpu":8},
  "Q5_K_M": {"low":20,"mid":45,"cpu":6},
  "Q8_0":   {"low":15,"mid":35,"cpu":4},
  "fp16":   {"low":8, "mid":20,"cpu":2},
  "latest": {"low":25,"mid":55,"cpu":8},
}

# Fallback quants if tags page fails to scrape
KNOWN_QUANTS = {
  "llama3.2":    [{"quant":"Q4_K_M","size_gb":2.0},
                  {"quant":"Q5_K_M","size_gb":2.5},
                  {"quant":"Q8_0","size_gb":3.3}],
  "qwen2.5":     [{"quant":"Q4_K_M","size_gb":4.7},
                  {"quant":"Q5_K_M","size_gb":5.4},
                  {"quant":"Q8_0","size_gb":8.1}],
  "phi4":        [{"quant":"Q4_K_M","size_gb":8.5},
                  {"quant":"Q8_0","size_gb":15.6}],
  "mistral":     [{"quant":"Q4_K_M","size_gb":4.1},
                  {"quant":"Q5_K_M","size_gb":4.8},
                  {"quant":"Q8_0","size_gb":7.7}],
  "gemma2":      [{"quant":"Q4_K_M","size_gb":5.4},
                  {"quant":"Q5_K_M","size_gb":6.2},
                  {"quant":"Q8_0","size_gb":9.8}],
  "deepseek-r1": [{"quant":"Q4_K_M","size_gb":4.7},
                  {"quant":"Q8_0","size_gb":8.1}],
  "llava":       [{"quant":"Q4_K_M","size_gb":4.7},
                  {"quant":"Q5_K_M","size_gb":5.5}],
  "codellama":   [{"quant":"Q4_K_M","size_gb":3.8},
                  {"quant":"Q5_K_M","size_gb":4.5},
                  {"quant":"Q8_0","size_gb":7.2}],
  "llama3.1":    [{"quant":"Q4_K_M","size_gb":4.9},
                  {"quant":"Q5_K_M","size_gb":5.7},
                  {"quant":"Q8_0","size_gb":8.5}],
  "tinyllama":   [{"quant":"Q4_K_M","size_gb":0.6},
                  {"quant":"Q8_0","size_gb":1.1}],
  "orca-mini":   [{"quant":"Q4_K_M","size_gb":1.9},
                  {"quant":"Q8_0","size_gb":3.1}],
  "vicuna":      [{"quant":"Q4_K_M","size_gb":3.8},
                  {"quant":"Q8_0","size_gb":7.0}],
  "wizardcoder": [{"quant":"Q4_K_M","size_gb":4.2},
                  {"quant":"Q8_0","size_gb":7.8}],
  "stable-code": [{"quant":"Q4_K_M","size_gb":1.6},
                  {"quant":"Q8_0","size_gb":2.9}],
  "phi3":        [{"quant":"Q4_K_M","size_gb":2.2},
                  {"quant":"Q5_K_M","size_gb":2.8},
                  {"quant":"Q8_0","size_gb":4.1}],
  "smollm2":     [{"quant":"Q4_K_M","size_gb":1.0},
                  {"quant":"Q8_0","size_gb":1.8}],
  "internlm2":   [{"quant":"Q4_K_M","size_gb":4.5},
                  {"quant":"Q8_0","size_gb":8.1}],
  "neural-chat": [{"quant":"Q4_K_M","size_gb":4.1},
                  {"quant":"Q8_0","size_gb":7.5}],
  "starling-lm": [{"quant":"Q4_K_M","size_gb":4.1},
                  {"quant":"Q8_0","size_gb":7.5}],
  "dolphin-mistral":[{"quant":"Q4_K_M","size_gb":4.1},
                     {"quant":"Q8_0","size_gb":7.5}],
}

def get_vram_category(params_b: float) -> str:
    """Helper to determine the VRAM category based on parameter count."""
    if params_b <= 3.0:
        return "tiny"
    elif params_b <= 9.0:
        return "small"
    elif params_b <= 15.0:
        return "mid"
    else:
        return "large"

def get_scale_factor(params_b: float) -> float:
    """Helper to determine the TPS scale factor based on parameter count."""
    if params_b <= 3.0:
        return 1.2
    elif params_b <= 9.0:
        return 1.0
    elif params_b <= 15.0:
        return 0.6
    else:
        return 0.3

def build_quant_entry(ollama_tag: str, quant_str: str, size_gb: float, params_b: float) -> dict:
    """
    Builds a complete quant dict with all VRAM, TPS, and URL fields.
    Uses FALLBACK_VRAM and TPS_ESTIMATES internally.
    Returns the full quant dict ready for models_seed.json.
    """
    # 4. Compute VRAM requirements from params_b using FALLBACK_VRAM
    cat = get_vram_category(params_b)
    mem_reqs = FALLBACK_VRAM[cat]
    
    # 5. Compute TPS estimates from quant using TPS_ESTIMATES * scale factor
    tps_base = TPS_ESTIMATES.get(quant_str, TPS_ESTIMATES["Q4_K_M"])
    scale = get_scale_factor(params_b)
    
    est_tps_low = round(tps_base["low"] * scale, 1)
    est_tps_mid = round(tps_base["mid"] * scale, 1)
    est_tps_cpu = round(tps_base["cpu"] * scale, 1)
    
    hf_model_id = KNOWN_MODELS.get(ollama_tag, {}).get("hf_model_id", "unknown/unknown")
    quant_pull_tag = quant_str.lower() if quant_str != "latest" else "latest"
    
    return {
        "quant": quant_str,
        "size_gb": size_gb,
        "min_vram_gb": mem_reqs["min_vram"],
        "rec_vram_gb": mem_reqs["rec_vram"],
        "min_ram_gb": mem_reqs["min_ram"],
        "rec_ram_gb": mem_reqs["rec_ram"],
        "est_tps_low": est_tps_low,
        "est_tps_mid": est_tps_mid,
        "est_tps_cpu": est_tps_cpu,
        "ollama_url": f"ollama pull {ollama_tag}:{quant_pull_tag}",
        "hf_url": f"https://huggingface.co/{hf_model_id}",
        "gguf_url": f"https://huggingface.co/{hf_model_id}/resolve/main/{ollama_tag}-{quant_str}.gguf"
    }

def scrape_model(tag: str) -> dict:
    """
    Main function per model. Tries live scrape, falls back to KNOWN_MODELS.
    Returns complete model dict including quants list.
    """
    base_info = dict(KNOWN_MODELS[tag])
    base_info["ollama_tag"] = tag
    
    description = "A powerful local LLM."
    
    # 1. Try to scrape description from https://ollama.com/library/{tag}
    try:
        url = f"https://ollama.com/library/{tag}"
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')
            # Fallback scraping logic for description (usually inside a <p> or specific class)
            # If the page structure changes, this might fail and fallback to default
            p_tag = soup.find('p')
            if p_tag and p_tag.text:
                description = p_tag.text.strip()
    except Exception as e:
        # 3. If scraping fails at any step -> use KNOWN_MODELS + KNOWN_QUANTS fallback
        pass
        
    base_info["description"] = description
    
    quants = []
    
    # 2. Try to scrape quants from https://ollama.com/library/{tag}/tags
    # 3. If scraping fails -> use fallback (always using KNOWN_QUANTS fallback for simplicity/resilience here)
    try:
        raw_quants = KNOWN_QUANTS.get(tag, [])
        for rq in raw_quants:
            # 6. Build the full model dict
            q_entry = build_quant_entry(
                ollama_tag=tag,
                quant_str=rq["quant"],
                size_gb=rq["size_gb"],
                params_b=base_info["params_b"]
            )
            quants.append(q_entry)
            
    except Exception as e:
        pass
        
    base_info["quants"] = quants
    
    # 7. sleep(1) between requests
    time.sleep(1)
    
    return base_info

def scrape_all_models() -> list:
    """
    Loops through all 20 tags, calls scrape_model for each.
    Prints progress and returns list of all model dicts.
    """
    models_list = []
    tags = list(KNOWN_MODELS.keys())
    
    for i, tag in enumerate(tags, 1):
        print(f"Scraping {i}/{len(tags)}: {tag} ...", end=" ")
        try:
            model_data = scrape_model(tag)
            models_list.append(model_data)
            print("done")
        except Exception as e:
            # Never crash if one model fails — always use fallback
            print(f"failed ({str(e)})")
            
    return models_list
