import asyncio
from db.database import engine
from db.models import Base

async def create_db_and_tables():
    async with engine.begin() as conn:
        print("Dropping existing tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating new tables...")
        await conn.run_sync(Base.metadata.create_all)
    print("Database recreated with snake_case schema successfully.")

if __name__ == "__main__":
    asyncio.run(create_db_and_tables())
