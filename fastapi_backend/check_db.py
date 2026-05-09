import sqlite3
import pprint

conn = sqlite3.connect('volunteering.db')
print("Tables:")
print(conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall())

try:
    print("\nUsers:")
    pprint.pprint(conn.execute("SELECT id, email, password_hash FROM users LIMIT 5").fetchall())
except Exception as e:
    print("Error querying users:", e)

try:
    print("\nOrganizations:")
    pprint.pprint(conn.execute("SELECT id, email, password_hash FROM organizations LIMIT 5").fetchall())
except Exception as e:
    print("Error querying organizations:", e)
