"""
Simple test script to verify backend functionality
Run: python run_tests.py
"""
import asyncio
import logging
from pathlib import Path

import numpy as np
import pandas as pd

from services.anova import AnovaAnalyzer
from services.pca import PCAAnalyzer
from utils.preprocessing import scale_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_anova():
    """Test ANOVA analysis"""
    logger.info("🧪 Testing ANOVA...")
    
    # Generate test data
    np.random.seed(42)
    data = np.vstack([
        np.random.randn(10, 5) + 0,   # Group 1
        np.random.randn(10, 5) + 2,   # Group 2 (shifted)
        np.random.randn(10, 5) + 0.5, # Group 3
    ])
    classes = np.array([1]*10 + [2]*10 + [3]*10)
    
    # Run ANOVA
    analyzer = AnovaAnalyzer(fdr_threshold=0.05)
    results = analyzer.analyze(data, classes, "Test", plot_option=3)
    
    # Validate
    assert len(results['results']) == 5, "Should have 5 variables"
    assert 'pValue' in results['results'][0], "Should have p-values"
    assert results['summary']['total_variables'] == 5
    
    logger.info(f"✅ ANOVA Test Passed: {results['summary']['benjamini_significant']} significant vars")
    return results


def test_pca():
    """Test PCA analysis"""
    logger.info("🧪 Testing PCA...")
    
    # Generate test data
    np.random.seed(42)
    data = np.random.randn(30, 10)
    classes = np.array([1]*10 + [2]*10 + [3]*10)
    
    # Run PCA
    analyzer = PCAAnalyzer(n_components=3, scaling='auto')
    results = analyzer.analyze(data, classes, "Test")
    
    # Validate
    assert len(results['scores']) == 30, "Should have 30 samples"
    assert len(results['explainedVariance']) == 3, "Should have 3 PCs"
    assert 'pc1' in results['scores'][0], "Should have PC1 scores"
    
    logger.info(f"✅ PCA Test Passed: {results['summary']['total_variance_explained']:.1f}% variance explained")
    return results


def test_scaling():
    """Test scaling methods"""
    logger.info("🧪 Testing Scaling Methods...")
    
    data = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]], dtype=float)
    
    # Auto scaling
    scaled_auto = scale_data(data, 'auto')
    assert np.allclose(scaled_auto.mean(axis=0), 0, atol=1e-10), "Auto scaling should mean-center"
    assert np.allclose(scaled_auto.std(axis=0, ddof=1), 1, atol=1e-10), "Auto scaling should have unit variance"
    
    # Mean scaling
    scaled_mean = scale_data(data, 'mean')
    assert np.allclose(scaled_mean.mean(axis=0), 0, atol=1e-10), "Mean scaling should center"
    
    # Pareto scaling
    scaled_pareto = scale_data(data, 'pareto')
    assert np.allclose(scaled_pareto.mean(axis=0), 0, atol=1e-10), "Pareto scaling should center"
    
    logger.info("✅ Scaling Tests Passed")


def test_file_parsing():
    """Test CSV file parsing"""
    logger.info("🧪 Testing File Parsing...")
    
    # Check if test file exists
    test_file = Path("test_data_example.csv")
    if not test_file.exists():
        logger.warning("⚠️ Test file not found, skipping file parsing test")
        return
    
    df = pd.read_csv(test_file)
    logger.info(f"✅ File Parsing Test Passed: {df.shape[0]} rows × {df.shape[1]} cols")


def main():
    """Run all tests"""
    logger.info("=" * 60)
    logger.info("🚀 Running Backend Tests")
    logger.info("=" * 60)
    
    try:
        test_scaling()
        test_anova()
        test_pca()
        test_file_parsing()
        
        logger.info("=" * 60)
        logger.info("✅ All Tests Passed!")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"❌ Test Failed: {str(e)}", exc_info=True)
        raise


if __name__ == "__main__":
    main()

