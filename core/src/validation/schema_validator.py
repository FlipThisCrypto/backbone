"""
Schema Validator - Validates configuration against JSON schemas
"""

import json
import jsonschema
from typing import Dict, List, Any
from pathlib import Path

class SchemaValidator:
    """Validates project configurations against JSON schemas"""
    
    def __init__(self, schema_dir: str = None):
        self.schema_dir = schema_dir or str(Path(__file__).parent.parent.parent.parent / "config" / "schemas")
        self.project_schema = self._load_schema("project_config_schema.json")
        self.points_schema = self._load_schema("points_map_schema.json")
        self.errors = []
    
    def _load_schema(self, filename: str) -> Dict[str, Any]:
        """Load JSON schema from file"""
        schema_path = Path(self.schema_dir) / filename
        try:
            with open(schema_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Warning: Schema file {filename} not found at {schema_path}")
            return {}
    
    def validate_project_config(self, config: Dict[str, Any]) -> bool:
        """Validate project configuration against schema"""
        self.errors = []
        try:
            jsonschema.validate(instance=config, schema=self.project_schema)
            return True
        except jsonschema.ValidationError as e:
            self.errors.append(str(e.message))
            return False
        except Exception as e:
            self.errors.append(f"Validation error: {str(e)}")
            return False
    
    def validate_points_map(self, points_map: Dict[str, Any]) -> bool:
        """Validate points map against schema"""
        self.errors = []
        try:
            jsonschema.validate(instance=points_map, schema=self.points_schema)
            return True
        except jsonschema.ValidationError as e:
            self.errors.append(str(e.message))
            return False
        except Exception as e:
            self.errors.append(f"Validation error: {str(e)}")
            return False
    
    def get_errors(self) -> List[str]:
        """Get validation errors"""
        return self.errors