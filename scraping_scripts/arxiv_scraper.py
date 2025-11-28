"""ArXiv scraper – deterministik şekilde 3000 kayıt hedefler."""

import argparse
import csv
import os
import random
import re
import sys
import time
from typing import Dict, Iterable, List, Optional, Set

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://arxiv.org"
# Alternatif URL'ler (birisi çalışmazsa diğeri denenir)
FALLBACK_BASE_URLS = [
    "https://arxiv.org",
    "https://export.arxiv.org",
]
ABS_RE = re.compile(r"/abs/(\d+\.\d+)")
DEFAULT_LICENSE = "arXiv.org perpetual, non-exclusive license"
ABSTRACT_CLEANUP_RE = re.compile(r"^.*?abstract:?\s*", re.IGNORECASE)
LIST_DELAY = (1.5, 3.0)  # reCAPTCHA'dan kaçınmak için dengeli bekleme
ABS_DELAY = (1.0, 2.0)  # Abstract için bekleme
MAX_SKIP = 5000  # Makul bir üst limit (çoğu kategoride 5000'den fazla makale yok)
SKIP_STEP = 50  # ORİJİNAL: Deterministik sıralama için 50 kalmalı
EMPTY_PAGE_LIMIT = 10  # Daha hızlı kategori geçişi için
# Son 100 veri için özel ayarlar
FAST_SKIP_STEP = 25  # Son 100 veri için daha küçük adım
VERY_FAST_SKIP_STEP = 10  # Son 50 veri için çok küçük adım
ULTRA_FAST_SKIP_STEP = 5  # Son 50 veri için ultra küçük adım (maksimum hız)
EXTREME_SKIP_STEP = 1  # Son 30 veri için EXTREME küçük adım (BAN RİSKİ - maksimum hız!)
BATCH_SIZE = 25
SAVE_INTERVAL = 30  # Her 30 saniyede bir kaydet (kesilme durumunda)

# Çok sayıda gerçekçi User-Agent listesi
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0",
    "Mozilla/5.0 (X11; CrOS x86_64 15359.58.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.134 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
]

# İlk 8 kategori ORİJİNAL sırada (deterministik sıralama için)
# Ek kategoriler sona eklendi (daha fazla veri için)
CATEGORIES = [
    "cs.AI", "cs.LG", "cs.CL", "cs.CV", "cs.SE", "cs.PL", 
    "stat.ML", "math.OC",  # ORİJİNAL 8 kategori (aynı sırada)
    # Ek kategoriler (eğer ilk 8'den yeterli veri çekilemezse)
    "cs.NE", "cs.IR", "cs.CY", "cs.DS", "cs.CR", "cs.CC", 
    "cs.GT", "cs.RO", "cs.SI", "cs.HC", "math.ST", "stat.TH", 
    "eess.AS", "eess.IV", "cs.SY", "cs.ET", "cs.AR", "cs.DB",
    "cs.DC", "cs.DM", "cs.FL", "cs.GL", "cs.GR", "cs.HO",
    "cs.IT", "cs.LO", "cs.MA", "cs.MM", "cs.MS", "cs.NA",
    "cs.NI", "cs.OH", "cs.OS", "cs.SD", "math.PR", "math.SP",
    "math.CO", "math.AP", "math.CA", "math.AT", "math.DG", "math.FA",
    # Daha fazla kategori (200 veri için - duplicate'ler kaldırıldı)
    "cs.SC", "cs.TC", "math.AG", "math.CT", "math.GN", "math.GR",
    "math.GT", "math.HO", "math.KT", "math.MG", "math.MP", "math.NT",
    "math.QA", "math.RA", "math.RT", "math.SG",     "physics.ao-ph",
    "physics.app-ph", "physics.bio-ph", "physics.class-ph", "physics.comp-ph",
    "physics.data-an", "physics.flu-dyn", "physics.gen-ph", "physics.ins-det",
    # Daha fazla kategori (son 200 veri için)
    "physics.optics", "physics.soc-ph", "physics.space-ph", "q-bio.BM",
    "q-bio.CB", "q-bio.GN", "q-bio.MN", "q-bio.NC", "q-bio.OT", "q-bio.PE",
    "q-bio.QM", "q-bio.SC", "q-bio.TO", "q-fin.CP", "q-fin.GN", "q-fin.MF",
    "q-fin.PM", "q-fin.PR", "q-fin.RM", "q-fin.ST", "q-fin.TR", "stat.AP",
    "stat.CO", "stat.ME", "stat.ML", "stat.OT", "eess.SP", "eess.SY",
    "eess.IV", "eess.AS", "astro-ph.CO", "astro-ph.EP", "astro-ph.GA",
    "astro-ph.HE", "astro-ph.IM", "astro-ph.SR", "cond-mat.dis-nn",
    "cond-mat.mes-hall", "cond-mat.mtrl-sci", "cond-mat.other",
    "cond-mat.quant-gas", "cond-mat.soft", "cond-mat.stat-mech",
    "cond-mat.str-el", "cond-mat.supr-con", "gr-qc", "hep-ex", "hep-lat",
    "hep-ph", "hep-th", "math-ph", "nlin.AO", "nlin.CD", "nlin.CG",
    "nlin.PS", "nlin.SI", "nucl-ex", "nucl-th"
]


