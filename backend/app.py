import logging
from pathlib import Path

from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from config import Config
from models import db
from routes.auth import auth_bp


def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)
    config_object.validate()

    if app.config["SQLALCHEMY_DATABASE_URI"].startswith("sqlite:///"):
        database_path = app.config["SQLALCHEMY_DATABASE_URI"][10:]
        if database_path and database_path != ":memory:" and not Path(database_path).is_absolute():
            Path(app.instance_path, database_path).parent.mkdir(parents=True, exist_ok=True)

    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGIN"]}})
    app.register_blueprint(auth_bp)

    @app.get("/api/health")
    def health():
        return jsonify(success=True, message="Service is healthy.", status="ok"), 200

    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        return jsonify(success=False, message=error.description), error.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        app.logger.error("Unhandled server error (%s)", type(error).__name__)
        return jsonify(success=False, message="An internal server error occurred."), 500

    with app.app_context():
        db.create_all()

    return app


app = create_app()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    app.run(host="0.0.0.0", port=5000, debug=False)
