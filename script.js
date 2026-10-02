document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - Timetable Mode');

    const timetable = document.getElementById('timetable');
    const printBtn = document.getElementById('printBtn');
    const refreshBtn = document.getElementById('refreshBtn');

    // JSON dosyasından ders programı verisi yükle
    async function loadCurriculum() {
        try {
            const response = await fetch('data/curriculum.json');
            if (!response.ok) {
                throw new Error('JSON dosyası yüklenemedi');
            }
            const curriculum = await response.json();
            return curriculum;
        } catch (error) {
            console.error('JSON yükleme hatası:', error);
            // Fallback: Hata durumunda boş grid göster
            timetable.innerHTML = '<p class="empty-state">Program verisi yüklenemedi.<br>JSON dosyası kontrol edin.</p>';
            return [];
        }
    }

    // Hafta günlerinin sıralaması (CSS grid kolon sırası)
    const gunSira = {
        'Pazartesi': 0,
        'Salı': 1,
        'Çarşamba': 2,
        'Perşembe': 3,
        'Cuma': 4,
        'Cumartesi': 5,
        'Pazar': 6
    };

    // Saatleri parsla (08:00-09:00 formatı)
    function parseSaat(saatString) {
        const [baslangic, bitis] = saatString.split('-');
        const [saat, dakika] = baslangic.split(':');
        return parseInt(saat);
    }

    // Renk belirle (ders adına göre)
    function getColorForDers(dersAdi) {
        const renkler = {
            'Programlama': '#1a73e8',
            'Veritabanı': '#34a853',
            'Matematik': '#fbbc05',
            'Web': '#ea4335',
            'Ağ': '#6c5ce7',
            'İletişim': '#f57c00',
            'Özel': '#5a2d84',
            'MYO': '#1a73e8'
        };

        for (const [anahtar, renk] of Object.entries(renkler)) {
            if (dersAdi.includes(anahtar)) {
                return renk;
            }
        }
        return '#1a73e8'; // Varsayılan mavi
    }

    // Grid stilleri için gün renkleri
    const gunRenkleri = {
        'Pazartesi': '#e3f2fd',
        'Salı': '#e8f5e9',
        'Çarşamba': '#fff3e0',
        'Perşembe': '#f1f8e9',
        'Cuma': #e3f2fd
    };

    // Timetable'i render et
    function renderTimetable(curriculum) {
        if (curriculum.length === 0) {
            timetable.innerHTML = '<p class="empty-state">Program bulunamadı.</p>';
            return;
        }

        // Grid'i temizle
        timetable.innerHTML = '';

        // Sabit ayarlar
        const gunSayisi = 5; // Pazartesi-Cuma
        const saatBaslangic = 8;
        const saatSonsu = 17; // 16:00 sonu, yani 9 saat (8-17)

        // HTML yapısını oluştur
        // 1. Saat başlık satırı (sütun 1 - saat numaraları)
        const hourRow = document.createElement('div');
        hourRow.className = 'timetable-hour-row';

        // Saat etiketleri (8:00, 9:00, ..., 16:00)
        for (let sa = saatBaslangic; sa < saatSonsu; sa++) {
            const hourLabel = document.createElement('div');
            hourLabel.className = 'timetable-hour-label';
            hourLabel.textContent = `${sa}:00-${sa+1}:00`;
            hourRow.appendChild(hourLabel);
        }

        // 2. Gün başlık satırı
        const dayRow = document.createElement('div');
        dayRow.className = 'timetable-day-row';

        const gunler = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
        gunler.forEach(gun => {
            const dayHeader = document.createElement('div');
            dayHeader.className = `timetable-day-header ${gun.toLowerCase()}`;
            dayHeader.textContent = gun.charAt(0).toUpperCase() + gun.slice(1);
            dayRow.appendChild(dayHeader);
        });

        // 3. Grid hücreleri (saat x gun = 5 x 9 = 45 hücre)
        const gridContainer = document.createElement('div');
        gridContainer.className = 'timetable-grid-container';

        // Saat ve gün bazında hücreleri oluştur
        for (let gunIdx = 0; gunIdx < gunSayisi; gunIdx++) {
            for (let saatIdx = 0; saatIdx < 9; saatIdx++) {
                const gridCell = document.createElement('div');
                gridCell.className = 'timetable-grid-cell';
                gridCell.dataset.dayIdx = gunIdx;
                gridCell.dataset.saatIdx = saatIdx;

                // Hücreye saat bilgisi ekle (arayüz için)
                const saat = saatBaslangic + saatIdx;
                gridCell.title = `${gunler[gunIdx]} ${saat}:00-${saat+1}:00`;

                gridContainer.appendChild(gridCell);
            }
        }

        // 4. Course'ları grid hücrelerine yerleştir
        curriculum.forEach(ders => {
            const gunIndex = gunSira[ders.gun];
            if (gunIndex === undefined) return; // Geçersiz gün atla

            const baslangicSaat = parseSaat(ders.saat);
            const satirIndex = baslangicSaat - saatBaslangic; // 0-8 arası

            if (satirIndex < 0 || satirIndex > 8) return; // Saat aralığı dışı (8:00-17:00)

            const kolonIndex = gunIndex; // 0-4 arası

            // Grid hücresini bul
            const gridCells = gridContainer.querySelectorAll('.timetable-grid-cell');
            const targetCell = gridCells[satirIndex * gunSayisi + kolonIndex];

            if (!targetCell) return;

            // Eğer hücrede zaten bir ders varsa, üzerine ekle (akşam'école ihtimali için)
            // Ancak bu uygulama 1-hour bloklar kullandığımız için tek ders varsayılıyor

            // Course block oluştur
            const courseBlock = document.createElement('div');
            courseBlock.className = 'timetable-course-block';
            courseBlock.style.background = getColorForDers(ders.ders_adi);

            // Ders adı (kısa hali)
            const shortAdi = ders.ders_adi.length > 20 ? ders.ders_adi.substring(0, 17) + '...' : ders.ders_adi;

            courseBlock.innerHTML = `
                <div style="font-size: 10px; font-weight: 600; color: var(--text-primary); 
                            white-space: nowrap; overflow: hidden; text-overflow: ellipsis; 
                            max-height: 30px; margin-bottom: 2px;">
                    ${shortAdi}
                </div>
                <div style="font-size: 8px; color: var(--text-secondary); 
                            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                            max-height: 16px;">
                    Hoca: ${ders.hoca_adi}
                </div>
            `;

            targetCell.appendChild(courseBlock);
        });

        // Grid'i timeline'a ekle
        timetable.appendChild(hourRow);
        timetable.appendChild(dayRow);
        timetable.appendChild(gridContainer);
    }

    // Başlat
    loadCurriculum().then(curriculum => {
        renderTimetable(curriculum);
    });

    // Print butonu
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Refresh butonu
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadCurriculum().then(curriculum => {
                renderTimetable(curriculum);
            });
        });
    }
});