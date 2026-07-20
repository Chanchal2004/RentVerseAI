import os
import json
import logging
import re
import google.generativeai as genai

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

SYSTEM = """
You are a strict fraud-detection assistant for an Indian rental property marketplace.

Given a property listing in JSON format, respond ONLY with valid JSON using this format:

{
  "verdict":"approve|reject|manual_review",
  "confidence":0.95,
}

Rules:
- Approve only when:
  - Title is meaningful.
  - Description has at least 40 characters.
  - Monthly rent is between ₹1500 and ₹500000.
  - Address is provided.
  - At least one property photo exists.
- Reject obvious scams.
- Otherwise return manual_review.
"""


def extract_json(text: str):
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON found in Gemini response")
    return json.loads(match.group(0))


async def verify_listing(listing: dict):

    if not GEMINI_API_KEY:
        return {
            "verdict": "manual_review",
            "confidence": 0.0,
            "reasons": ["Gemini API key not configured"]
        }

    genai.configure(api_key=GEMINI_API_KEY)

    model = genai.GenerativeModel("gemini-2.5-flash")

    payload = {
        "title": listing.get("title"),
        "description": listing.get("description"),
        "address": listing.get("address"),
        "city": listing.get("city"),
        "monthly_rent": listing.get("monthly_rent"),
        "security_deposit": listing.get("security_deposit"),
        "rooms": listing.get("rooms"),
        "furnishing": listing.get("furnishing"),
        "property_type": listing.get("property_type"),
        "photos_count": len(listing.get("photos") or [])
    }

    prompt = SYSTEM + "\n\nProperty Listing:\n" + json.dumps(payload, indent=2)

    try:

        response = model.generate_content(prompt)

        result = extract_json(response.text)

        verdict = result.get("verdict", "manual_review")

        if verdict not in ["approve", "reject", "manual_review"]:
            verdict = "manual_review"

        return {
            "verdict": verdict,
            "confidence": float(result.get("confidence", 0.5)),
            "reasons": result.get("reasons", [])[:5]
        }

    except Exception as e:

        logger.exception(e)

        return {
            "verdict": "manual_review",
            "confidence": 0.0,
            "reasons": [str(e)]
        }