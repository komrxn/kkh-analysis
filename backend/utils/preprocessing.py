"""
Data Preprocessing Utilities
Scaling methods: auto, mean, pareto
"""
import numpy as np


def scale_data(data: np.ndarray, method: str = 'auto') -> np.ndarray:
    """
    Scale data using specified method
    
    Args:
        data: Data matrix (samples × variables)
        method: Scaling method ('auto', 'mean', 'pareto')
    
    Returns:
        Scaled data
    """
    if method == 'auto':
        # Auto-scaling: mean-center and scale to unit variance
        mean = np.mean(data, axis=0)
        std = np.std(data, axis=0, ddof=1)
        std[std == 0] = 1  # Avoid division by zero
        return (data - mean) / std
    
    elif method == 'mean':
        # Mean-centering only
        mean = np.mean(data, axis=0)
        return data - mean
    
    elif method == 'pareto':
        # Pareto scaling: mean-center and scale by sqrt(std)
        mean = np.mean(data, axis=0)
        std = np.std(data, axis=0, ddof=1)
        std[std == 0] = 1
        return (data - mean) / np.sqrt(std)
    
    else:
        raise ValueError(f"Unknown scaling method: {method}")

