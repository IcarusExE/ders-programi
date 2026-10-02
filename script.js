document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - Fixed Schedule Mode');

    const coursesList = document.getElementById('coursesList');
    const addBtn = document.getElementById('addBtn');
    const courseTemplate = document.getElementById('courseTemplate');
    const printBtn = document.getElementById('printBtn');
    const coursesKey = 'ders-programi-courses';

    // **SABIT DERS PROGRAMI** - Değişmez, sadece görüntülenir
    // Bu veri localStorage'dan yüklenmez, sadece bu sitede kullanılır
    const fixedCourses = [
        {
            name: "Matematik II",
            details: "Matematik Fakültesi | 101 | 13:00-14:40",
            color: "#1a73e8"
        },
        {
            name: "Programlama Temelleri",
            details: "Bilgisayar Mühendisliği | 202 | 09:00-10:40",
            color: "#34a853"
        },
        {
            name: "Fizik I",
            details: "Fizik Fakültesi | 305 | 14:00-15:40",
            color: "#fbbc05"
        },
        {
            name: "Veri Yapıları",
            details: "Bilgisayar Mühendisliği | 410 | 11:00-12:40",
            color: "#ea4335"
        },
        {
            name: "İngilizce II",
            details: "Dil Fakültesi | 505 | 10:00-11:40",
            color: "#6c5ce7"
        },
        {
            name: "Atatürk İlkeleri",
            details: "Tarih Fakültesi | 601 | 15:00-16:40",
            color: "#34a853"
        },
        {
            name: "Veritabanı Sistemleri",
            details: "Bilgisayar Mühendisliği | 702 | 16:00-17:40",
            color: "#fbbc05"
        }
    ];

    // Render fixed courses to the DOM
    function renderCourses() {
        if (fixedCourses.length === 0) {
            coursesList.innerHTML = '<p class="empty-state">Program bulunamadı.</p>';
            return;
        }

        coursesList.innerHTML = fixedCourses.map((course, index) => `
            <div class="course-card" style="border-left: 4px solid ${course.color};">
                <div class="course-color-indicator" style="background: ${course.color};"></div>
                <div class="course-info">
                    <h3 class="course-name">${course.name}</h3>
                    <p class="course-details">${course.details}</p>
                </div>
                <div class="course-colors">
                    <div class="course-color" style="background: ${course.color};"></div>
                </div>
            </div>
        `).join('');
    }

    // Initial render - fixed data only
    renderCourses();

    // Print button functionality
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Print styles for better output
    const printStyle = document.createElement('style');
    printStyle.textContent = `
        @media print {
            .container {
                max-width: 100%;
                padding: 0;
            }
            .course-card {
                box-shadow: none;
                border: 1px solid #dee2e6;
                page-break-inside: avoid;
            }
            .btn-primary, .btn-secondary {
                display: none;
            }
        }
    `;
    document.head.appendChild(printStyle);
});