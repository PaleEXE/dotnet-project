from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from contextlib import asynccontextmanager

from routers import auth, users, organizations, tasks, admin, volunteers, hours, misc, chatbot

@asynccontextmanager
async def lifespan(app: FastAPI):
    from routers.chatbot import rag_engine, load_tasks_from_db
    from db.database import get_session
    
    try:
        async for session in get_session():
            print("Loading open tasks for RAG index...")
            items = await load_tasks_from_db(session)
            if items:
                rag_engine.build_index(items)
            else:
                print("No open tasks found to index.")
            break
    except Exception as e:
        print(f"Error during RAG initialization: {e}")
        
    yield

app = FastAPI(title="Volunteering App API (Python)", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Same as C# backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(organizations.router)
app.include_router(tasks.router)
app.include_router(admin.router)
app.include_router(volunteers.router)
app.include_router(hours.router)
app.include_router(misc.router)
app.include_router(chatbot.router)

# Serve static files (uploads)
upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "images", "uploads")
print("Upload directory:", upload_dir)
if os.path.exists(upload_dir):
    app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")


if __name__ == "__main__":
    import uvicorn
    # Run on port 5001 to seamlessly replace the C# backend
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)
