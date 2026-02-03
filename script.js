const UI = {
    form: document.querySelector('#taskForm'),
    input: document.querySelector('#taskInput'),
    addBtn: document.querySelector('#addBtn'),
    taskList: document.querySelector('#taskList'),
    empty: document.querySelector('#emptyState'),
    count: document.querySelector('#activeCount'),
    perc: document.querySelector('#progressPercent'),
    arc: document.querySelector('#progressArc'),
    orb: document.querySelector('#light-orb'),
    time: document.querySelector('#liveTime'),
    reset: document.querySelector('#resetBtn'),
    status: document.querySelector('#statusLabel')
};

/**
 * Uygulamayı başlatan ana fonksiyon
 */
const init = () => {
    // 1. Saat fonksiyonunu her saniye güncelle
    updateClock();
    setInterval(updateClock, 1000);

    // 2. Mouse hareketini dinleyerek arka plan orbu hareket ettir (Parallax)
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX - 175;
        const y = e.clientY - 175;
        UI.orb.style.transform = `translate(${x}px, ${y}px)`;
    });

    // 3. Event Listener'lar
    UI.addBtn.onclick = addTask;
    UI.form.onsubmit = (e) => { e.preventDefault(); addTask(); };
    UI.reset.onclick = resetData;

    // 4. İlk yüklemede verileri getir
    render();
};

const updateClock = () => {
    const now = new Date();
    UI.time.innerText = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

/**
 * LocalStorage'dan görevleri çekme
 */
const getTasks = () => JSON.parse(localStorage.getItem('semantic_tasks_v2')) || [];

/**
 * Yeni görev ekleme mantığı
 */
function addTask() {
    const text = UI.input.value.trim();
    if (!text) {
        UI.input.placeholder = "Lütfen bir şeyler yazın...";
        return;
    }

    const tasks = getTasks();
    tasks.unshift(text); // Yeni görevi en başa ekle
    localStorage.setItem('semantic_tasks_v2', JSON.stringify(tasks));

    UI.input.value = '';
    UI.input.placeholder = "Sıradaki büyük adım nedir?";
    render();
}

/**
 * Belirli bir görevi silme
 * (Window objesine bağlayarak inline onclick çalışmasını sağlıyoruz)
 */
window.deleteTask = (index) => {
    const tasks = getTasks();
    tasks.splice(index, 1);
    localStorage.setItem('semantic_tasks_v2', JSON.stringify(tasks));
    render();
};

/**
 * Tüm sistemi sıfırlama
 */
function resetData() {
    if (confirm('Dikkat! Tüm görevleriniz kalıcı olarak silinecektir. Onaylıyor musunuz?')) {
        localStorage.removeItem('semantic_tasks_v2');
        render();
    }
}

/**
 * Arayüzü güncelleyen ana render fonksiyonu
 */
function render() {
    const tasks = getTasks();
    UI.taskList.innerHTML = '';

    // Empty State Kontrolü
    if (tasks.length === 0) {
        UI.empty.classList.add('show');
        UI.status.innerText = "Sistem Hazır";
    } else {
        UI.empty.classList.remove('show');
        UI.status.innerText = "Odaklanıldı";

        // Görevleri listeye ekle
        tasks.forEach((task, i) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${task}</span>
                <button onclick="deleteTask(${i})" title="Sil">
                    <i class="fas fa-trash-can"></i>
                </button>
            `;
            UI.taskList.appendChild(li);
        });
    }

    // İstatistik ve Progress Güncelleme
    const taskCount = tasks.length;
    UI.count.innerText = taskCount;

    // Progress Hesapla (Limit: 10 görevde %100)
    let progress = Math.min((taskCount / 10) * 100, 100);
    UI.perc.innerText = Math.round(progress) + '%';

    // SVG Dashoffset (Çevre = 2 * PI * 45 ≈ 283)
    const circumference = 283;
    const offset = (progress / 100) * circumference;
    UI.arc.style.strokeDasharray = `${offset} ${circumference}`;
}

// Başlat!
init();