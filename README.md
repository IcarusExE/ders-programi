# Ders Pusulası

Ankara Üniversitesi Nallıhan Meslek Yüksekokulu Bilgisayar Programcılığı 1. sınıf için hazırlanmış, GitHub Pages uyumlu ders programı sitesi.

## Ders programını düzenleme

Tüm dersler `schedule.json` dosyasındadır. `courses` listesindeki örnekleri kendi gerçek programınla değiştir:

```json
{
  "day": 1,
  "start": "09:00",
  "end": "10:40",
  "code": "BPR101",
  "name": "Programlama Temelleri",
  "room": "Bilgisayar Laboratuvarı",
  "instructor": "Öğr. Gör. Ad Soyad"
}
```

Gün numaraları: `1` Pazartesi, `2` Salı, `3` Çarşamba, `4` Perşembe, `5` Cuma, `6` Cumartesi, `0` Pazar.

> Not: Depodaki ders adları ve saatleri örnektir; yayınlamadan önce okulun güncel programıyla değiştir.

## GitHub Pages'te yayınlama

1. Bu klasördeki tüm dosyaları GitHub deponun ana dizinine yükle.
2. GitHub'da **Settings → Pages** bölümünü aç.
3. **Build and deployment** altında kaynak olarak **Deploy from a branch** seç.
4. Branch olarak `main`, klasör olarak `/ (root)` seçip **Save** düğmesine bas.
5. Birkaç dakika sonra sayfan `https://KULLANICI-ADIN.github.io/REPO-ADI/` adresinde açılır.

## Bildirimler hakkında

- Bildirim izni kullanıcı tarafından üstteki **Bildirimleri aç** düğmesine basılarak verilmelidir.
- GitHub Pages HTTPS kullandığı için tarayıcı bildirimleri çalışır.
- Bu tamamen statik sürüm, sayfa açıkken yaklaşan dersi kontrol eder ve 15 dakika önce bildirim gönderir.
- Sayfa/tarayıcı tamamen kapalıyken güvenilir bildirim için ayrıca bir push bildirim sunucusu gerekir.

## Yerelde çalıştırma

`fetch()` ile JSON okunduğu için `index.html` dosyasını doğrudan açmak yerine basit bir sunucu kullan:

```bash
python3 -m http.server 8000
```

Ardından `http://localhost:8000` adresini aç.
