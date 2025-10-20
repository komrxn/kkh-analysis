"""
File Parser Utility
Handles CSV and Excel file parsing
"""
import logging
from io import BytesIO

import numpy as np
import pandas as pd
from fastapi import HTTPException, UploadFile

logger = logging.getLogger(__name__)


async def parse_uploaded_file(file: UploadFile) -> tuple[np.ndarray, np.ndarray, list[str] | None]:
    """
    Parse uploaded CSV or Excel file
    
    Expected format:
    - First column: Sample IDs or class labels (integers or letters like A,B,C)
    - Remaining columns: Variables (numeric)
    - OR entire matrix is data (no labels)
    
    Args:
        file: Uploaded file
    
    Returns:
        (data, classes, variable_names) tuple
    """
    try:
        contents = await file.read()
        
        # Determine file type
        if file.filename.endswith('.csv'):
            df = pd.read_csv(BytesIO(contents))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(BytesIO(contents))
        else:
            raise ValueError(f"Unsupported file format: {file.filename}")
        
        # Remove completely empty rows
        df = df.dropna(how='all')
        
        logger.info(f"Loaded file: {df.shape[0]} rows × {df.shape[1]} columns")
        
        # Find class column automatically
        class_col_idx, class_col_name = _find_class_column(df)
        
        if class_col_idx is not None:
            # Convert class column (handles integers and letters)
            classes = _convert_to_class_labels(df.iloc[:, class_col_idx])
            logger.info(f"Using '{class_col_name}' as class column")
            
            # Get numeric data columns (skip class column and ID columns)
            id_keywords = ['id', 'sample', 'patient', 'subject', 'name']
            
            # Find columns to keep (skip class and IDs)
            cols_to_use = []
            for idx, col_name in enumerate(df.columns):
                if idx == class_col_idx:
                    continue  # Skip class column
                col_lower = str(col_name).lower()
                if any(keyword in col_lower for keyword in id_keywords):
                    logger.info(f"Skipping ID column: {col_name}")
                    continue  # Skip ID columns
                cols_to_use.append(col_name)
            
            data_cols = df[cols_to_use]
            
            # Select only numeric columns
            numeric_cols = data_cols.select_dtypes(include=[np.number]).columns
            
            # If no numeric columns found, try to convert
            if len(numeric_cols) == 0:
                data_cols = data_cols.apply(pd.to_numeric, errors='coerce')
                numeric_cols = data_cols.columns[~data_cols.isna().all()]
            
            data = data_cols[numeric_cols].values
            var_names = list(numeric_cols)
            
            logger.info(f"Selected {len(numeric_cols)} numeric columns for analysis: {var_names[:10]}...")
            
            # Remove rows with all NaN in data
            valid_rows = ~np.all(np.isnan(data), axis=1)
            data = data[valid_rows]
            classes = classes[valid_rows]
            
        else:
            # All columns are data, generate default classes
            data = df.apply(pd.to_numeric, errors='coerce').values
            
            # Remove rows with all NaN
            valid_rows = ~np.all(np.isnan(data), axis=1)
            data = data[valid_rows]
            
            classes = np.ones(data.shape[0], dtype=int)
            var_names = list(df.columns)
            logger.warning("No class column detected, using default class=1 for all samples")
        
        # Validate
        if data.shape[0] < 3:
            raise ValueError("Insufficient samples (minimum 3 required)")
        if data.shape[1] < 2:
            raise ValueError("Insufficient variables (minimum 2 required)")
        
        logger.info(f"Parsed: {data.shape[0]} samples × {data.shape[1]} variables, {len(np.unique(classes))} classes")
        
        # var_names should already be set in either branch
        return data, classes, var_names
        
    except Exception as e:
        logger.error(f"File parsing failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"File parsing error: {str(e)}")


def _find_class_column(df: pd.DataFrame) -> tuple[int | None, str | None]:
    """
    Find the class/group column automatically
    
    Strategy:
    1. Look for columns named: 'Group', 'Class', 'Treatment', 'Label', 'Category'
    2. Skip ID columns: 'ID', 'Sample', 'Patient'
    3. Find column with 2-10 unique values that's not numeric data
    
    Returns:
        (column_index, column_name) or (None, None)
    """
    # Strategy 1: Look for known class column names
    class_keywords = ['group', 'class', 'treatment', 'label', 'category', 'type', 'condition']
    id_keywords = ['id', 'sample', 'patient', 'subject', 'name']
    
    for idx, col_name in enumerate(df.columns):
        col_lower = str(col_name).lower()
        
        # Skip ID columns
        if any(keyword in col_lower for keyword in id_keywords):
            continue
        
        # Check if matches class keywords
        if any(keyword in col_lower for keyword in class_keywords):
            if _is_class_column(df.iloc[:, idx]):
                return idx, col_name
    
    # Strategy 2: Find first non-ID column with 2-10 unique values
    for idx, col_name in enumerate(df.columns):
        col_lower = str(col_name).lower()
        
        # Skip ID columns
        if any(keyword in col_lower for keyword in id_keywords):
            continue
        
        if _is_class_column(df.iloc[:, idx]):
            return idx, col_name
    
    return None, None


def _is_class_column(series: pd.Series) -> bool:
    """Check if a column represents class labels"""
    try:
        if series.isna().any():
            return False
        
        n_unique = len(series.unique())
        
        # Check if it's integers or letters
        if pd.api.types.is_integer_dtype(series):
            # Integer classes
            return 2 <= n_unique <= 10 and n_unique < len(series) * 0.5
        
        # Check if it's string/object type with few unique values
        if pd.api.types.is_object_dtype(series) or pd.api.types.is_string_dtype(series):
            # String classes (like A, B, C or Group1, Group2)
            return 2 <= n_unique <= 10 and n_unique < len(series) * 0.5
        
        # Try to convert to int
        series_int = pd.to_numeric(series, errors='coerce')
        if not series_int.isna().any():
            return 2 <= n_unique <= 10 and n_unique < len(series) * 0.5
        
        return False
    except:
        return False


def _convert_to_class_labels(series: pd.Series) -> np.ndarray:
    """
    Convert class labels to integer array
    Handles: integers (1,2,3), letters (A,B,C), or strings (Group1, Group2)
    """
    try:
        # If already integers
        if pd.api.types.is_integer_dtype(series):
            return series.values.astype(int)
        
        # If numeric strings
        numeric = pd.to_numeric(series, errors='coerce')
        if not numeric.isna().any():
            return numeric.astype(int).values
        
        # If categorical (letters or strings)
        # Map unique values to integers
        unique_vals = series.unique()
        mapping = {val: idx + 1 for idx, val in enumerate(sorted(unique_vals))}
        
        logger.info(f"Converting class labels: {mapping}")
        
        return series.map(mapping).values.astype(int)
        
    except Exception as e:
        logger.error(f"Failed to convert class labels: {e}")
        raise ValueError(f"Cannot convert class labels: {e}")