def get_random_headers(referer: str = None) -> Dict[str, str]:
    """Rastgele User-Agent ve gerçekçi header'lar döndürür."""
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": random.choice([
            "en-US,en;q=0.9",
            "en-GB,en;q=0.9",
            "en-US,en;q=0.9,tr;q=0.8",
            "en-US,en;q=0.9,de;q=0.8",
        ]),
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin" if referer else "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
    }
    if referer:
        headers["Referer"] = referer
    return headers


def wait(delay_range: tuple[float, float]) -> None:
    """Rastgele bir süre bekler."""
    time.sleep(random.uniform(*delay_range))


def looks_like_recaptcha(text: str) -> bool:
    """Metinde reCAPTCHA olup olmadığını kontrol eder."""
    if not text or len(text) < 100:
        return False  # Çok kısa ise reCAPTCHA değil
    text_lower = text.lower()
    # Daha spesifik kontrol - sadece gerçek reCAPTCHA sayfalarını yakala
    captcha_indicators = [
        "recaptcha",
        "i'm not a robot",
        "verify you're human",
        "cloudflare",
        "challenge-platform",
        "cf-challenge",
        "checking your browser",
    ]
    return any(indicator in text_lower for indicator in captcha_indicators)


def fetch_html(session: requests.Session, url: str, retry_count: int = 0) -> Optional[str]:
    """URL'den HTML içeriğini çeker. reCAPTCHA koruması ile."""
    max_retries = 5  # Artırıldı: 3 -> 5
    
    try:
        # Her istekte yeni header'lar kullan (referer ile)
        referer = f"{BASE_URL}/list/" if "/list/" in url else BASE_URL
        headers = get_random_headers(referer=referer)
        # Timeout artırıldı: 30 -> 60 saniye (yavaş bağlantılar için)
        resp = session.get(url, headers=headers, timeout=60, allow_redirects=True, verify=True)
        resp.raise_for_status()
        
        # reCAPTCHA kontrolü
        if looks_like_recaptcha(resp.text):
            if retry_count < max_retries:
                wait_time = (15 + retry_count * 10, 25 + retry_count * 10)
                print(f"⚠ reCAPTCHA yakalandı (deneme {retry_count + 1}/{max_retries}), {wait_time[0]:.0f}-{wait_time[1]:.0f} saniye bekleniyor...")
                wait(wait_time)
                # Session cookies'lerini temizle
                session.cookies.clear()
                session.headers.clear()
                session.headers.update(get_random_headers())
                return fetch_html(session, url, retry_count + 1)
            else:
                print("❌ reCAPTCHA aşılamadı, istek atlandı.")
                wait((60, 120))  # Çok uzun bekleme
                return None
        
        # Başarılı istek
        return resp.text
        
    except requests.exceptions.Timeout:
        if retry_count < max_retries:
            wait_time = (10 + retry_count * 5, 20 + retry_count * 5)
            print(f"⚠ Timeout hatası (deneme {retry_count + 1}/{max_retries}), {wait_time[0]:.0f}-{wait_time[1]:.0f} saniye bekleniyor...")
            wait(wait_time)
            # Session'ı yenile
            session.cookies.clear()
            session.headers.clear()
            session.headers.update(get_random_headers())
            return fetch_html(session, url, retry_count + 1)
        else:
            print(f"❌ Timeout hatası aşılamadı: {url}")
            wait((10, 20))
            return None
            
    except requests.exceptions.ConnectionError as exc:
        if retry_count < max_retries:
            wait_time = (15 + retry_count * 10, 30 + retry_count * 10)
            print(f"⚠ Bağlantı hatası (deneme {retry_count + 1}/{max_retries}): {type(exc).__name__}. {wait_time[0]:.0f}-{wait_time[1]:.0f} saniye bekleniyor...")
            print(f"   Hata detayı: {str(exc)[:100]}")
            wait(wait_time)
            # Session'ı tamamen yenile
            session.cookies.clear()
            session.headers.clear()
            session.headers.update(get_random_headers())
            return fetch_html(session, url, retry_count + 1)
        else:
            print(f"❌ Bağlantı hatası aşılamadı: {type(exc).__name__}")
            print(f"   Lütfen internet bağlantınızı kontrol edin veya birkaç dakika bekleyip tekrar deneyin.")
            wait((30, 60))
            return None
            
    except requests.exceptions.HTTPError as exc:
        # HTTP status code hataları (400, 403, 404, 500, vb.)
        status_code = exc.response.status_code if hasattr(exc, 'response') else 'Unknown'
        
        # HTTP 400 için özel işleme
        if status_code == 400:
            if retry_count < max_retries:
                wait_time = (30 + retry_count * 15, 60 + retry_count * 15)  # Daha uzun bekleme
                print(f"⚠ HTTP 400 Bad Request (deneme {retry_count + 1}/{max_retries}), {wait_time[0]:.0f}-{wait_time[1]:.0f} saniye bekleniyor...")
                print(f"   URL: {url[:80]}...")
                wait(wait_time)
                # Session'ı tamamen yeniden oluştur
                session.close()
                session = requests.Session()
                # Referer header ekle
                referer = f"{BASE_URL}/list/" if "/list/" in url else BASE_URL
                session.headers.update(get_random_headers(referer=referer))
                # URL'yi temizle ve tekrar dene
                return fetch_html(session, url, retry_count + 1)
            else:
                print(f"❌ HTTP 400 hatası aşılamadı: {url}")
                print(f"   Bu kategoriyi atlayıp devam ediliyor...")
                wait((30, 60))
                return None
        elif retry_count < max_retries:
            wait_time = (10 + retry_count * 5, 20 + retry_count * 5)
            print(f"⚠ HTTP {status_code} hatası (deneme {retry_count + 1}/{max_retries}), {wait_time[0]:.0f}-{wait_time[1]:.0f} saniye bekleniyor...")
            wait(wait_time)
            session.cookies.clear()
            session.headers.clear()
            session.headers.update(get_random_headers())
            return fetch_html(session, url, retry_count + 1)
        else:
            print(f"❌ HTTP {status_code} hatası aşılamadı: {url}")
            wait((10, 20))
            return None
            
    except requests.RequestException as exc:
        # Diğer tüm HTTP hataları
        if retry_count < max_retries:
            wait_time = (10 + retry_count * 5, 20 + retry_count * 5)
            error_type = type(exc).__name__
            print(f"⚠ HTTP hatası ({error_type}, deneme {retry_count + 1}/{max_retries}): {str(exc)[:100]}")
            print(f"   {wait_time[0]:.0f}-{wait_time[1]:.0f} saniye bekleniyor...")
            wait(wait_time)
            session.cookies.clear()
            session.headers.clear()
            session.headers.update(get_random_headers())
            return fetch_html(session, url, retry_count + 1)
        else:
            error_type = type(exc).__name__
            print(f"❌ HTTP hatası aşılamadı ({error_type}): {str(exc)[:100]}")
            wait((10, 20))
            return None


