from fastapi import FastAPI
from xpose_ml.routes import router

app = FastAPI(
    title="Xpose ML API",
    version="1.0.0"
)

app.include_router(router)

@app.get("/")
def root():
    return {"message": "Xpose ML API is running ✅"}
