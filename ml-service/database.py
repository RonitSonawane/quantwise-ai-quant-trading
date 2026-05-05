from pymongo import MongoClient
import ssl
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://sonawaneronit24_db_user:1hgN06yZOC88TYwH@cluster0.ugny8kt.mongodb.net/?appName=Cluster0")

client = None
db = None
users_collection = None
trades_collection = None
signals_collection = None
metrics_collection = None
positions_collection = None
watchlists_collection = None
transactions_collection = None
backtests_collection = None
settings_collection = None
notifications_collection = None

try:
    client = MongoClient(
        MONGO_URI,
        tls=True,
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
        socketTimeoutMS=5000,
    )
    db = client["quantwise"]
    trades_collection    = db["trades"]
    signals_collection   = db["signals"]
    metrics_collection   = db["metrics"]
    positions_collection = db["positions"]
    users_collection        = db["users"]
    watchlists_collection   = db["watchlists"]
    transactions_collection = db["transactions"]
    backtests_collection    = db["backtests"]
    settings_collection     = db["user_settings"]
    notifications_collection = db["notifications"]
except Exception as e:
    print(f"MongoDB setup error: {e}")

def initialize_db():
    try:
        if users_collection is not None:
            users_collection.create_index("email", unique=True)
            trades_collection.create_index("user_id")
            transactions_collection.create_index("user_id")
            watchlists_collection.create_index("user_id")
            print("Database indexes initialized")
    except Exception as e:
        print(f"Index creation failed: {e}")

def test_connection():
    try:
        if client is None: return False
        client.admin.command('ping')
        return True
    except:
        return False