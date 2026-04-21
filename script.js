let dataMahasiswa = [];
let grafikChart;

// Konfigurasi Chart.js
Chart.defaults.font.family = "'Poppins', sans-serif";
Chart.defaults.color = "#000000";

document.addEventListener('DOMContentLoaded', () => {
    inisialisasiGrafik();

    // Menjalankan animasi ketik
    jalankanAnimasiKetik("Grade Master", "appTitle", 150, 75, 2500);

    // Memuat Animasi Lottie secara Offline
    lottie.loadAnimation({
        container: document.getElementById('lottieHeader'), 
        renderer: 'svg',
        loop: true,
        autoplay: true,
        // Kita menggunakan variabel dataAnimasi yang ada di lottieData.js
        animationData: dataAnimasi 
    });
});

// --- FUNGSI ANIMASI KETIK (FIXED EMOJI BUG & STABIL) ---
function jalankanAnimasiKetik(teks, elemenId, kecepatanKetik, kecepatanHapus, jeda) {
    let index = 0;
    let isDeleting = false;
    const elemen = document.getElementById(elemenId);
    
    // Mengubah teks menjadi array karakter (aman untuk emoji)
    const karakterArray = [...teks]; 

    function ngetik() {
        const teksSekarang = karakterArray.slice(0, index).join("");
        elemen.innerHTML = teksSekarang;

        let kecepatanAktif = isDeleting ? kecepatanHapus : kecepatanKetik;

        if (!isDeleting && index === karakterArray.length) {
            kecepatanAktif = jeda;
            isDeleting = true;
        } else if (isDeleting && index === 0) {
            isDeleting = false;
            kecepatanAktif = 500;
        }

        isDeleting ? index-- : index++;
        setTimeout(ngetik, kecepatanAktif);
    }
    ngetik();
}

// --- LOGIKA INPUT DATA ---
document.getElementById('formMahasiswa').addEventListener('submit', function(e) {
    e.preventDefault();
    const nama = document.getElementById('nama').value;
    
    // Konversi koma ke titik untuk kalkulasi JS
    let nilaiRaw = document.getElementById('nilai').value.replace(',', '.');
    let nilai = parseFloat(nilaiRaw);

    if (isNaN(nilai) || nilai < 0 || nilai > 100) {
        alert("Masukkan nilai angka yang valid antara 0 - 100.");
        return;
    }

    dataMahasiswa.push({ nama, nilai });
    this.reset();
    document.getElementById('nama').focus();
    perbaruiAplikasi();
});

function perbaruiAplikasi() {
    renderTabel();
    kalkulasiStatistik();
    updateGrafik();
}

function renderTabel() {
    const tbody = document.getElementById('tabelMahasiswa');
    tbody.innerHTML = ''; 

    dataMahasiswa.forEach((mhs, i) => {
        const tr = document.createElement('tr');
        let nilaiTampil = mhs.nilai.toString().replace('.', ',');
        
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${mhs.nama}</td>
            <td>${nilaiTampil}</td>
            <td>${cekStatus(mhs.nilai)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function cekStatus(nilai) {
    return nilai >= 60 
        ? '<span class="badge badge-lulus">LULUS</span>' 
        : '<span class="badge badge-gagal">GAGAL</span>';
}

function kalkulasiStatistik() {
    if (dataMahasiswa.length === 0) return;

    const totalNilai = dataMahasiswa.reduce((sum, m) => sum + m.nilai, 0);
    const tertinggi = dataMahasiswa.reduce((prev, curr) => (prev.nilai > curr.nilai) ? prev : curr);

    const rataRata = (totalNilai / dataMahasiswa.length).toFixed(1).replace('.', ',');
    const nilaiTertinggiTampil = tertinggi.nilai.toString().replace('.', ',');

    document.getElementById('rataRata').innerText = rataRata;
    document.getElementById('nilaiTertinggi').innerText = `${tertinggi.nama} (${nilaiTertinggiTampil})`;
}

// --- INISIALISASI GRAFIK ---
function inisialisasiGrafik() {
    const ctx = document.getElementById('grafikNilai').getContext('2d');
    grafikChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Nilai Mahasiswa',
                data: [],
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderColor: '#000',
                borderWidth: 3,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true, 
                    max: 100, 
                    ticks: { font: { weight: 'bold' } } 
                },
                x: { 
                    ticks: { font: { weight: 'bold' } } 
                }
            },
            plugins: { 
                legend: { 
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#000000',
                        font: {
                            family: "'Poppins', sans-serif",
                            size: 14,
                            weight: 'bold'
                        },
                        boxWidth: 20,
                        boxHeight: 20,
                        useBorderRadius: true,
                        borderRadius: 5
                    }
                } 
            }
        }
    });
}

function updateGrafik() {
    grafikChart.data.labels = dataMahasiswa.map(m => m.nama);
    grafikChart.data.datasets[0].data = dataMahasiswa.map(m => m.nilai);
    grafikChart.update();
}