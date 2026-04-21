import numpy as np
from sentence_transformers import SentenceTransformer

# Load once, using ONNX runtime which gives ~2-3x speedup on CPU
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2', backend='onnx')

def get_embeddings(text_list):
    # Performance trick: only calculate embeddings for UNIQUE strings.
    # In datasets with many duplicates, this saves massive amounts of time.
    unique_texts = list(set(text_list))
    
    # Calculate embeddings only for unique texts (increased batch size)
    unique_embs = model.encode(unique_texts, batch_size=256, show_progress_bar=True)
    
    # Create mapping dictionary
    embed_map = {txt: emb for txt, emb in zip(unique_texts, unique_embs)}
    
    # Map back to original list exactly as required by FAISS
    # Note: list comprehension here is virtually instant even for 1M rows
    all_embeddings = [embed_map[txt] for txt in text_list]
    
    return all_embeddings
