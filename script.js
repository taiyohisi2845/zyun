// ===============================
// モーダル関連
// ===============================
const modal = document.getElementById("nameModal");
const modalInput = document.getElementById("modalNameInput");
const modalOk = document.getElementById("modalOkBtn");
const modalCancel = document.getElementById("modalCancelBtn");

// 追加ボタン → モーダル表示
document.getElementById("addPersonBtn").onclick = () => {
    modal.style.display = "block";
    modalInput.value = "";
    modalInput.focus();
};

// ===============================
// 個別枠追加（復元にも使う）
// ===============================
function addIndividual(name, days = null) {
    const container = document.getElementById("personContainer");

    const html = `
        <div class="individual">
            <div class="top-row">
                <input type="text" class="name-input" value="${name}">
                <button class="delete-btn">削除</button>
            </div>

            <table class="shift-table">
                <tr>
                    <th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th><th>日</th>
                </tr>
                <tr>
                    ${[...Array(7)].map(() => `
                        <td>
                            <div class="cell-wrap">
                                <select class="check-select">
                                    <option class="mitei">ー</option>
                                    <option class="maru">〇</option>
                                    <option class="batu">✕</option>
                                </select>

                                <select class="time-select start-select">
                                    <option value="">--</option>
                                    <option>09:00</option><option>09:30</option><option>10:00</option>
                                    <option>10:30</option><option>11:00</option><option>11:30</option>
                                    <option>12:00</option><option>12:30</option><option>13:00</option>
                                    <option>13:30</option><option>14:00</option><option>14:30</option>
                                    <option>15:00</option><option>15:30</option><option>16:00</option>
                                    <option>16:30</option><option>17:00</option><option>17:30</option>
                                    <option>18:00</option><option>18:30</option><option>19:00</option>
                                    <option>19:30</option><option>20:00</option>
                                </select>

                                <span class="tilde">｜</span>

                                <select class="time-select end-select">
                                    <option value="">--</option>
                                    <option>12:00</option><option>12:30</option><option>13:00</option>
                                    <option>13:30</option><option>14:00</option><option>14:30</option>
                                    <option>15:00</option><option>15:30</option><option>16:00</option>
                                    <option>16:30</option><option>17:00</option><option>17:30</option>
                                    <option>18:00</option><option>18:30</option><option>19:00</option>
                                    <option>19:30</option><option>20:00</option><option>20:30</option>
                                    <option>21:00</option><option>21:30</option><option>22:00</option>
                                </select>
                            </div>
                        </td>
                    `).join("")}
                </tr>
            </table>
        </div>
    `;

    container.insertAdjacentHTML("beforeend", html);

    const ind = container.lastElementChild;

    // 復元データがある場合
    if (days) {
        const cells = ind.querySelectorAll("td");
        days.slice(0, 7).forEach((d, i) => {
            const checkSel = cells[i].querySelector(".check-select");
            const startSel = cells[i].querySelector(".start-select");
            const endSel = cells[i].querySelector(".end-select");

            checkSel.value = d.check;
            startSel.value = d.start;
            endSel.value = d.end;

            applyCheckStyle(checkSel);
            applyTimeState(checkSel, startSel, endSel);
        });
    } else {
        // 新規追加時は初期状態を反映
        const cells = ind.querySelectorAll("td");
        cells.forEach(cell => {
            const checkSel = cell.querySelector(".check-select");
            const startSel = cell.querySelector(".start-select");
            const endSel = cell.querySelector(".end-select");
            applyCheckStyle(checkSel);
            applyTimeState(checkSel, startSel, endSel);
        });
    }

    // 新規追加直後に保存
    saveData();
}

// OK → 新しい枠追加
modalOk.onclick = () => {
    const name = modalInput.value.trim();
    if (!name) return;

    addIndividual(name);
    modal.style.display = "none";
};

// Enterキー
modalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") modalOk.click();
});

// キャンセル
modalCancel.onclick = () => {
    modal.style.display = "none";
};

// ===============================
// 〇✕の色＆時間欄状態
// ===============================
function applyCheckStyle(select) {
    const val = select.value;
    if (val === "〇") select.style.color = "red";
    else if (val === "✕") select.style.color = "#0088ff";
    else select.style.color = "black";
}