def parse_list(html: str) -> List[str]:
    """Liste sayfasından sadece makale ID'lerini çıkarır."""
    soup = BeautifulSoup(html, "html.parser")
    ids = []
    for link in soup.find_all("a", href=True):
        match = ABS_RE.search(link["href"])
        if match:
            pid = match.group(1)
            if pid not in ids:  # Duplicate kontrolü
                ids.append(pid)
    return ids


def parse_list_with_abstracts(html: str) -> List[Dict[str, str]]:
    """Liste sayfasından makale ID'lerini VE abstract'ları birlikte çıkarır.
    Bu çok daha hızlı çünkü her makale için ayrı sayfa açmamıza gerek kalmaz."""
    soup = BeautifulSoup(html, "html.parser")
    records = []
    
    # ArXiv list sayfalarında her makale bir <dl> elementi içinde
    # Önce class="list-identifier" olanları dene, sonra tüm <dl> elementlerini dene
    dl_elements = soup.find_all("dl", class_="list-identifier")
    if not dl_elements:
        dl_elements = soup.find_all("dl")  # Fallback: tüm dl elementleri
    
    for dl in dl_elements:
        # ID'yi bul - genellikle <a> tag'inde
        id_link = dl.find("a", href=ABS_RE)
        if not id_link:
            # Alternatif: dt içinde arayalım
            dt = dl.find("dt")
            if dt:
                id_link = dt.find("a", href=ABS_RE)
        
        if not id_link:
            continue
            
        match = ABS_RE.search(id_link["href"])
        if not match:
            continue
            
        paper_id = match.group(1)
        url = f"{BASE_URL}/abs/{paper_id}"
        
        # Abstract'i bul - liste sayfasında <p class="mathjax"> içinde olabilir
        abstract_text = None
        
        # Önce <p class="mathjax"> içinde ara
        mathjax_p = dl.find("p", class_="mathjax")
        if mathjax_p:
            abstract_text = mathjax_p.get_text(separator=" ", strip=True)
        
        # Değilse, tüm <dd> elementlerinde ara
        if not abstract_text:
            for dd in dl.find_all("dd"):
                text = dd.get_text(separator=" ", strip=True)
                # "Abstract:" kelimesini içeren text'i bul
                if "abstract" in text.lower() and len(text) > 50:
                    abstract_text = text
                    break
        
        # Hala bulamadıysak, tüm dl içeriğinde ara
        if not abstract_text:
            all_text = dl.get_text(separator=" ", strip=True)
            # "Abstract:" kelimesinden sonrasını al - daha geniş pattern
            abstract_match = re.search(r"abstract:?\s*(.+?)(?:Subject Classification|Categories:|MSC Class:|arXiv:|$)", 
                                     all_text, re.IGNORECASE | re.DOTALL)
            if abstract_match:
                abstract_text = abstract_match.group(1).strip()
        
        if not abstract_text or len(abstract_text) < 30:
            continue
        
        # "Abstract:" kelimesini ve fazladan boşlukları temizle
        abstract_text = ABSTRACT_CLEANUP_RE.sub("", abstract_text).strip()
        abstract_text = re.sub(r"\s+", " ", abstract_text)  # Çoklu boşlukları tek boşluğa çevir
        
        if len(abstract_text) < 30:
            continue
        
        records.append({
            "paper_id": paper_id,
            "abstract_text": abstract_text,
            "source_url": url,
        })
    
    return records


