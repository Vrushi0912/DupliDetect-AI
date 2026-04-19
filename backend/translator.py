from deep_translator import GoogleTranslator
from concurrent.futures import ThreadPoolExecutor, as_completed

def _translate_one(text, target_lang):
    """Translate a single text string, with safe fallback."""
    try:
        t = str(text).strip()
        if not t:
            return text
        result = GoogleTranslator(source='auto', target=target_lang).translate(t)
        if result is None or result.strip() == "":
            return text
        return result
    except Exception:
        return text


def translate_batch(texts, target_lang, max_workers=10):
    """
    Translate a list of texts in PARALLEL using a thread pool.
    Falls back to original text on any error.
    """
    results = [None] * len(texts)

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_idx = {
            executor.submit(_translate_one, text, target_lang): idx
            for idx, text in enumerate(texts)
        }
        for future in as_completed(future_to_idx):
            idx = future_to_idx[future]
            results[idx] = future.result()

    return results
