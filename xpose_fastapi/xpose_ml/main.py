from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import logging
import time
from contextlib import asynccontextmanager
import threading
from xpose_ml.routes import router

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("uvicorn")

def init_shap_background():
    try:
        from xpose_ml.classifier import initialize_shap_explainer
        logger.info("Initializing SHAP explainer in background...")
        shap_success = initialize_shap_explainer()
        if shap_success:
            logger.info("✅ SHAP explainer loaded successfully")
        else:
            logger.warning("⚠️ SHAP explainer initialization failed - continuing without explainability")
    except Exception as e:
        logger.error(f"❌ SHAP initialization error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting Xpose ML API...")
    logger.info("Loading ML models...")

    try:
        from xpose_ml.classifier import tokenizer, model, detox
        logger.info("✅ BERT model loaded successfully")
        logger.info("✅ Detoxify model loaded successfully")

        threading.Thread(target=init_shap_background, daemon=True).start()

        logger.info("🎯 Core ML models are ready! SHAP will initialize in background.")
    except Exception as e:
        logger.error(f"❌ Failed to load ML models: {e}")
        raise

    yield

    logger.info("🛑 Shutting down Xpose ML API...")

app = FastAPI(
    title="Xpose Enhanced ML API with SHAP",
    description="""
    Advanced ML API for crime report classification with:
    - Spam detection
    - Toxicity analysis  
    - Hate speech detection
    - Urgency classification
    - Quality assessment
    - SHAP explainability for model predictions
    """,
    version="2.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.middleware("http")
async def add_process_time_header(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

app.include_router(router, tags=["Classification"])

@app.exception_handler(500)
async def internal_server_error_handler(request, exc):
    logger.error(f"Internal server error: {exc}")
    return {"error": "Internal server error", "message": str(exc)}

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    logger.warning(f"HTTP exception: {exc.status_code} - {exc.detail}")
    return {"error": f"HTTP {exc.status_code}", "message": exc.detail}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