def fetch_abstract(session: requests.Session, paper_id: str) -> Optional[Dict[str, str]]:
    """Bir makalenin özetini çeker."""
    url = f"{BASE_URL}/abs/{paper_id}"
    html = fetch_html(session, url)
    
    if not html or len(html) < 50:
        return None
    
    if looks_like_recaptcha(html):
        return None
    
    try:
        soup = BeautifulSoup(html, "html.parser")
        
        # Abstract'i bul
        abstract_div = soup.find("blockquote", class_="abstract")
        if not abstract_div:
            # Alternatif yöntem: "Abstract:" kelimesinden sonrasını al
            abstract_text = ""
            for elem in soup.find_all(["p", "div"]):
                text = elem.get_text()
                if "abstract" in text.lower() and len(text) > 50:
                    # "Abstract:" kelimesini çıkar
                    abstract_text = re.sub(r"^.*?abstract:?\s*", "", text, flags=re.IGNORECASE).strip()
                    break
            
            if not abstract_text:
                return None
        else:
            abstract_text = abstract_div.get_text(separator=" ", strip=True)
            # "Abstract:" kelimesini çıkar
            abstract_text = re.sub(r"^.*?abstract:?\s*", "", abstract_text, flags=re.IGNORECASE).strip()
        
        if len(abstract_text) < 50:
            return None
        
        return {
            "abstract_text": abstract_text,
            "source_url": url,
            "license_info": DEFAULT_LICENSE,
            "label": "Human",
        }
    except Exception as exc:
        print(f"Özet parse hatası ({paper_id}): {exc}")
        return None


def page_records_from_list(records_from_page: List[Dict[str, str]], existing: Set[str]) -> Iterable[Dict[str, str]]:
    """Liste sayfasından parse edilen kayıtları işler (çok daha hızlı)."""
    for idx, rec in enumerate(records_from_page):
        pid = rec["paper_id"]
        if pid in existing:
            continue
        
        # Liste sayfasından zaten abstract'ı aldık, sadece formatla
        existing.add(pid)
        yield {
            "abstract_text": rec["abstract_text"],
            "source_url": rec["source_url"],
            "license_info": DEFAULT_LICENSE,
            "label": "Human",
        }
        
        # Her 5 kayıtta bir bekleme (bot tespitini önlemek için)
        if (idx + 1) % 5 == 0:
            wait((0.5, 1.0))


def iter_category_historical(session: requests.Session, category: str, existing: Set[str], remaining_needed: int) -> Iterable[Dict[str, str]]:
    """Tarihsel arama: En eski yıllardan başlayarak geriye doğru gider (son 30 veri için)."""
    from datetime import datetime
    
    # En eski ArXiv makaleleri 1991'den başlıyor
    current_year = datetime.now().year
    start_year = 1991
    
    print(f"  📅 TARİHSEL ARAMA: {category} için {start_year}-{current_year} arası taranıyor (en eskiden başlayarak)...")
    
    found_count = 0
    
    # Yılları geriye doğru tara (en eskiden başla)
    for year in range(start_year, current_year + 1):
        if found_count >= remaining_needed:
            break
            
        # Yıllık liste URL'i
        url = f"{BASE_URL}/list/{category}/{year}"
        
        wait((0.1, 0.2))  # Minimum bekleme
        
        html = fetch_html(session, url)
        if not html:
            continue
        
        # Liste sayfasından direkt abstract'ları parse et
        records_from_page = parse_list_with_abstracts(html)
        
        if not records_from_page:
            # Fallback: ID'leri al ve ayrı sayfalardan çek
            ids = parse_list(html)
            for pid in ids:
                if pid in existing:
                    continue
                record = fetch_abstract(session, pid)
                wait((0.1, 0.2))
                if record:
                    existing.add(pid)
                    yield record
                    found_count += 1
                    if found_count >= remaining_needed:
                        print(f"  ✅ Tarihsel arama tamamlandı: {found_count} yeni kayıt bulundu")
                        return
            continue
        
        # Parse edilen kayıtları işle
        for record in page_records_from_list(records_from_page, existing):
            yield record
            found_count += 1
            if found_count >= remaining_needed:
                print(f"  ✅ Tarihsel arama tamamlandı: {found_count} yeni kayıt bulundu")
                return
        
        # Aylık listeleri de dene (daha detaylı) - sadece ilk birkaç yıl için
        if year <= 2000:  # İlk 10 yıl için aylık tarama
            for month in range(1, 13):
                if found_count >= remaining_needed:
                    break
                month_str = f"{year}{month:02d}"
                url_month = f"{BASE_URL}/list/{category}/{month_str}"
                
                wait((0.1, 0.2))
                html_month = fetch_html(session, url_month)
                if not html_month:
                    continue
                
                records_month = parse_list_with_abstracts(html_month)
                if records_month:
                    for record in page_records_from_list(records_month, existing):
                        yield record
                        found_count += 1
                        if found_count >= remaining_needed:
                            print(f"  ✅ Tarihsel arama tamamlandı: {found_count} yeni kayıt bulundu")
                            return
    
    print(f"  📅 Tarihsel arama tamamlandı: {found_count} yeni kayıt bulundu")


