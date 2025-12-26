import pandas as pd
import joblib
import os
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

print("3 AYRI MODEL EĞİTİMİ BAŞLADI ")

current_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(current_dir, 'clean_dataset.csv')

try:
    df = pd.read_csv(file_path)
    df = df.dropna(subset=['cleaned_text', 'label'])
except Exception as e:
    print(f" HATA: {e}")
    exit()

# Harf Analizi (Stylometry) 
print("⏳Vektör haritası çıkarılıyor (3-5 harflik bloklar)...")
vectorizer = TfidfVectorizer(analyzer='char_wb', ngram_range=(3, 5), max_features=30000, min_df=5)

X = vectorizer.fit_transform(df['cleaned_text'])
y = df['label']

joblib.dump(vectorizer, os.path.join(current_dir, 'vectorizer.pkl'))

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42, stratify=y)


models = {
    "Logistic Regression": LogisticRegression(max_iter=1000, solver='liblinear', C=1.0),
    "Naive Bayes": MultinomialNB(alpha=0.1),
    "Random Forest": RandomForestClassifier(n_estimators=300, random_state=42)
}

print("\nModeller eğitiliyor \n")

model_names = []
accuracies = []

for name, model in models.items():
    print(f" {name} eğitiliyor...")
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred) * 100
    
    model_names.append(name)
    accuracies.append(acc)
    
    # Ayrı dosyalara kaydetme
    if name == "Logistic Regression": dosya_adi = "model_logistic.pkl"
    elif name == "Naive Bayes": dosya_adi = "model_naive_bayes.pkl"
    else: dosya_adi = "model_random_forest.pkl"
        
    joblib.dump(model, os.path.join(current_dir, dosya_adi))
    print(f"💾 {dosya_adi} kaydedildi. Başarı: %{acc:.2f}")

# Grafik
plt.figure(figsize=(10, 6))
plt.bar(model_names, accuracies, color=['#3498db', '#2ecc71', '#e74c3c'])
plt.title('3 Ayrı Modelin Başarısı')
plt.ylabel('Başarı (%)')
plt.ylim(0, 100)
plt.savefig(os.path.join(current_dir, 'model_accuracy.png'))
plt.close()
print(f"📊 Grafik kaydedildi: model_accuracy.png")