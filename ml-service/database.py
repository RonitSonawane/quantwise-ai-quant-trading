from pymongo import MongoClient
from datetime import datetime
import ssl
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://sonawaneronit24_db_user:1hgN06yZOC88TYwH@cluster0.ugny8kt.mongodb.net/?appName=Cluster0")

# ok


try:
    client = MongoClient(
        MONGO_URI,
        tls=True,
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=30000,
        connectTimeoutMS=30000,
        socketTimeoutMS=30000,
    )
    db = client["quantwise"]
    trades_collection    = db["trades"]
    signals_collection   = db["signals"]
    metrics_collection   = db["metrics"]
    positions_collection = db["positions"]
    print("MongoDB client created")
except Exception as e:
    print(f"MongoDB client creation error: {e}")
    client = None
    db = None
    trades_collection    = None
    signals_collection   = None
    metrics_collection   = None
    positions_collection = None

def test_connection():
    try:
        if client is None:
            return False
        client.admin.command('ping')
        print("MongoDB connected successfully")
        return True
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        return False