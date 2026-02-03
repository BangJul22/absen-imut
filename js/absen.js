let students = JSON.parse(localStorage.getItem("students")) || [];
let selectedStudent = null;

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

const rowColors = [
    "#FDECEC",
    "#ECF5FF",
    "#ECFDF3",
    "#FFF6E5",
    "#F5EEFF",
    "#EFFFFA",
    "#FFF0F5"
];

function render() {
    const tb = document.getElementById("tableBody");
    tb.innerHTML = "";

    students.forEach((s, i) => {
        let p = calcProgress(s);
        let bg = rowColors[i % rowColors.length];

        tb.innerHTML += `
        <tr style="background:${bg}">
            <td>
                ${s.name}
                <br>
                <small>
                    ${Object.entries(s.locked)
                .filter(([k, v]) => v)
                .map(([k]) => `🔒 ${k}`)
                .join(", ")}
                </small>
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
                ${p}%
            </td>

            <td>
                <span class="delete" onclick="deleteStudent(${i})">✖</span>
            </td>
        </tr>`;
    });

    renderStudentSelect();
}


function addStudent() {
    let name = document.getElementById("studentName").value;
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
    let idx = document.getElementById("studentSelect").value;
    let type = document.getElementById("scoreType").value;
    let val = parseInt(document.getElementById("scoreValue").value);

    if (idx === "" || type === "" || isNaN(val)) {
        alert("Lengkapi input");
        return;
    }

    let s = students[idx];

    if (s.locked[type]) {
        alert("Nilai sudah dikunci untuk siswa ini");
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
    let sel = document.getElementById("studentSelect");
    sel.innerHTML = `<option value="">Pilih Siswa</option>`;
    students.forEach((s, i) => {
        sel.innerHTML += `<option value="${i}">${s.name}</option>`;
    });
}



render();