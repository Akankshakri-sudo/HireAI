import asyncio
from sqlalchemy import text
from app.database.session import engine

async def check_all_tables():
    async with engine.connect() as conn:
        # Get all tables
        result = await conn.execute(text(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
        ))
        tables = result.fetchall()
        
        for (table_name,) in tables:
            print(f"\n=== {table_name} ===")
            cols = await conn.execute(text(
                f"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '{table_name}' ORDER BY ordinal_position"
            ))
            for col in cols.fetchall():
                print(f"  {col[0]}: {col[1]} (nullable: {col[2]})")

asyncio.run(check_all_tables())
