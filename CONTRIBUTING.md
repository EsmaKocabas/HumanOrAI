# Katkıda Bulunma Rehberi

# HumanOrAI 

### 1. Gereksinimler

- Python 3.7 veya üzeri
- pip (Python paket yöneticisi)

### 2. Bağımlılıkları Yükleme

Proje dizininde terminal/komut satırını açın ve şu komutu çalıştırın:

```bash
pip install -r requirements.txt
```

## 📥 ArXiv Scraper Kullanımı

### Standart veri çekim akışı (herkes için aynı)

1. Tek terminal aç ve aşağıdaki ortam değişkenlerini yalnızca o oturum için ayarla:
   ```powershell
   $env:HUMANORAI_ALLOW_SCRAPE = "1"
   $env:PYTHONIOENCODING = "utf-8"
   ```
2. Scraper’ı çalıştır:
   ```powershell
   python scraping_scripts\arxiv_scraper.py --target 3000
   ```
3. Terminalde `💾 .../3000` loglarını ve sonunda `✅ İşlem tamamlandı. Toplam 3000 özet hazır.` mesajını görmeden pencereyi kapatma.

> Script, reCAPTCHA yüzünden 3000’e ulaşamazsa hata fırlatır. Bu durumda birkaç dakika bekleyip adım 2’den itibaren tekrarlayın (dosyayı silmeyi unutmayın).

## 1️⃣ API Key Alma

1. **Google AI Studio**'ya gidin: https://aistudio.google.com/apikey
2. **"Create API Key"** butonuna tıklayın
3. Google hesabınızla giriş yapın
4. API key'inizi kopyalayın

## 2️⃣ .env Dosyası Oluşturma

Proje klasörünüzde `.env` dosyası oluşturun:

```powershell
# Windows PowerShell
cd C:\Users\Esma\Desktop\HumanOrAI
```

`.env` dosyasını oluşturun ve içine şunu yazın:

```
GEMINI_API_KEY=your-api-key-here
```

**Örnek:**
```
GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> ⚠️ **Önemli:** `.env` dosyası `.gitignore`'a eklenmiştir, API key'iniz GitHub'a yüklenmeyecektir.

## 3️⃣ Bağımlılıkları Yükleme

```powershell
pip install -r requirements.txt
```

## 4️⃣ AI Abstract'ları Üretme

### Temel Kullanım (3000 kayıt):

```powershell
python scraping_scripts\gemini_scraper.py --target 3000
```

## 5️⃣ Verileri Birleştirme

Human ve AI verilerini birleştirmek için:

```powershell
python scraping_scripts\combine_datasets.py
```

### Özelleştirilmiş birleştirme:

```powershell
python scraping_scripts\combine_datasets.py --human data\raw\human_abstracts.csv --ai data\raw\ai_abstracts.csv --output data\raw\combined_dataset.csv
```

### Shuffle (karıştırma) olmadan:

```powershell
python scraping_scripts\combine_datasets.py --no-shuffle
```



### Ekip Çalışması

**Önemli:** CSV dosyaları GitHub'a atılmaz (`.gitignore` ile engellendi). Her ekip üyesi kendi bilgisayarında sıfırdan veri çeker.

**Çalışma Şekli:**
1. Herkes projeyi klonlar ve `pip install -r requirements.txt` çalıştırır
2. Herkes yukarıdaki standart akışı uygular (aynen aynı adımlar)
3. Herkesin `data/raw/human_abstracts.csv` dosyasında **3000 satır** olana kadar süreci tekrarlar

**Not:** CSV dosyası var ise script kaldığı yerden devam eder. Standart akış gereği sıfırdan başlamak için önce dosyayı silin veya yedekleyin.

**Farklı dosya adı kullanmak için:**
```bash
python scraping_scripts/arxiv_scraper.py --output data/raw/human_abstracts_2.csv
```

### Çıktı Formatı

CSV dosyası şu sütunları içerir:
- `abstract_text`: Makale özeti (düz metin)
- `source_url`: ArXiv.org'daki makale URL'si
- `license_info`: Lisans bilgisi
- `label`: "Human" veya "AI" etiketi


## Geliştirme İş Akışı

1. **Yeni branch oluştur**:
   ```bash
   git checkout -b feature/yeni-ozellik
   ```

2. **Değişiklikleri yap ve commit et**:
   ```bash
   git add .
   git commit -m "Açıklayıcı commit mesajı"
   ```

3. **Push yap**:
   ```bash
   git push origin feature/yeni-ozellik
   ```

4. **Pull Request oluştur** (GitHub'da)
