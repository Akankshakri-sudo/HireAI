import fitz


def extract_text_from_pdf(file_path: str) -> str:
    text_parts = []

    with fitz.open(file_path) as document:
        for page in document:
            text_parts.append(page.get_text())

    return "\n".join(text_parts).strip()