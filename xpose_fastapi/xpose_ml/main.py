# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import logging
import time
from contextlib import asynccontextmanager
from xpose_ml.routes import router

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("uvicorn")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting Xpose ML API...")
    logger.info("Loading ML models...")

    try:
        from xpose_ml.classifier import tokenizer, model, detox
        logger.info("✅ BERT model loaded successfully")
        logger.info("✅ Detoxify model loaded successfully")
        logger.info("🎯 All ML models are ready!")
    except Exception as e:
        logger.error(f"❌ Failed to load ML models: {e}")
        raise

    yield

    logger.info("🛑 Shutting down Xpose ML API...")

app = FastAPI(
    title="Xpose Enhanced ML API",
    description="""
    Advanced ML API for crime report classification with:
    - Spam detection
    - Toxicity analysis  
    - Hate speech detection
    - Urgency classification
    - Quality assessment
    """,
    version="2.0.0",
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