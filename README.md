# HumanOrAI

Yazılan metnin AI tarafından mı insan tarafından mı yazıldığını tespit eden bir makine öğrenmesi projesi ve web uygulaması.

## 📋 Proje Hakkında

Bu proje, akademik makale özetlerini (abstracts) analiz ederek bunların insan tarafından mı yoksa AI (yapay zeka) tarafından mı yazıldığını tespit etmek için geliştirilmiştir.

## 🎯 Özellikler

- **Veri Toplama**: ArXiv'den 3000 human abstract çekme
- **AI Veri Üretimi**: Gemini API ile human abstract'larını AI tarzında yeniden yazma
- **Veri Birleştirme**: Human ve AI verilerini birleştirme ve karıştırma
- **Model Eğitimi**: İnsan vs AI metin sınıflandırma modeli eğitimi (yakında)

## 📁 Proje Yapısı

```
HumanOrAI/
├── data/
│   └── raw/              # CSV veri dosyaları (git'te yok)
│       ├── human_abstracts.csv
│       ├── ai_abstracts.csv
│       └── combined_dataset.csv
├── scraping_scripts/
│   ├── arxiv_scraper.py      # ArXiv'den human veri çekme
│   ├── gemini_scraper.py     # Gemini API ile AI veri üretme
│   └── combine_datasets.py   # Verileri birleştirme
├── requirements.txt
├── CONTRIBUTING.md
└── README.md
```

## 🚀 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/EsmaKocabas/HumanOrAI.git
cd HumanOrAI
```

### 2. Bağımlılıkları Yükleyin

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

`.env` dosyası oluşturun:

```env
GEMINI_API_KEY=your-api-key-here
```

> **Not**: API key almak için: https://aistudio.google.com/apikey

## 📖 Kullanım

### Human Verileri Çekme

```bash
# PowerShell'de ortam değişkenini ayarlayın
$env:HUMANORAI_ALLOW_SCRAPE = "1"

# Scraper'ı çalıştırın
python scraping_scripts/arxiv_scraper.py --target 3000
```

### AI Verileri Üretme

```bash
python scraping_scripts/gemini_scraper.py --target 3000
```

### Verileri Birleştirme

```bash
python scraping_scripts/combine_datasets.py
```

Çıktı: `data/raw/combined_dataset.csv` (6000 kayıt: 3000 Human + 3000 AI)

## 👥 Ekip Çalışması

Her ekip üyesi:
1. Projeyi klonlar
2. Bağımlılıkları yükler
3. Kendi API key'ini `.env` dosyasına ekler
4. Aynı komutları çalıştırarak verileri çeker

> **Önemli**: CSV dosyaları git'te yok (`.gitignore` ile engellendi). Herkes kendi verilerini çekmelidir.

## 📝 Detaylı Dokümantasyon

Daha fazla bilgi için [CONTRIBUTING.md](CONTRIBUTING.md) dosyasına bakın.

## 🔧 Geliştirme

1. Yeni branch oluştur: `git checkout -b feature/yeni-ozellik`
2. Değişiklikleri yap ve commit et
3. Push yap: `git push origin feature/yeni-ozellik`
4. Pull Request oluştur

## 📊 Veri İstatistikleri

- **Human Abstracts**: 3000
- **AI Abstracts**: 3000
- **Toplam**: 6000

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

## 👨‍💻 Yazar

- **Esma Koçabaş** - [@EsmaKocabas](https://github.com/EsmaKocabas)

## 🙏 Katkıda Bulunanlar

Projeye katkıda bulunan herkese teşekkürler!

---

**Not**: Veri dosyaları GitHub'a yüklenmez (çok büyük olduğu için). Her ekip üyesi kendi verilerini çekmelidir.
