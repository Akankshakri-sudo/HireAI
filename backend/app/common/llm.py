"""Thin async Gemini client.

Every public helper returns ``None`` on any failure (missing key, network
error, bad response, unparseable body) so callers can fall back to the
built-in heuristic behavior without special-casing.
"""

import json
import logging
import re
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"


def llm_enabled() -> bool:
    return bool(settings.GEMINI_API_KEY)


def _extract_json(text: str) -> Any | None:
    """Parse a JSON object/array out of a model reply, tolerating markdown fences."""
    if not text:
        return None
    candidate = text.strip()
    fence_match = re.search(
        r"```(?:json)?\s*(.*?)\s*```",
        candidate,
        re.DOTALL,
    )
    if fence_match:
        candidate = fence_match.group(1)
    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        pass
    # Last resort: first {...} or [...] block in the text.
    for opener, closer in (("{", "}"), ("[", "]")):
        start = candidate.find(opener)
        end = candidate.rfind(closer)
        if start != -1 and end > start:
            try:
                return json.loads(candidate[start : end + 1])
            except json.JSONDecodeError:
                continue
    return None


async def generate_json(
    prompt: str,
    system: str | None = None,
    temperature: float = 0.4,
    timeout: float | None = None,
) -> Any | None:
    """Ask the configured Gemini model for a JSON reply. Returns None on failure."""
    if not llm_enabled():
        return None

    payload: dict[str, Any] = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": temperature,
        },
    }
    if system:
        payload["systemInstruction"] = {"parts": [{"text": system}]}

    try:
        async with httpx.AsyncClient(
            timeout=timeout or settings.AI_TIMEOUT_SECONDS,
        ) as client:
            response = await client.post(
                f"{_BASE_URL}/{settings.GEMINI_MODEL}:generateContent",
                headers={"x-goog-api-key": settings.GEMINI_API_KEY},
                json=payload,
            )
        if response.status_code != 200:
            logger.warning(
                "Gemini request failed (%s): %s",
                response.status_code,
                response.text[:200],
            )
            return None

        body = response.json()
        candidates = body.get("candidates") or []
        parts = (
            candidates[0].get("content", {}).get("parts", [])
            if candidates
            else []
        )
        text = "".join(part.get("text", "") for part in parts)
        parsed = _extract_json(text)
        if parsed is None:
            logger.warning("Gemini reply was not parseable as JSON: %s", text[:200])
        return parsed
    except Exception:
        logger.warning("Gemini request raised an exception", exc_info=True)
        return None


def coerce_str_list(value: Any, max_items: int) -> list[str]:
    """Best-effort conversion of a model reply fragment into a clean str list.

    Accepts a list of strings / {key: string} dicts, or a comma-separated
    string (models ignore list instructions surprisingly often). Only strings
    and dicts survive; everything else is junk.
    """
    if isinstance(value, str):
        value = value.split(",")
    if not isinstance(value, list):
        return []
    items = []
    for item in value:
        if isinstance(item, str):
            text = item.strip()
        elif isinstance(item, dict):
            # Models sometimes reply with [{"question": "..."}] despite instructions.
            text = str(
                next(
                    (v for v in item.values() if isinstance(v, str)),
                    "",
                )
            ).strip()
        else:
            text = ""
        if text:
            items.append(text)
        if len(items) >= max_items:
            break
    return items
