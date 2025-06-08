from flask import Flask, request, jsonify
from flask_cors import CORS

# Banned words list for moderation
banned_words = [
    "kill", "hate", "die", "suicide", "bomb", "shoot", "stab", "rape", "murder",
    "abuse", "terrorist", "attack", "self-harm", "explosive", "harm", "threat",
    "cut", "burn", "gun", "violence", "slaughter", "blood", "death"
]

app = Flask(__name__)
CORS(app)  # Allow CORS for frontend access

@app.route("/moderate", methods=["POST"])
def moderate():
    data = request.get_json()
    message = data.get("message", "").lower()

    # Identify which words triggered a flag
    matched_words = [word for word in banned_words if word in message]
    flagged = bool(matched_words)

    return jsonify({
        "flagged": flagged,
        "matched_words": matched_words
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
