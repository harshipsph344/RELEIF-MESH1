from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables FIRST before any other imports
load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db
from auth import auth_bp
from routes import api_bp

def create_app():
    """
    Application factory for creating and configuring the Flask app.
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004"
    ]
)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(api_bp, url_prefix='/api')

    # Create database tables
    with app.app_context():
        db.create_all()

    # Health check route
    @app.route('/')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'RelayNest API is running',
            'version': '1.0.0'
        }), 200

    return app


if __name__ == '__main__':
    app = create_app()
    print("="*50)
    print("RelayNest API Server starting...")
    print("Session-based authentication enabled")
    print("Server running at http://localhost:5000")
    print("="*50)
    app.run(debug=True, host='0.0.0.0', port=5000)