def iter_category(session: requests.Session, category: str, existing: Set[str], remaining_needed: int = None) -> Iterable[Dict[str, str]]:
    """Bir kategorideki tüm makaleleri iterasyonla döndürür (optimize edilmiş - liste sayfalarından direkt parse)."""
    empty_count = 0
    total_new = 0
    consecutive_failures = 0  # Ardışık başarısızlık sayacı
    http_400_count = 0  # HTTP 400 hatası sayacı
    
    # Son 40 veri için 1 DAKİKALIK HIZLI ALGORİTMA (tarihsel arama atlanıyor - çok yavaş!)
    if remaining_needed and remaining_needed <= 40:
        page_limit = 1  # 1 boş sayfa sonra geç (maksimum hız!)
        skip_step = 1  # Her makale (EXTREME!)
        list_delay = (0.05, 0.1)  # MINIMUM bekleme (BAN RİSKİ - 1 dakika hedefi!)
        print(f"  ⚡⚡⚡ SON {remaining_needed} VERİ İÇİN 1 DAKİKALIK HIZLI MOD! skip_step={skip_step}, delay={list_delay}")
    # Son 50 veri için ULTRA agresif ayarlar (maksimum hız!)
    elif remaining_needed and remaining_needed <= 50:
        page_limit = 1  # 1 boş sayfa sonra geç (maksimum hız!)
        skip_step = ULTRA_FAST_SKIP_STEP  # Ultra küçük adımlar (5)
        list_delay = (0.2, 0.4)  # Çok minimum bekleme (maksimum hız!)
        print(f"  🔥🔥🔥 SON {remaining_needed} VERİ İÇİN ULTRA HIZLI MOD! (skip_step={skip_step}, delay={list_delay})")
    # Son 100 veri için çok agresif ayarlar
    elif remaining_needed and remaining_needed <= 100:
        page_limit = 2  # Çok hızlı kategori geçişi
        skip_step = VERY_FAST_SKIP_STEP  # Çok küçük adımlar
        list_delay = (0.5, 1.0)  # Daha kısa bekleme
        print(f"  🚀 SON {remaining_needed} VERİ İÇİN HIZLI MOD AKTİF! (skip_step={skip_step}, delay={list_delay})")
    elif remaining_needed and remaining_needed < 500:
        page_limit = 3  # Hızlı kategori geçişi
        skip_step = FAST_SKIP_STEP  # Küçük adımlar
        list_delay = (1.0, 2.0)  # Orta bekleme
        print(f"  ⚡ Az veri kaldı ({remaining_needed}), hızlı mod (skip_step={skip_step})...")
    else:
        page_limit = EMPTY_PAGE_LIMIT
        skip_step = SKIP_STEP
        list_delay = LIST_DELAY
    
    # Yeni strateji: 1 DAKİKALIK HIZLI ALGORİTMA - Sadece ilk sayfaları tara (çok hızlı!)
    if remaining_needed and remaining_needed <= 40:
        # 1 DAKİKALIK MOD: Sadece her kategorinin ilk 20 sayfasını tara (skip=0, 25, 50, 75, ... 475)
        # Bu çok hızlı çünkü sadece en yeni makaleleri tarıyor
        skip_ranges = [
            range(0, 500, 25),  # İlk 20 sayfa (skip=0, 25, 50, 75, ..., 475) - ÇOK HIZLI!
        ]
        print(f"  ⚡⚡⚡ SON {remaining_needed} VERİ: 1 DAKİKALIK HIZLI MOD! Sadece ilk 20 sayfa taranıyor (skip=0-475, step=25)...")
    # Son 50 veri için ULTRA geniş ve detaylı tarama (maksimum kapsama!)
    elif remaining_needed and remaining_needed <= 50:
        # Son 50 veri için: ULTRA geniş aralık, ultra küçük adımlarla, maksimum kapsama
        skip_ranges = [
            range(0, 5000, skip_step),  # En yeni makaleler (çok geniş)
            range(5000, 10000, skip_step),  # Orta-eskiler
            range(10000, 15000, skip_step),  # Daha eskiler
            range(15000 - skip_step, 0, -skip_step),  # Geriye doğru (en eski)
            # Ek olarak: çok fazla rastgele aralık (maksimum kapsama)
            range(0, 1000, skip_step),
            range(100, 1500, skip_step),
            range(200, 2000, skip_step),
            range(500, 2500, skip_step),
            range(1000, 3500, skip_step),
            range(2000, 4500, skip_step),
            range(3000, 5500, skip_step),
            range(4000, 6500, skip_step),
        ]
        print(f"  🔥 SON {remaining_needed} VERİ: ULTRA geniş aralıkta ULTRA detaylı tarama (maksimum hız!)...")
    # Son 100 veri için çok daha geniş ve detaylı tarama
    elif remaining_needed and remaining_needed <= 100:
        # Son 100 veri için: çok geniş aralık, küçük adımlarla
        skip_ranges = [
            range(0, 3000, skip_step),  # En yeni makaleler (geniş aralık)
            range(3000, 6000, skip_step),  # Orta-eskiler
            range(6000, 10000, skip_step),  # Daha eskiler
            range(10000 - skip_step, 0, -skip_step),  # Geriye doğru (en eski)
            # Ek olarak: rastgele aralıklar
            range(100, 2000, skip_step),
            range(500, 2500, skip_step),
            range(1000, 3500, skip_step),
        ]
        print(f"  📜 SON {remaining_needed} VERİ: Çok geniş aralıkta detaylı tarama...")
    elif remaining_needed and remaining_needed < 500:
        # Az veri kaldığında: farklı aralıkları dene
        skip_ranges = [
            range(0, 2000, skip_step),  # En yeni makaleler
            range(2000, 4000, skip_step),  # Orta-eskiler
            range(4000, MAX_SKIP, skip_step),  # Daha eskiler
            range(MAX_SKIP - skip_step, 0, -skip_step),  # Geriye doğru (en eski)
        ]
        print(f"  📜 Az veri kaldı ({remaining_needed}), farklı aralıklarda taranıyor...")
    else:
        # Normal: en yeni makalelerden başla
        skip_ranges = [range(0, MAX_SKIP, skip_step)]
    
    # Tüm skip aralıklarını dene
    for skip_range in skip_ranges:
        if total_new >= (remaining_needed or 1000):  # Yeterli veri bulunduysa dur
            break
    
        for skip in skip_range:
            # HTTP 400 hatası çok fazlaysa bu kategoriyi atla
            if http_400_count >= 5:
                print(f"⚠ {category}: Çok fazla HTTP 400 hatası ({http_400_count}), kategori atlanıyor...")
                return
            
            # URL formatını düzelt - skip parametresini doğru ekle
            if skip > 0:
                url = f"{BASE_URL}/list/{category}/recent?skip={skip}"
            else:
                url = f"{BASE_URL}/list/{category}/recent"
            
            # İstek öncesi bekleme (reCAPTCHA'dan kaçınmak için)
            # Son 40 veri için MINIMUM bekleme (1 DAKİKALIK MOD - BAN RİSKİ!)
            if remaining_needed and remaining_needed <= 40:
                wait(list_delay)  # EXTREME kısa bekleme (0.05-0.1 saniye - 1 DAKİKALIK MOD!)
            # Son 50 veri için minimum bekleme (maksimum hız!)
            elif remaining_needed and remaining_needed <= 50:
                wait(list_delay)  # Ultra kısa bekleme (0.2-0.4 saniye)
            elif remaining_needed and remaining_needed <= 100:
                wait(list_delay)  # Kısa bekleme (0.5-1.0 saniye)
            else:
                wait(LIST_DELAY)
            
            html = fetch_html(session, url)
            
            # HTTP 400 hatası kontrolü
            if html is None:
                # fetch_html içinde HTTP 400 hatası olup olmadığını kontrol et
                # (fetch_html None döndürüyorsa ve HTTP 400 ise sayacı artır)
                http_400_count += 1
            else:
                http_400_count = 0  # Başarılı istek sonrası reset
            
            # Eğer başarısız ise, daha uzun bekle
            if not html:
                consecutive_failures += 1
                if consecutive_failures >= 3:
                    wait_time = (30, 60)  # Daha kısa bekleme
                    print(f"⚠ Ardışık {consecutive_failures} başarısız istek! {wait_time[0]:.0f}-{wait_time[1]:.0f} saniye bekleniyor...")
                    wait(wait_time)
                    consecutive_failures = 0
                    # Session cookies'lerini temizle
                    session.cookies.clear()
                    session.headers.clear()
                    session.headers.update(get_random_headers())
            else:
                consecutive_failures = 0  # Başarılı istek sonrası reset
            
            if not html:
                empty_count += 1
                if empty_count >= page_limit:
                    print(f"⚠ {category} kategorisinde boş sayfa limitine ulaşıldı ({empty_count}/{page_limit}).")
                    break
                continue
            
            # Önce ID'leri parse et
            ids = parse_list(html)
            if not ids:
                empty_count += 1
                if empty_count >= page_limit:
                    print(f"⚠ {category} kategorisinde ID bulunamadı (skip={skip}, limit: {page_limit}).")
                    break
                continue
            
            # Liste sayfasından direkt abstract'ları parse et (çok daha hızlı!)
            records_from_page = parse_list_with_abstracts(html)
            
            # Eğer liste sayfasından parse edilemezse, her makale için ayrı sayfa aç (fallback)
            if not records_from_page:
                print(f"  ⚠ Liste sayfasından parse edilemedi ({len(ids)} ID bulundu), ayrı sayfalardan çekiliyor...")
                for pid in ids:
                    if pid in existing:
                        continue
                    record = fetch_abstract(session, pid)
                    wait(ABS_DELAY)
                    if record:
                        existing.add(pid)
                        total_new += 1
                        yield record
                        if total_new % 10 == 0:
                            print(f"  📄 {total_new} yeni kayıt eklendi (fallback method)")
                continue
            
            empty_count = 0
            parsed_count = len(records_from_page)
            valid_count = 0
            
            for record in page_records_from_list(records_from_page, existing):
                valid_count += 1
                total_new += 1
                yield record
            
            if parsed_count > 0:
                skipped = parsed_count - valid_count
                # Skip step'i doğru hesapla
                if remaining_needed and remaining_needed <= 40:
                    current_skip_step = 25  # 1 dakikalık mod için 25
                elif remaining_needed and remaining_needed <= 50:
                    current_skip_step = ULTRA_FAST_SKIP_STEP
                elif remaining_needed and remaining_needed <= 100:
                    current_skip_step = VERY_FAST_SKIP_STEP
                elif remaining_needed and remaining_needed < 500:
                    current_skip_step = FAST_SKIP_STEP
                else:
                    current_skip_step = SKIP_STEP
                page_num = skip // current_skip_step + 1
                if valid_count > 0 or skipped > 0:
                    print(f"  📄 Sayfa {page_num} (skip={skip}): {valid_count}/{parsed_count} yeni kayıt (atlanan: {skipped})")
            
            # Eğer az veri kaldıysa ve yeni kayıt yoksa, daha hızlı geç
            if remaining_needed and remaining_needed <= 40:
                # Son 40 veri için: HEMEN kategori değiştir (1 DAKİKALIK MOD - BAN RİSKİ!)
                if valid_count == 0:
                    empty_count += 1
                    if empty_count >= 1:  # HEMEN kategori değiştir (1 boş sayfa yeter!)
                        print(f"  ⚡ {category}: Veri bulunamadı, HEMEN sonraki kategoriye geçiliyor (1 DAKİKALIK MOD!)...")
                        break
                else:
                    empty_count = 0  # Veri bulunduysa reset
            elif remaining_needed and remaining_needed <= 50:
                # Son 50 veri için: 1 boş sayfa sonra aralığı değiştir (ULTRA hızlı!)
                if valid_count == 0:
                    empty_count += 1
                    if empty_count >= 1:  # ULTRA hızlı geçiş (1 boş sayfa yeter!)
                        print(f"  ⚡ {category}: Bu aralıkta veri bulunamadı, sonraki aralığa geçiliyor (ULTRA HIZLI!)...")
                        break
                else:
                    empty_count = 0  # Veri bulunduysa reset
            elif remaining_needed and remaining_needed <= 100:
                # Son 100 veri için: 1-2 boş sayfa sonra aralığı değiştir
                if valid_count == 0:
                    empty_count += 1
                    if empty_count >= 2:  # Çok hızlı geçiş
                        print(f"  ⚠ {category}: Bu aralıkta veri bulunamadı, sonraki aralığa geçiliyor...")
                        break
                else:
                    empty_count = 0  # Veri bulunduysa reset
            elif remaining_needed and remaining_needed < 500:
                # Eğer 2 sayfa üst üste veri yoksa, bu aralığı atla
                if valid_count == 0:
                    empty_count += 1
                    if empty_count >= 2:  # Hızlı geçiş
                        print(f"  ⚠ {category}: Bu aralıkta veri bulunamadı, sonraki aralığa geçiliyor...")
                        break
                else:
                    empty_count = 0  # Veri bulunduysa reset
            elif valid_count == 0 and skip > 1000:
                print(f"  ⚠ {category}: Son sayfalarda yeni kayıt bulunamadı, sonraki kategoriye geçiliyor...")
                break


