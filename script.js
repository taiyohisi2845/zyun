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
            <button class="delete-btn">削除</button>
            <table>
                <tr>
                    <td rowspan="2" class="tableline">
                        <input type="text" class="nameinput" value="${name}">
                    </td>
                    <td class="tabletext">月</td>
                    <td class="tabletext">火</td>
                    <td class="tabletext">水</td>
                    <td class="tabletext">木</td>
                    <td class="tabletext">金</td>
                    <td class="tabletext">土</td>
                    <td class="tabletext">日</td>
                </tr>
                <tr>
                    <td><select class="tablecheck"><option>〇</option><option>✕</option><option>ー</option></select></td>
                    <td><select class="tablecheck"><option>〇</option><option>✕</option><option>ー</option></select></td>
                    <td><select class="tablecheck"><option>〇</option><option>✕</option><option>ー</option></select></td>
                    <td><select class="tablecheck"><option>〇</option><option>✕</option><option>ー</option></select></td>
                    <td><select class="tablecheck"><option>〇</option><option>✕</option><option>ー</option></select></td>
                    <td><select class="tablecheck"><option>〇</option><option>✕</option><option>ー</option></select></td>
                    <td><select class="tablecheck"><option>〇</option><option>✕</option><option>ー</option></select></td>
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
