import logging
import os

import fitz

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str) -> str:
    if not os.path.exists(file_path):
        return ""

    text_parts = []
    try:
        with fitz.open(file_path) as document:
            for page in document:
                text = page.get_text()
                if text:
                    text_parts.append(text)
    except Exception as e:
        logger.warning("PyMuPDF failed to extract text from %s: %s", file_path, e)

    extracted = "\n".join(text_parts).strip()
    if not extracted:
        # Fallback: attempt raw text read in case it's a formatted text or plain file
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                extracted = f.read().strip()
        except Exception:
            logger.warning("Fallback text read failed for %s", file_path)

    return extracted