def load_existing_ids(path: str) -> Set[str]:
    """Mevcut CSV dosyasından ID'leri yükler."""
    if not os.path.exists(path):
        return set()
    
    ids = set()
    try:
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                url = row.get("source_url", "")
                match = ABS_RE.search(url)
                if match:
                    ids.add(match.group(1))
    except Exception as exc:
        print(f"⚠ Mevcut dosya okuma hatası: {exc}")
    
    return ids


def write_csv(path: str, rows: List[Dict[str, str]]) -> None:
    """Kayıtları CSV dosyasına yazar."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    exists = os.path.exists(path)
    mode = "a" if exists else "w"
    
    with open(path, mode, newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, ["abstract_text", "source_url", "license_info", "label"])
        if not exists:
            writer.writeheader()
        writer.writerows(rows)


def record_stream(session: requests.Session, existing: Set[str], target: int):
    """Tüm kategorilerden kayıt akışı sağlar (deterministik sıralama)."""
    total = len(existing)
    remaining = target - total
    print(f"📊 Mevcut kayıt sayısı: {total}, Hedef: {target}, Eksik: {remaining}")
    
    # Son 40 veri için 1 DAKİKALIK MOD: Tüm kategorileri çok hızlıca geç
    if remaining <= 40:
        print(f"⚡⚡⚡ 1 DAKİKALIK HIZLI MOD AKTİF! {remaining} veri için tüm kategoriler hızlıca taranacak...")
    
    # Kategorileri deterministik sırada işle (her zaman aynı sıra)
    for category in CATEGORIES:
        if total >= target:
            break
        remaining_needed = target - total
        if remaining_needed <= 40:
            print(f" ⚡ {category} kategorisi HIZLI taranıyor... (Kalan: {remaining_needed} kayıt)")
        else:
            print(f" {category} kategorisi taranıyor... (Kalan: {remaining_needed} kayıt)")
        category_count = 0
        for record in iter_category(session, category, existing, remaining_needed):
            total += 1
            category_count += 1
            yield record, total
            
            if total >= target:
                print(f"✅ Hedef sayıya ulaşıldı! {category} kategorisinden {category_count} kayıt alındı.")
                return
        
        if category_count > 0:
            print(f"✓ {category} kategorisi tamamlandı. {category_count} yeni kayıt eklendi.")
        elif remaining_needed <= 40:
            # 1 dakikalık modda boş kategorileri hızlıca atla
            pass
    
    if total < target:
        print(f"⚠ Hedefe ulaşılamadı: {total}/{target} kayıt toplandı.")
        print(f"💡 {target - total} kayıt eksik. Tekrar çalıştırdığınızda kaldığı yerden devam edecek.")
        # Hata verme, mevcut veriyi kabul et


def create_new_session() -> requests.Session:
    """Yeni bir session oluşturur (reCAPTCHA'dan kaçınmak için)."""
    session = requests.Session()
    session.headers.update(get_random_headers())
    return session


def scrape(output: str, target: int) -> None:
    """Ana scraping fonksiyonu."""
    session = create_new_session()
    
    existing = load_existing_ids(output)
    current_total = len(existing)
    
    print(f"📊 Mevcut dosyada {current_total} benzersiz ID bulundu")
    
    if current_total >= target:
        print(f"✅ Zaten {current_total} kayıt mevcut. Hedef: {target}")
        return
    
    print(f"🚀 Scraping başlatılıyor... Mevcut: {current_total}, Hedef: {target}")
    remaining = target - current_total
    if remaining > 0:
        # Zaman tahmini (her kayıt için ortalama 2-3 saniye)
        estimated_minutes = (remaining * 2.5) / 60
        print(f"📝 {remaining} yeni kayıt çekilecek.")
        print(f"  Tahmini süre: ~{estimated_minutes:.1f} dakika ({estimated_minutes/60:.1f} saat)")
    
    buffer: List[Dict[str, str]] = []
    last_save = time.time()

    try:
        for record, new_total in record_stream(session, existing, target):
            current_total = new_total
            buffer.append(record)
            
            # Her BATCH_SIZE kayıtta veya SAVE_INTERVAL saniyede bir kaydet (kesilme durumunda koruma)
            if len(buffer) >= BATCH_SIZE or (time.time() - last_save) > SAVE_INTERVAL:
                write_csv(output, buffer)
                buffer.clear()
                last_save = time.time()
                print(f"💾 {current_total}/{target} kayıt kaydedildi.")
            
            if current_total >= target:
                break
            
            # Her 100 kayıtta bir session'ı yenile (reCAPTCHA'dan kaçınmak için)
            if current_total % 100 == 0 and current_total > 0:
                print("  🔄 Session yenileniyor (reCAPTCHA koruması)...")
                session.close()
                session = create_new_session()
                wait((5, 10))
                
    except KeyboardInterrupt:
        print("\n⚠ Kullanıcı tarafından durduruldu.")
    except Exception as exc:
        print(f"\n❌ Hata oluştu: {exc}")
        import traceback
        traceback.print_exc()
    finally:
        session.close()
        if buffer:
            write_csv(output, buffer)
            print(f"💾 Son kayıtlar kaydedildi. Toplam: {current_total}/{target}")

    print(f"✅ İşlem tamamlandı. Toplam {min(current_total, target)} özet hazır.")


def main() -> None:
    """Ana fonksiyon."""
    parser = argparse.ArgumentParser(description="ArXiv scraper - 3000 kayıt hedefler")
    parser.add_argument("--output", default="data/raw/human_abstracts.csv", help="Çıktı CSV dosyası")
    parser.add_argument("--target", type=int, default=3000, help="Hedef kayıt sayısı")
    args = parser.parse_args()
    scrape(args.output, args.target)


if __name__ == "__main__":
    if os.environ.get("HUMANORAI_ALLOW_SCRAPE") != "1":
        print("Scraper devre dışı. Çalıştırmak için HUMANORAI_ALLOW_SCRAPE=1 ayarla.")
        sys.exit(0)
    main()
