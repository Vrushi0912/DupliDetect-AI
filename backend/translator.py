from deep_translator import GoogleTranslator
import concurrent.futures

def _translate_single(t, target_lang):
    try:
        t_str = str(t).strip()
        if not t_str:
            return t
        
        translator = GoogleTranslator(source='auto', target=target_lang)
        result = translator.translate(t_str)
        
        if result is None or result.strip() == "":
            return t
        return result
    except Exception:
        return t

def translate_batch(texts, target_lang):
    # Performance Optimization: Only translate UNIQUE strings
    # This prevents sending redundant network requests for identical rows
    unique_texts = list(set([str(t).strip() for t in texts if str(t).strip()]))
    
    translated_map = {}
    
    # Use ThreadPoolExecutor to drastically speed up translation via concurrent requests
    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
        # submit tasks
        futures = {executor.submit(_translate_single, t, target_lang): t for t in unique_texts}
        
        # gather results into our map
        for future in concurrent.futures.as_completed(futures):
            original_text = futures[future]
            try:
                translated_map[original_text] = future.result()
            except Exception:
                translated_map[original_text] = original_text

    # Map back to the original full list
    translated = []
    for t in texts:
        t_str = str(t).strip()
        if not t_str:
            translated.append(t)
        else:
            translated.append(translated_map.get(t_str, t))

    return translated
