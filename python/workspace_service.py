#!/usr/bin/env python3
"""
Workspace service for VSCode extension
"""
import sys
import json
import os
from pathlib import Path

# Add the parent directory to the path to import our modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from augutils.workspace_cleaner import clean_workspace_storage

def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: workspace_service.py <function_name>"}))
        sys.exit(1)
    
    function_name = sys.argv[1]
    
    try:
        if function_name == "clean_workspace_storage":
            result = clean_workspace_storage()
            print(json.dumps(result))
        else:
            print(json.dumps({"error": f"Unknown function: {function_name}"}))
            sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