function applyTimeState(checkSel, startSel, endSel) {
    const val = checkSel.value;
    if (val === "✕") {
        startSel.value = "";
        endSel.value = "";
        startSel.classList.add("time-disabled");
        endSel.classList.add("time-disabled");
        startSel.disabled = true;
        endSel.disabled = true;
    } else {
        startSel.classList.remove("time-disabled");
        endSel.classList.remove("time-disabled");
        startSel.disabled = false;
        endSel.disabled = false;
    }
}

// 全ての select 変更時
document.addEventListener("change", (e) => {
    if (e.target.classList.contains("check-select")) {
        const cell = e.target.closest("td");
        const startSel = cell.querySelector(".start-select");
        const endSel = cell.querySelector(".end-select");
        applyCheckStyle(e.target);
        applyTimeState(e.target, startSel, endSel);
    }
    saveData();
});

// 名前入力も保存
document.addEventListener("input", (e) => {
    if (e.target.classList.contains("name-input")) {
        saveData();
    }
});

// ===============================
// 印刷
// ===============================
document.getElementById("printBtn").onclick = () => window.print();

// ===============================
// 削除モーダル
// ===============================
let deleteTarget = null;

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
        deleteTarget = e.target.closest(".individual");
        document.getElementById("deleteModal").style.display = "block";
    }
});

document.getElementById("deleteOkBtn").onclick = () => {
    if (deleteTarget) {
        deleteTarget.classList.add("fade-out");
        setTimeout(() => {
            deleteTarget.remove();
            saveData();
        }, 200);
    }
    deleteTarget = null;
    document.getElementById("deleteModal").style.display = "none";
};

document.getElementById("deleteCancelBtn").onclick = () => {
    deleteTarget = null;
    document.getElementById("deleteModal").style.display = "none";
};

// ===============================
// 保存（完全版）
// ===============================
let isRestoring = false;

function saveData() {
    if (isRestoring) return;

    const individuals = document.querySelectorAll(".individual");
    const data = [];

    individuals.forEach(ind => {
        const name = ind.querySelector(".name-input").value;
        const cells = ind.querySelectorAll("td");
        const days = [];

        cells.forEach(cell => {
            const checkSel = cell.querySelector(".check-select");
            const startSel = cell.querySelector(".start-select");
            const endSel = cell.querySelector(".end-select");

            days.push({
                check: checkSel?.value || "ー",
                start: startSel?.value || "",
                end: endSel?.value || ""
            });
        });

        data.push({ name, days: days.slice(0, 7) });
    });

    localStorage.setItem("shiftData", JSON.stringify(data));
}

// ===============================
// 読み込み（復元）
// ===============================
function loadData() {
    const saved = localStorage.getItem("shiftData");
    if (!saved) return;

    isRestoring = true;

    const container = document.getElementById("personContainer");
    container.innerHTML = "";

    const data = JSON.parse(saved);
    data.forEach(item => addIndividual(item.name, item.days));

    isRestoring = false;
    saveData(); // 復元後に再保存して形式を安定化
}

window.onload = () => {
    // テーマ復元
    const theme = localStorage.getItem("theme") || "light";
    if (theme === "dark") document.body.classList.add("dark");

    loadData();
};

// ===============================
// 復元モーダル
// ===============================
document.getElementById("restoreBtn").onclick = () => {
    document.getElementById("restoreModal").style.display = "block";
};

document.getElementById("restoreCancelBtn").onclick = () => {
    document.getElementById("restoreModal").style.display = "none";
};

// ===============================
// コピー
// ===============================
document.getElementById("copyDataBtn").onclick = () => {
    const data = localStorage.getItem("shiftData") || "[]";
    navigator.clipboard.writeText(data);
    alert("コピーしました！");
};

// ===============================
// 貼り付け（即復元）
// ===============================
document.getElementById("pasteDataBtn").onclick = async () => {
    const text = await navigator.clipboard.readText();
    try {
        localStorage.setItem("shiftData", text);
        alert("貼り付けました！復元します");

        loadData();
    } catch {
        alert("データが正しくありません");
    }
};

// ===============================
// テーマ切り替え
// ===============================
document.getElementById("themeToggleBtn").onclick = () => {
    document.body.classList.toggle("dark");
    const theme = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("theme", theme);
};
