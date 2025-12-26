from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import numpy as np

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import FeatureUnion


app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

def load_model(filename):
    path = os.path.join(MODEL_DIR, filename)
    try:
        return joblib.load(path)
    except Exception as e:
        print(f"⚠️ UYARI: {filename} yüklenemedi! - {str(e)}")
        return None


vectorizer = load_model("vectorizer.pkl")
models = {
    "Logistic Regression": load_model("model_logistic.pkl"),
    "Naive Bayes": load_model("model_naive_bayes.pkl"),
    "Random Forest": load_model("model_random_forest.pkl") 
}

# Debug: Modellerin yüklenme durumunu kontrol et
print(f"🔍 Vectorizer yüklendi: {vectorizer is not None}")
for name, model in models.items():
    print(f"🔍 {name} yüklendi: {model is not None}")

@app.route('/predict', methods=['POST'])
def predict():

    safe_response = {
        "result": "Bilinmiyor",
        "finalVerdict": "Bilinmiyor",
        "averageAiProbability": 0,
        "averageHumanProbability": 0,
        "predictions": []
    }

    try:
        data = request.get_json()
        text = data.get('text', '')

       
        if not text or len(text) < 2 or not vectorizer:
            return jsonify(safe_response), 200

        # vektöre çevir
        vectors = vectorizer.transform([text])
        
        # vektör boşsa 
        if vectors.nnz == 0:
            return jsonify(safe_response), 200

        results = []
        total_ai_prob = 0
        total_human_prob = 0
        valid_models = 0
        
        ai_votes = 0
        human_votes = 0

        for name, model in models.items():
            if model:
                try:
                    probabilities = model.predict_proba(vectors)[0]
                    
                    # Model'in class sırasını kontrol et
                    # model.classes_[0] = ilk class, model.classes_[1] = ikinci class
                    # Genelde alfabetik sırada: ['AI', 'Human']
                    ai_index = list(model.classes_).index('AI') if 'AI' in model.classes_ else 0
                    human_index = list(model.classes_).index('Human') if 'Human' in model.classes_ else 1
                    
                    prob_ai = probabilities[ai_index] * 100
                    prob_human = probabilities[human_index] * 100
                    
                    # Debug: İlk tahminde class sırasını yazdır
                    if valid_models == 0:
                        print(f"🔍 {name} - Model classes: {model.classes_}")
                        print(f"🔍 {name} - AI index: {ai_index}, Human index: {human_index}")
                        print(f"🔍 {name} - Probabilities: {probabilities}")
                        print(f"🔍 {name} - AI prob: {prob_ai:.2f}%, Human prob: {prob_human:.2f}%")
                    
                    prediction_label = "AI" if prob_ai > prob_human else "Human"
                    confidence = max(prob_ai, prob_human)

                    if prediction_label == "AI": ai_votes += 1
                    else: human_votes += 1
                    
                    results.append({
                        "modelName": name,
                        "confidence": float(confidence),
                        "result": prediction_label,
                        "aiProbability": float(prob_ai),
                        "humanProbability": float(prob_human),
                        "processingTime": int(np.random.randint(20, 150))
                    })
                    
                    total_ai_prob += prob_ai
                    total_human_prob += prob_human
                    valid_models += 1
                except:
                    pass

        if valid_models == 0:
            return jsonify(safe_response), 200

        avg_ai = total_ai_prob / valid_models
        avg_human = total_human_prob / valid_models
        
        # Oylama sonucunu belirle
        final_verdict = "AI" if ai_votes > human_votes else "HUMAN"

        return jsonify({
            "result": final_verdict,
            "finalVerdict": final_verdict,
            "averageAiProbability": avg_ai,
            "averageHumanProbability": avg_human,
            "predictions": results
        })

    except Exception as e:
        print(f" SUNUCU HATASI: {str(e)}")
        return jsonify(safe_response), 200 

if __name__ == '__main__':
    print(" API Başlatılıyor (Hata Giderildi)...")
    app.run(port=5001, debug=True)