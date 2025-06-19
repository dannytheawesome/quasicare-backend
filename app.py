from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)

# Allow only your frontend domain in production
CORS(app, resources={r"/moderate": {"origins": "*"}})  # Replace "*" with your frontend URL in production

# Patterns to match harmful or aggressive messages
banned_patterns = [
    r"\bhate\b", r"\bkill\b", r"\bdie\b", r"\bpunch\b", r"\bhurt\b",
    r"\bsuicide\b", r"\bshoot\b", r"\bstab\b", r"\battack\b", r"\bexplode\b",
    r"\bi want to (hurt|kill|punch|hit|stab|harm|fight) someone\b",
    r"\bi feel like (hurting|punching|killing|attacking) someone\b",
    r"\bsomeone deserves to (die|suffer|get hurt)\b"
]

@app.route("/moderate", methods=["POST"])
def moderate():
    try:
        data = request.get_json()
        message = data.get("message", "").lower()

        matched = [pattern for pattern in banned_patterns if re.search(pattern, message)]
        flagged = bool(matched)

        return jsonify({
            "flagged": flagged,
            "matched_words": matched
        }), 200
    except Exception as e:
        return jsonify({"error": "Invalid input", "details": str(e)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
