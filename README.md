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
- `push-config.js` içindeki `apiUrl` boş bırakılırsa bildirimler yalnızca sayfa açıkken çalışır.
- Aşağıdaki Cloudflare Worker kurulduğunda ders programı cihaza abone edilir ve site kapalıyken de ders başlamadan 15 dakika önce Web Push bildirimi gönderilir.
- Android ve masaüstü tarayıcılarda HTTPS üzerinden çalışır. iPhone/iPad'de site önce **Ana Ekrana Ekle** ile kurulmalı, sonra kurulan uygulamanın içinden bildirim açılmalıdır.

## Site kapalıyken bildirim kurulumu

Arka plan bildirimleri için `worker/` klasöründe Cloudflare Workers + D1 + Cron tabanlı sunucu hazırdır. Kişisel kullanım, Cloudflare'ın ücretsiz kullanım sınırları içinde kalacak kadar küçüktür. Cloudflare hesabı ve Node.js 20 veya daha yeni bir sürüm gerekir.

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) üzerinden ücretsiz hesap aç.
2. Terminalde Worker klasörüne girip bağımlılıkları kur ve Cloudflare hesabına bağlan:

   ```bash
   cd worker
   npm install
   npx wrangler login
   ```

3. D1 veritabanını oluştur:

   ```bash
   npx wrangler d1 create ders-pusulasi-push
   ```

4. `worker/wrangler.toml` dosyasında D1 bağlantısı ve GitHub Pages adresi hazırdır. Farklı bir D1 veritabanı oluşturulursa yalnızca `database_id` değeri değiştirilmelidir. `ALLOWED_ORIGINS` yalnızca origin içermeli, repo yolu içermemelidir.

   ```toml
   ALLOWED_ORIGINS = "https://icarusexe.github.io"
   SITE_URL = "https://icarusexe.github.io/ders-programi"
   VAPID_SUBJECT = "https://icarusexe.github.io/ders-programi/"
   ```

5. Veritabanı tablolarını oluştur:

   ```bash
   npm run db:migrate:remote
   ```

6. VAPID anahtarlarını bir kez üret:

   ```bash
   npm run vapid
   ```

   Çıktıdaki iki değeri aşağıdaki komutlarla Cloudflare sırrı olarak kaydet. Komut değer istediğinde `=` işaretinden sonraki kısmı yapıştır:

   ```bash
   npx wrangler secret put VAPID_SERVER_PUBLIC_KEY
   npx wrangler secret put VAPID_SERVER_PRIVATE_KEY
   ```

   Bu anahtarları daha sonra değiştirme; değiştirilirse cihazların yeniden bildirim aboneliği açması gerekir. Özel anahtarı GitHub'a yükleme.

7. Worker'ı yayınla:

   ```bash
   npm run deploy
   ```

8. Yayınlama sonunda verilen `https://...workers.dev` adresini kök dizindeki `push-config.js` dosyasına yaz:

   ```js
   window.DERS_PUSULASI_PUSH = {
     apiUrl: "https://ders-pusulasi-push.KULLANICI-ALT-ALANI.workers.dev",
   };
   ```

9. Değişiklikleri GitHub Pages'e gönder. Siteyi açıp bildirim düğmesine bastığında abonelik D1'e kaydedilir. `schedule.json` değiştiğinde site bir sonraki açılışta yeni programı otomatik eşitler.

`.dev.vars`, Worker bağımlılıkları ve Wrangler'ın yerel çalışma dosyaları `.gitignore` içindedir. `worker/wrangler.toml` gizli bilgi içermez ve GitHub tabanlı Worker dağıtımı için depoda tutulur.

## Ödev listesi

**Ödevler** sekmesinden başlık, ders, açıklama, son teslim tarihi ve öncelik bilgisiyle manuel ödev eklenebilir. Ödevler tamamlandı olarak işaretlenebilir, düzenlenebilir, silinebilir ve durumlarına göre filtrelenebilir.

Ödevler tarayıcının yerel depolama alanında (`localStorage`) saklanır. Aynı cihaz ve tarayıcıyla tekrar girildiğinde korunur; tarayıcı verileri temizlenirse veya farklı bir cihazdan girilirse görünmez.

## Sınav sonucu ve final hedefi

**Notlar** sekmesinde her ders için vize notu, vize/final ağırlıkları, geçme notu ve final barajı girilebilir. Final notu henüz belli değilse sistem geçmek için alınması gereken en düşük final notunu; final girildiyse ağırlıklı ortalamayı ve geçme durumunu gösterir. Sonuçlar ve hesaplama geçmişi tarayıcının `localStorage` alanında saklanır.

Hesaplama, kullanıcı tarafından girilen ağırlık ve barajlara dayanır. Bağıl değerlendirme veya derse özel üniversite kuralları varsa kesin sonuç için ilgili dersin ölçme-değerlendirme esasları kontrol edilmelidir.

## Devamsızlık ve istatistikler

**Kontrol Merkezi → Devamsızlık** bölümünde `schedule.json` içindeki dersler otomatik listelenir. Her dersin kullanılan devamsızlık sayısı, sınırı, kalan hakkı ve isteğe bağlı notu tutulabilir. Sınırın %75'ine ulaşan dersler riskli olarak işaretlenir.

**Kontrol Merkezi → İstatistikler** bölümünde ödev tamamlama oranı, girilmiş final sonuçlarının ortalaması, devamsızlık kullanımı, geciken ödevler ve ders bazındaki özet görünür.

Ödevler başlık, açıklama veya ders adına göre; notlar ders adı ve sonuç durumuna göre; devamsızlıklar ise ders adına göre aranabilir.

## Yedekleme ve uygulama kurulumu

Sağ üstteki **Ayarlar** düğmesinden tüm kullanıcı kayıtları JSON dosyası olarak indirilebilir ve daha sonra geri yüklenebilir. Geri yükleme mevcut tarayıcı kayıtlarının üzerine yazar.

Site PWA olarak hazırlanmıştır. Destekleyen tarayıcılarda aynı bölümdeki kurulum düğmesiyle telefona veya bilgisayara uygulama olarak kurulabilir. Kurulum düğmesi sunulmuyorsa tarayıcının **Ana ekrana ekle** seçeneği kullanılabilir.

## Yerelde çalıştırma

`fetch()` ile JSON okunduğu için `index.html` dosyasını doğrudan açmak yerine basit bir sunucu kullan:

```bash
python3 -m http.server 8000
```

Ardından `http://localhost:8000` adresini aç.
