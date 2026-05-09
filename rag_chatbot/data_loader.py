import pandas as pd
from typing import List, Dict, Any
import os

def load_data_from_csv(csv_path: str) -> List[Dict[str, Any]]:
    """
    Load items from a CSV file.
    Expected columns: id, title, description, tags, category
    """
    if not os.path.exists(csv_path):
        print(f"Warning: CSV file {csv_path} not found.")
        return []

    try:
        df = pd.read_csv(csv_path)
        # Convert NaN to empty string
        df = df.fillna('')
        
        # Convert to list of dicts
        items = df.to_dict('records')
        
        # Convert id to string to match Item model
        for item in items:
            if 'id' in item:
                item['id'] = str(item['id'])
                
        return items
    except Exception as e:
        print(f"Error loading CSV data: {e}")
        return []
