from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env
load_dotenv()

# Initialize OpenAI client with API key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

@app.route("/moderate", methods=["POST"])
def moderate():
    data = request.get_json()
    message = data.get("message", "")

    try:
        # Call OpenAI Moderation API using latest SDK
        response = client.moderations.create(input=message)
        flagged = response.results[0].flagged
        categories = response.results[0].categories
        return jsonify({"flagged": flagged, "categories": categories})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)