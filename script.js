document.addEventListener('DOMContentLoaded', () => {
    const coursesList = document.getElementById('coursesList');
    const addBtn = document.getElementById('addBtn');
    const courseTemplate = document.getElementById('courseTemplate');
    const coursesKey = 'ders-programi-courses';

    // Load courses from localStorage or use empty array
    let courses = JSON.parse(localStorage.getItem(coursesKey)) || [];

    // Render courses to the DOM
    function renderCourses() {
        if (courses.length === 0) {
            coursesList.innerHTML = '<p class="empty-state">Henüz ders eklenmemiş. <br>Yukarıdaki buton ile ders ekleyebilirsiniz.</p>';
            return;
        }

        coursesList.innerHTML = courses.map((course, index) => `
            <div class="course-card" style="--course-color: ${course.color}" draggable="true" data-index="${index}">
                <div class="course-color-indicator"></div>
                <div class="course-info">
                    <h3 class="course-name" contenteditable="true">${escapeHtml(course.name)}</h3>
                    <p class="course-details" contenteditable="true">${escapeHtml(course.details)}</p>
                </div>
                <button class="remove-btn" aria-label="Kurs sil" data-index="${index}">✕</button>
            </div>
        `).join('');

        // Add event listeners after rendering
        addEventListeners();
    }

    // Escape HTML special characters
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Save courses to localStorage
    function saveCourses() {
        localStorage.setItem(coursesKey, JSON.stringify(courses));
    }

    // Add event listeners to course cards
    function addEventListeners() {
        // Remove course button
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(btn.dataset.index);
                courses.splice(index, 1);
                saveCourses();
                renderCourses();
            });
        });

        // Make course cards draggable
        initDragAndDrop();
    }

    // Drag and drop functionality
    function initDragAndDrop() {
        let draggedIndex = null;

        document.querySelectorAll('.course-card:not(.dragging)').forEach(card => {
            card.addEventListener('dragstart', (e) => {
                draggedIndex = parseInt(card.dataset.index);
                card.classList.add('dragging');
                setTimeout(() => card.classList.add('is-dragging'), 0);
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                card.classList.remove('is-dragging');
                draggedIndex = null;
            });
        });

        document.querySelectorAll('.course-card:not(.dragging)').forEach card => {
            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = getDragAfterElement(coursesList, e.clientY);
                const draggable = coursesList.querySelector('.dragging');
                if (afterElement == null) {
                    coursesList.appendChild(draggable);
                } else {
                    coursesList.insertBefore(draggable, afterElement);
                }
            });
        };
    }

    // Get the element after which the draggable should be inserted
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.course-card:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Add new course
    addBtn.addEventListener('click', () => {
        const defaultCourse = {
            name: 'Yeni Ders',
            details: 'İsim ve bilgiler eklenmedi',
            color: getRandomColor()
        };

        courses.push(defaultCourse);
        saveCourses();
        renderCourses();
    });

    // Generate random color for courses
    function getRandomColor() {
        const colors = [
            '#1a73e8', // mavi
            '#34a853', // yeşil
            '#fbbc05', // sarı
            '#ea4335', // kırmızı
            '#6c5ce7', // mor
            '#34a853', // yeşil
            '#ea4335', // kırmızı
            '#fbbc05'  // sarı
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Initial render
    renderCourses();
});