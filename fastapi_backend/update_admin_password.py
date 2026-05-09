import sqlite3
import sys
import os

# Add the parent directory to sys.path so we can import from core
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.security import get_password_hash

conn = sqlite3.connect('volunteering.db')
cursor = conn.cursor()

new_hash = get_password_hash("admin123")
cursor.execute("UPDATE users SET password_hash = ? WHERE email = ?", (new_hash, 'adam@fursa.com'))
conn.commit()

print(f"Updated password for adam@fursa.com. Rows affected: {cursor.rowcount}")
