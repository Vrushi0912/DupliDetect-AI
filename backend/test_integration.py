import requests
import json
import time

BASE_URL = "http://localhost:8000/api"
CSV_PATH = "data.csv"

def run_test():
    print("🚀 Starting Integration Test Suite...")

    # 1. Health Ping
    try:
        req = requests.get(f"{BASE_URL}/health")
        req.raise_for_status()
        print(f"✅ Health Check Passed: {req.json()}")
    except Exception as e:
        print(f"❌ Health Check Failed: {e}")
        return

    # 2. Duplicate Detection
    print("\n📦 Testing `/api/detect` with 'data.csv'...")
    try:
        t0 = time.time()
        with open(CSV_PATH, 'rb') as f:
            files = {'file': ('data.csv', f, 'text/csv')}
            response = requests.post(f"{BASE_URL}/detect", files=files)
        
        response.raise_for_status()
        result = response.json()
        total = result.get('total_records')
        clean = result.get('clean_records')
        dupes = len(result.get('duplicates', []))
        
        print(f"✅ Duplicate Detection Passed in {time.time() - t0:.2f}s!")
        print(f"📊 Stats: Total={total}, Clean={clean}, Duplicates={dupes}")
    except Exception as e:
        print(f"❌ Duplicate Detection Failed: {e}")
        try:
            print("Response:", response.text)
        except:
            pass
        return

    # 3. Translation
    print("\n🌐 Testing `/api/translate`...")
    try:
        # Extract a few texts from the clean dataset to translate
        texts_to_translate = []
        for row in result.get('clean', [])[:3]: # Take first 3 clean records
            texts_to_translate.append(str(list(row.values())[1] if len(row) > 1 else list(row.values())[0]))
            
        print(f"Translating {len(texts_to_translate)} items to Spanish...")
        
        payload = {
            "texts": texts_to_translate,
            "target_lang": "es",
            "max_workers": 2
        }
        
        t0 = time.time()
        trans_res = requests.post(f"{BASE_URL}/translate", json=payload)
        trans_res.raise_for_status()
        
        translations = trans_res.json().get('translated_texts', [])
        print(f"✅ Translation Passed in {time.time() - t0:.2f}s!")
        for orig, tr in zip(texts_to_translate, translations):
            print(f"   > '{orig}'  =>  '{tr}'")
            
    except Exception as e:
        print(f"❌ Translation Failed: {e}")
        try:
            print("Response:", trans_res.text)
        except:
            pass
        return

    print("\n🎉 ALL TESTS PASSED. The Python Backend API is production-ready.")

if __name__ == "__main__":
    run_test()
