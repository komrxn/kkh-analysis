"""
FastAPI Backend for ANOVA & PCA Analysis
Author: Senior Engineer
"""
import logging
import os
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from services.anova import AnovaAnalyzer
from services.pca import PCAAnalyzer
from utils.file_parser import parse_uploaded_file

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('analysis.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info("🚀 Starting ANOVA/PCA Analysis Backend")
    yield
    logger.info("🛑 Shutting down Analysis Backend")


app = FastAPI(
    title="ANOVA & PCA Analysis API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS - Configure based on environment
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080")
allowed_origins = [
    "http://localhost:8080",
    "http://localhost:3000",
    "http://127.0.0.1:8080",
]

# Add production frontend URL if set
if FRONTEND_URL not in allowed_origins:
    allowed_origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint"""
    return {"status": "healthy", "service": "analysis-backend"}


@app.post("/api/analyze/anova")
async def analyze_anova(
    file: UploadFile = File(...),
    fdr_threshold: float = Form(0.05),
    design_label: str = Form("Treatment"),
    plot_option: int = Form(3),
) -> dict[str, Any]:
    """
    Perform One-Way ANOVA analysis
    
    Args:
        file: CSV/Excel file (samples × variables)
        fdr_threshold: FDR threshold (default: 0.05)
        design_label: Design label name
        plot_option: Plotting option (0-4)
    
    Returns:
        ANOVA results with p-values, FDR, Bonferroni, and boxplot data
    """
    try:
        logger.info(f"📊 ANOVA Analysis Started - File: {file.filename}")
        
        # Parse file
        data, classes, var_names = await parse_uploaded_file(file)
        logger.info(f"✅ Data parsed: {data.shape[0]} samples × {data.shape[1]} variables")
        
        # Run ANOVA
        analyzer = AnovaAnalyzer(fdr_threshold=fdr_threshold)
        results = analyzer.analyze(data, classes, design_label, plot_option, var_names)
        
        logger.info(f"✅ ANOVA Complete - {len(results['significant_variables'])} significant vars")
        return results
        
    except Exception as e:
        logger.error(f"❌ ANOVA Failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/api/analyze/pca")
async def analyze_pca(
    file: UploadFile = File(...),
    num_pcs: int = Form(3),
    scaling_method: str = Form("auto"),
    design_label: str = Form("Treatment"),
) -> dict[str, Any]:
    """
    Perform PCA analysis
    
    Args:
        file: CSV/Excel file (samples × variables)
        num_pcs: Number of principal components
        scaling_method: Scaling method (auto/mean/pareto)
        design_label: Design label name
    
    Returns:
        PCA results with scores, loadings, and explained variance
    """
    try:
        logger.info(f"🔬 PCA Analysis Started - File: {file.filename}")
        
        # Parse file
        data, classes, var_names = await parse_uploaded_file(file)
        logger.info(f"✅ Data parsed: {data.shape[0]} samples × {data.shape[1]} variables")
        
        # Run PCA
        analyzer = PCAAnalyzer(n_components=num_pcs, scaling=scaling_method)
        results = analyzer.analyze(data, classes, design_label, var_names)
        
        logger.info(f"✅ PCA Complete - {num_pcs} components computed")
        return results
        
    except Exception as e:
        logger.error(f"❌ PCA Failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")

