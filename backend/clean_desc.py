from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("""
        UPDATE models SET description = SPLIT_PART(description, chr(10), 1)
        WHERE description LIKE '%Downloads%'
    """))
    conn.commit()
print('Descriptions cleaned')
