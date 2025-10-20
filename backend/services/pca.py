"""
PCA Analysis Service
Implements PCA with multiple scaling methods
"""
import logging
from typing import Any

import numpy as np
from sklearn.decomposition import PCA

from utils.preprocessing import scale_data

logger = logging.getLogger(__name__)


class PCAAnalyzer:
    """PCA analyzer with preprocessing"""
    
    def __init__(self, n_components: int = 3, scaling: str = 'auto'):
        self.n_components = min(n_components, 10)  # Max 10 PCs
        self.scaling = scaling
    
    def analyze(
        self,
        data: np.ndarray,
        classes: np.ndarray,
        design_label: str,
        var_names: list[str] | None = None
    ) -> dict[str, Any]:
        """
        Perform PCA analysis
        
        Args:
            data: Data matrix (samples × variables)
            classes: Class labels for each sample
            design_label: Name of the design factor
        
        Returns:
            PCA results with scores, loadings, and explained variance
        """
        n_samples, n_vars = data.shape
        logger.info(f"Running PCA on {n_samples} samples × {n_vars} variables")
        
        # Handle NaNs (replace with 0)
        data_clean = np.nan_to_num(data, nan=0.0)
        
        # Scale data
        data_scaled = scale_data(data_clean, method=self.scaling)
        logger.info(f"Applied {self.scaling} scaling")
        
        # Fit PCA
        pca = PCA(n_components=self.n_components)
        scores = pca.fit_transform(data_scaled)
        
        # Extract components
        explained_var = pca.explained_variance_ratio_ * 100
        cumulative_var = np.cumsum(explained_var)
        
        # Build scores data
        scores_data = []
        for i in range(n_samples):
            score_dict = {
                'sample': f'Sample_{i+1}',
                'group': int(classes[i]) if i < len(classes) else 1
            }
            for pc in range(self.n_components):
                score_dict[f'pc{pc+1}'] = float(scores[i, pc])
            scores_data.append(score_dict)
        
        logger.info(f"PCA: PC1 explains {explained_var[0]:.1f}% variance")
        
        return {
            'scores': scores_data,
            'explainedVariance': explained_var.tolist(),
            'cumulativeVariance': cumulative_var.tolist(),
            'loadings': pca.components_.tolist(),  # Shape: (n_components, n_features)
            'summary': {
                'n_components': self.n_components,
                'scaling_method': self.scaling,
                'total_variance_explained': float(cumulative_var[-1]),
                'design_label': design_label
            }
        }

