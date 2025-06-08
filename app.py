from flask import Flask, request, jsonify
from flask_cors import CORS
import re

banned_keywords = [
    "kill", "hate", "die", "suicide", "bomb", "shoot", "stab", "rape", "murder",
    "abuse", "terrorist", "attack", "self-harm", "explosive", "harm", "threat",
    "cut", "burn", "gun", "violence", "slaughter", "blood", "death", "hurt", "hurt someone"
]

app = Flask(__name__)
CORS(app)

@app.route("/moderate", methods=["POST"])
def moderate():
    data = request.get_json()
    message = data.get("message", "").lower()

    matched = [word for word in banned_keywords if re.search(r'\b' + re.escape(word) + r'\b', message)]
    flagged = bool(matched)

    return jsonify({
        "flagged": flagged,
        "matched_words": matched
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
