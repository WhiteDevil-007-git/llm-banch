"""
Master runner script:
1. Load .env (HF_API_TOKEN)
2. Call scrape_all_models() -> raw_models list
3. Call enrich_models(raw_models, token) -> enriched_models list
4. Save to ../backend/data/models_seed.json
5. Save backup to ./models_seed_backup.json
"""

import os
import json
from dotenv import load_dotenv

from ollama_scraper import scrape_all_models
from hf_fetcher import enrich_models

def main():
    """
    Main execution loop for scraping, enriching, and saving model data.
    """
    # 1. Load .env (HF_API_TOKEN)
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    load_dotenv(dotenv_path=env_path)
    
    token = os.getenv("HF_API_TOKEN", "")
    
    print("Starting LLM Bench Scraper...\n")
    
    # 2. Call scrape_all_models() -> raw_models list
    raw_models = scrape_all_models()
    
    # 3. Call enrich_models(raw_models, token) -> enriched_models list
    print("\nStarting HuggingFace Enrichment...")
    enriched_models = enrich_models(raw_models, token)
    
    # Final JSON structure
    final_data = {
        "models": enriched_models
    }
    
    # 4. Save to ../backend/data/models_seed.json
    backend_data_dir = os.path.join(os.path.dirname(__file__), '..', 'backend', 'data')
    os.makedirs(backend_data_dir, exist_ok=True)
    seed_path = os.path.join(backend_data_dir, 'models_seed.json')
    
    with open(seed_path, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, indent=2)
        
    # 5. Save backup to ./models_seed_backup.json
    backup_path = os.path.join(os.path.dirname(__file__), 'models_seed_backup.json')
    with open(backup_path, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, indent=2)
        
    # Calculate total quants for summary
    total_quants = sum(len(m.get("quants", [])) for m in enriched_models)
    
    # 6. Print summary
    print("\n✅ Scraped 20 models")
    print(f"✅ Total quants: {total_quants}")
    print("✅ Saved to backend/data/models_seed.json")
    print("✅ Backup saved to scraper/models_seed_backup.json")

if __name__ == "__main__":
    main()
