import os
import uvicorn
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

SERVER_ADDRESS = os.getenv("SERVER_ADDRESS", "127.0.0.1")
SERVER_PORT = int(os.getenv("SERVER_PORT", 8000))

if __name__ == "__main__":
    uvicorn.run(
        "xpose_ml.main:app",
        host=SERVER_ADDRESS,
        port=SERVER_PORT,
        reload=True
    )
