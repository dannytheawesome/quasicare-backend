from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import time

app = Flask(__name__)
CORS(app, resources={r"/moderate": {"origins": "*"}})

# Expanded keyword list with phrases
banned_patterns = [
    r"\bhate\b", r"\bkill\b", r"\bdie\b", r"\bpunch\b", r"\bhurt\b",
    r"\bsuicide\b", r"\bshoot\b", r"\bstab\b", r"\battack\b", r"\bexplode\b",
    r"\bi want to (hurt|kill|punch|hit|stab|harm|fight) someone\b",
    r"\bi feel like (hurting|punching|killing|attacking) someone\b",
    r"\bsomeone deserves to (die|suffer|get hurt)\b"
]

# Rate limiting configuration
rate_limit = {}
MAX_REQUESTS = 10
TIME_WINDOW = 60  # seconds

@app.route("/moderate", methods=["POST"])
def moderate():
    ip = request.remote_addr
    now = time.time()

    # Initialize or clean timestamps for this IP
    if ip not in rate_limit:
        rate_limit[ip] = []
    rate_limit[ip] = [t for t in rate_limit[ip] if now - t < TIME_WINDOW]

    # Enforce rate limit
    if len(rate_limit[ip]) >= MAX_REQUESTS:
        return jsonify({
            "flagged": True,
            "error": "Rate limit exceeded. Please wait before submitting again.",
            "matched_words": []
        }), 429

    # Log this request
    rate_limit[ip].append(now)

    # Perform moderation
    data = request.get_json()
    message = data.get("message", "").lower()
    matched = [pat for pat in banned_patterns if re.search(pat, message)]
    flagged = bool(matched)

    return jsonify({
        "flagged": flagged,
        "matched_words": matched
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
