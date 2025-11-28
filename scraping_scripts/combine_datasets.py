"""Human ve AI verilerini birleştirir ve model eğitimi için hazırlar."""

import argparse
import csv
import os
import random
from typing import List, Dict

def load_csv(file_path: str) -> List[Dict[str, str]]:
    """CSV dosyasını yükler."""
    if not os.path.exists(file_path):
        print(f"UYARI: {file_path} dosyasi bulunamadi!")
        return []
    
    records = []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                records.append(row)
        print(f"OK: {file_path}: {len(records)} kayit yuklendi")
    except Exception as exc:
        print(f"HATA: {file_path} okuma hatasi: {exc}")
    
    return records


def write_csv(file_path: str, records: List[Dict[str, str]]) -> None:
    """Kayıtları CSV dosyasına yazar."""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    with open(file_path, "w", newline="", encoding="utf-8") as f:
        if not records:
            return
        
        writer = csv.DictWriter(f, fieldnames=records[0].keys())
        writer.writeheader()
        writer.writerows(records)
    
    print(f"OK: {file_path}: {len(records)} kayit kaydedildi")


def combine_datasets(
    human_file: str,
    ai_file: str,
    output_file: str,
    shuffle: bool = True,
    seed: int = 42
) -> None:
    """Human ve AI verilerini birleştirir."""
    
    print("Veri birlestirme baslatiliyor...")
    
    # Verileri yükle
    human_records = load_csv(human_file)
    ai_records = load_csv(ai_file)
    
    if not human_records and not ai_records:
        print("HATA: Hic veri bulunamadi!")
        return
    
    # İstatistikler
    print("\nVeri Istatistikleri:")
    print(f"   Human kayit: {len(human_records)}")
    print(f"   AI kayit: {len(ai_records)}")
    total = len(human_records) + len(ai_records)
    print(f"   Toplam: {total}")
    
    # Etiket dağılımı kontrolü
    human_labels = [r.get("label", "Human") for r in human_records]
    ai_labels = [r.get("label", "AI") for r in ai_records]
    
    print("\nEtiket Dagilimi:")
    print(f"   Human: {human_labels.count('Human')}")
    print(f"   AI: {ai_labels.count('AI')}")
    
    # Birleştir
    combined_records = human_records + ai_records
    
    # Shuffle (karıştır)
    if shuffle:
        print(f"\nVeriler karistiriliyor (seed={seed})...")
        random.seed(seed)
        random.shuffle(combined_records)
    
    # Kaydet
    write_csv(output_file, combined_records)
    
    # Son kontrol
    print("\nBirlestirme tamamlandi!")
    print(f"Cikti dosyasi: {output_file}")
    print(f"Toplam kayit: {len(combined_records)}")
    
    # İlk birkaç kaydı göster
    print("\nIlk 3 kayit ornegi:")
    for i, record in enumerate(combined_records[:3], 1):
        label = record.get("label", "Unknown")
        abstract_preview = record.get("abstract_text", "")[:100] + "..."
        print(f"   {i}. [{label}] {abstract_preview}")


def main() -> None:
    """Ana fonksiyon."""
    parser = argparse.ArgumentParser(description="Human ve AI verilerini birleştirir")
    parser.add_argument(
        "--human", 
        default="data/raw/human_abstracts.csv",
        help="Human abstracts CSV dosyası"
    )
    parser.add_argument(
        "--ai",
        default="data/raw/ai_abstracts.csv",
        help="AI abstracts CSV dosyası"
    )
    parser.add_argument(
        "--output",
        default="data/raw/combined_dataset.csv",
        help="Birleştirilmiş çıktı CSV dosyası"
    )
    parser.add_argument(
        "--no-shuffle",
        action="store_true",
        help="Verileri karıştırma (deterministik sıralama için)"
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed (shuffle için)"
    )
    
    args = parser.parse_args()
    
    combine_datasets(
        args.human,
        args.ai,
        args.output,
        shuffle=not args.no_shuffle,
        seed=args.seed
    )


if __name__ == "__main__":
    main()

