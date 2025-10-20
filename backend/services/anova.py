"""
ANOVA Analysis Service
Implements One-Way ANOVA with Bonferroni and Benjamini-Hochberg corrections
"""
import logging
from typing import Any

import numpy as np
from scipy import stats
from statsmodels.stats.multitest import multipletests

logger = logging.getLogger(__name__)


class AnovaAnalyzer:
    """One-Way ANOVA analyzer with multiple testing corrections"""
    
    def __init__(self, fdr_threshold: float = 0.05):
        self.fdr_threshold = fdr_threshold
    
    def analyze(
        self,
        data: np.ndarray,
        classes: np.ndarray,
        design_label: str,
        plot_option: int,
        var_names: list[str] | None = None
    ) -> dict[str, Any]:
        """
        Perform One-Way ANOVA analysis
        
        Args:
            data: Data matrix (samples × variables)
            classes: Class labels for each sample
            design_label: Name of the design factor
            plot_option: Plotting option
        
        Returns:
            Complete ANOVA results
        """
        n_samples, n_vars = data.shape
        logger.info(f"Running ANOVA on {n_samples} samples × {n_vars} variables")
        
        # Compute ANOVA for each variable
        p_values = []
        effect_sizes = []
        
        for i in range(n_vars):
            var_data = data[:, i]
            
            # Remove NaNs
            mask = ~np.isnan(var_data)
            var_clean = var_data[mask]
            class_clean = classes[mask]
            
            # Skip if insufficient data
            if len(np.unique(class_clean)) < 2:
                p_values.append(1.0)
                effect_sizes.append(0.0)
                continue
            
            # Group data by class
            groups = [var_clean[class_clean == cls] for cls in np.unique(class_clean)]
            
            # Compute One-Way ANOVA
            f_stat, p_val = stats.f_oneway(*groups)
            p_values.append(p_val if not np.isnan(p_val) else 1.0)
            
            # Effect size (η²)
            ss_between = sum(len(g) * (np.mean(g) - np.mean(var_clean))**2 for g in groups)
            ss_total = np.sum((var_clean - np.mean(var_clean))**2)
            effect = (ss_between / ss_total * 100) if ss_total > 0 else 0
            effect_sizes.append(effect)
        
        p_values = np.array(p_values)
        effect_sizes = np.array(effect_sizes)
        
        # Bonferroni correction
        bonferroni_threshold = self.fdr_threshold / len(p_values)
        bonferroni_sig = p_values <= bonferroni_threshold
        
        # Benjamini-Hochberg correction
        # multipletests returns: (reject, pvals_corrected, alphacSidak, alphacBonf)
        benjamini_sig, fdr_corrected, _, _ = multipletests(
            p_values,
            alpha=self.fdr_threshold,
            method='fdr_bh'
        )
        
        # Build results table
        results_table = []
        for i in range(n_vars):
            var_name = var_names[i] if var_names and i < len(var_names) else f'Variable_{i+1}'
            results_table.append({
                'variable': var_name,
                'pValue': float(p_values[i]),
                'fdr': float(fdr_corrected[i]),
                'bonferroni': float(p_values[i] * len(p_values)),  # Adjusted p-value
                'benjamini': bool(benjamini_sig[i]),
                'effectSize': float(effect_sizes[i])
            })
        
        # Get significant variables based on plot_option
        significant_vars = self._get_significant_vars(
            results_table,
            plot_option,
            benjamini_sig
        )
        
        # Compute boxplot data for top significant variables
        boxplot_data = self._compute_boxplots(
            data,
            classes,
            significant_vars[:4]  # Top 4 variables
        )
        
        logger.info(f"ANOVA: {np.sum(benjamini_sig)} Benjamini significant variables")
        
        return {
            'results': results_table,
            'significant_variables': significant_vars,
            'boxplot_data': boxplot_data,
            'summary': {
                'total_variables': n_vars,
                'benjamini_significant': int(np.sum(benjamini_sig)),
                'bonferroni_significant': int(np.sum(bonferroni_sig)),
                'nominal_significant': int(np.sum(p_values <= 0.05)),
                'fdr_threshold': self.fdr_threshold
            }
        }
    
    def _get_significant_vars(
        self,
        results: list[dict],
        plot_option: int,
        benjamini_sig: np.ndarray
    ) -> list[int]:
        """Get significant variable indices based on plot option"""
        if plot_option == 0:
            return []
        elif plot_option == 1:  # Nominal p-value
            return [i for i, r in enumerate(results) if r['pValue'] <= 0.05]
        elif plot_option == 2:  # Bonferroni
            return [i for i, r in enumerate(results) if r['bonferroni'] <= self.fdr_threshold]
        elif plot_option == 3:  # Benjamini-Hochberg
            return [i for i, r in enumerate(results) if benjamini_sig[i]]
        else:  # All variables
            return list(range(len(results)))
    
    def _compute_boxplots(
        self,
        data: np.ndarray,
        classes: np.ndarray,
        var_indices: list[int]
    ) -> list[list[dict]]:
        """Compute boxplot statistics for selected variables"""
        boxplot_data = []
        
        for var_idx in var_indices:
            var_data = data[:, var_idx]
            var_boxplots = []
            
            for cls in np.unique(classes):
                cls_data = var_data[classes == cls]
                cls_data = cls_data[~np.isnan(cls_data)]
                
                if len(cls_data) == 0:
                    continue
                
                # Handle edge case: single value
                if len(cls_data) == 1:
                    val = float(cls_data[0])
                    var_boxplots.append({
                        'group': f'Group {int(cls)}',
                        'min': val,
                        'q1': val,
                        'median': val,
                        'q3': val,
                        'max': val,
                        'values': [val]
                    })
                    continue
                
                # Compute percentiles (ensure array output)
                percentiles = np.percentile(cls_data, [25, 50, 75])
                q1 = float(percentiles[0])
                median = float(percentiles[1])
                q3 = float(percentiles[2])
                
                iqr = q3 - q1
                lower = float(max(np.min(cls_data), q1 - 1.5 * iqr))
                upper = float(min(np.max(cls_data), q3 + 1.5 * iqr))
                
                var_boxplots.append({
                    'group': f'Group {int(cls)}',
                    'min': lower,
                    'q1': q1,
                    'median': median,
                    'q3': q3,
                    'max': upper,
                    'values': cls_data.tolist()
                })
            
            boxplot_data.append(var_boxplots)
        
        return boxplot_data

