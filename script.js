// モーダル要素
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

// OK → 新しい枠を追加
modalOk.onclick = () => {
    const name = modalInput.value.trim();
    if (!name) return;

    const container = document.getElementById("personContainer");

    const html = `
        <div class="individual">


            <div class="top-row">
                <input type="text" class="name-input" placeholder="名前">
                <button class="delete-btn">削除</button>
            </div>

            <table class="shift-table">
                <tr>
                    <th>月</th>
                    <th>火</th>
                    <th>水</th>
                    <th>木</th>
                    <th>金</th>
                    <th>土</th>
                    <th>日</th>
                </tr>
                <tr>
                    <td><select><option class="mitei">ー</option><option class="maru">〇</option><option class="batu">✕</option></select></td>
                    <td><select><option class="mitei">ー</option><option class="maru">〇</option><option class="batu">✕</option></select></td>
                    <td><select><option class="mitei">ー</option><option class="maru">〇</option><option class="batu">✕</option></select></td>
                    <td><select><option class="mitei">ー</option><option class="maru">〇</option><option class="batu">✕</option></select></td>
                    <td><select><option class="mitei">ー</option><option class="maru">〇</option><option class="batu">✕</option></select></td>
                    <td><select><option class="mitei">ー</option><option class="maru">〇</option><option class="batu">✕</option></select></td>
                    <td><select><option class="mitei">ー</option><option class="maru">〇</option><option class="batu">✕</option></select></td>
                </tr>
            </table>
        </div>
    `;

    container.insertAdjacentHTML("beforeend", html);

    modal.style.display = "none";
};

// Enterキー → OKと同じ
modalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        modalOk.click();
    }
});

// キャンセル
modalCancel.onclick = () => {
    modal.style.display = "none";
};

// 削除ボタン（イベント委譲）
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {

        const targetBox = e.target.closest(".individual");

        if (confirm("削除しますか？")) {
            targetBox.remove();
        }
    }
});
document.addEventListener("change", function(e) {
    if (e.target.tagName === "SELECT") {
        const val = e.target.value;

        if (val === "〇") {
            e.target.style.color = "red";
        } else if (val === "✕") {
            e.target.style.color = "#0088ff";
        } else if (val === "ー") {
            e.target.style.color = "black";
        }
    }
});
