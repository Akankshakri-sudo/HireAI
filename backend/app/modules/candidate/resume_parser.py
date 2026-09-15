import os
import fitz


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
        print(f"PyMuPDF error: {e}")

    extracted = "\n".join(text_parts).strip()
    if not extracted:
        # Fallback: attempt raw text read in case it's a formatted text or plain file
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                extracted = f.read().strip()
        except Exception:
            pass

    return extracted