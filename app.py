from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set your API key securely
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

@app.route("/moderate", methods=["POST"])
def moderate():
    data = request.get_json()
    message = data.get("message", "")

    try:
        response = openai.Moderation.create(input=message)
        flagged = response["results"][0]["flagged"]
        categories = response["results"][0]["categories"]
        return jsonify({"flagged": flagged, "categories": categories})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
