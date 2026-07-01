import os
from datetime import timedelta

class Config:
    # Database
    SQLALCHEMY_DATABASE_URI = 'sqlite:///relaynest.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Flask Session
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-flask-secret-key-change-in-production')
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = True
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    # Geocoding
    GEOCODING_USER_AGENT = 'RelayNest_DisasterRelief_App'
