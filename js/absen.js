let students = JSON.parse(localStorage.getItem("students")) || [];

function save() {
    localStorage.setItem("students", JSON.stringify(students));
}

function progressColor(p) {
    if (p < 40) return "#e74c3c";
    if (p < 70) return "#f1c40f";
    return "#2ecc71";
}

function calcProgress(s) {
    let total = 0;
    total += (s.attendance.filter(x => x).length / 14) * 20;
    total += (s.tugas1 / 100) * 10;
    total += (s.tugas2 / 100) * 10;
    total += (s.tugas3 / 100) * 10;
    total += (s.praktik / 100) * 10;
    total += (s.uts / 100) * 20;
    total += (s.uas / 100) * 20;
    return Math.round(total);
}

function render() {
    const tb = document.getElementById("tableBody");
    tb.innerHTML = "";

    students.forEach((s, i) => {
        let p = calcProgress(s);

        // 🔑 tampil dinamis SESUAI YANG SUDAH DIKUNCI
        let nilaiAktif = [];

        if (
            (s.tugas1 > 0 && s.locked.tugas1) ||
            (s.tugas2 > 0 && s.locked.tugas2) ||
            (s.tugas3 > 0 && s.locked.tugas3)
        ) nilaiAktif.push("🔑 TUGAS");

        if (s.praktik > 0 && s.locked.praktik) nilaiAktif.push("🔑 PRAKTIK");
        if (s.uts > 0 && s.locked.uts) nilaiAktif.push("🔑 UTS");
        if (s.uas > 0 && s.locked.uas) nilaiAktif.push("🔑 UAS");

        tb.innerHTML += `
<tr>
    <td class="fw-bold text-center">${i + 1}</td>

    <td class="nama-col">
        <div class="student-name">${s.name}</div>
        <div class="nilai-wrapper">
            ${nilaiAktif.length
                ? nilaiAktif.map(n => `<span class="nilai-item">${n}</span>`).join(" ")
                : "<small class='text-muted'>Belum ada</small>"}
        </div>
    </td>

    <td>
        <div class="attendance">
            ${s.attendance.map((v, idx) =>
                `<input type="checkbox" ${v ? "checked" : ""}
                 onclick="toggleAttend(${i},${idx})">`
            ).join("")}
        </div>
    </td>

    <td>
        <div class="progress">
            <div class="progress-bar"
                style="width:${p}%; background:${progressColor(p)}">
            </div>
        </div>
        <small>${p}%</small>
    </td>

    <td>
        <span class="delete" onclick="deleteStudent(${i})">✖</span>
    </td>
</tr>`;
    });

    renderStudentSelect();
}

function addStudent() {
    const name = document.getElementById("studentName").value.trim();
    if (!name) return alert("Nama wajib diisi");

    students.push({
        name,
        attendance: Array(14).fill(false),
        tugas1: 0, tugas2: 0, tugas3: 0,
        praktik: 0, uts: 0, uas: 0,
        locked: {
            tugas1: false,
            tugas2: false,
            tugas3: false,
            praktik: false,
            uts: false,
            uas: false
        }
    });

    document.getElementById("studentName").value = "";
    save();
    render();
}

function deleteStudent(i) {
    if (!confirm("Hapus siswa ini?")) return;
    students.splice(i, 1);
    save();
    render();
}

function toggleAttend(s, a) {
    students[s].attendance[a] = !students[s].attendance[a];
    save();
    render();
}

function inputScore() {
    const sel = document.getElementById("studentSelect");
    const idx = sel.value;
    const type = document.getElementById("scoreType").value;
    const val = parseInt(document.getElementById("scoreValue").value);

    if (idx === "" || type === "" || isNaN(val)) {
        alert("Lengkapi input");
        return;
    }

    const s = students[idx];

    if (s.locked[type]) {
        alert("Nilai sudah dikunci");
        return;
    }

    s[type] = val;
    s.locked[type] = true;

    save();
    render();

    document.getElementById("scoreValue").value = "";
    document.getElementById("scoreType").value = "";
}

function renderStudentSelect() {
    const sel = document.getElementById("studentSelect");
    const selected = sel.value; // 🔒 JAGA PILIHAN

    sel.innerHTML = `<option value="">Pilih Siswa</option>`;
    students.forEach((s, i) => {
        sel.innerHTML += `<option value="${i}">${s.name}</option>`;
    });

    if (selected !== "") sel.value = selected;
}

render();

function exportExcelXLSX() {
    if (!students.length) {
        alert("Data siswa masih kosong");
        return;
    }

    const wb = XLSX.utils.book_new();
    const wsData = [];

    // ===== JUDUL =====
    wsData.push(["PROGRESS NILAI SISWA"]);
    wsData.push([`Tanggal Export: ${new Date().toLocaleDateString("id-ID")}`]);
    wsData.push([]); // spasi

    // ===== HEADER TABEL =====
    wsData.push([
        "No",
        "Nama",
        "Kehadiran",
        "Tugas 1",
        "Tugas 2",
        "Tugas 3",
        "Praktik",
        "UTS",
        "UAS",
        "Progress (%)"
    ]);

    // ===== DATA =====
    students.forEach((s, i) => {
        wsData.push([
            i + 1,
            s.name,
            s.attendance.filter(x => x).length,
            s.tugas1,
            s.tugas2,
            s.tugas3,
            s.praktik,
            s.uts,
            s.uas,
            calcProgress(s)
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // ===== MERGE JUDUL =====
    ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }
    ];

    // ===== AUTO WIDTH =====
    ws["!cols"] = [
        { wch: 5 },
        { wch: 22 },
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 8 },
        { wch: 8 },
        { wch: 14 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Nilai Siswa");
    XLSX.writeFile(wb, "progress_nilai_siswa.xlsx");
}
