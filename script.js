// script.js (mobile-friendly)
(() => {
  // --- ユーティリティ ---
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const debounce = (fn, wait = 300) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  // --- DOM 要素 ---
  const nameModal = $("#nameModal");
  const modalInput = $("#modalNameInput");
  const modalOk = $("#modalOkBtn");
  const modalCancel = $("#modalCancelBtn");
  const addPersonBtn = $("#addPersonBtn");
  const personContainer = $("#personContainer");
  const deleteModal = $("#deleteModal");
  const deleteOkBtn = $("#deleteOkBtn");
  const deleteCancelBtn = $("#deleteCancelBtn");
  const printBtn = $("#printBtn");
  const restoreBtn = $("#restoreBtn");
  const restoreModal = $("#restoreModal");
  const copyDataBtn = $("#copyDataBtn");
  const pasteDataBtn = $("#pasteDataBtn");
  const restoreCancelBtn = $("#restoreCancelBtn");
  const personTemplate = $("#personTemplate");

  // --- 状態 ---
  let deleteTarget = null;
  let isRestoring = false;
  let lastFocusedBeforeModal = null;
  const LONG_PRESS_MS = 600; // 長押し判定（ミリ秒）
  const saveDebounced = debounce(saveData, 350);

  // --- モーダル制御（スマホ向けにスクロール対策） ---
  function openModal(modalEl) {
    if (!modalEl) return;
    lastFocusedBeforeModal = document.activeElement;
    modalEl.classList.add("is-open");
    modalEl.hidden = false;
    modalEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // フォーカスとスクロール調整（仮想キーボード対策）
    const focusable = modalEl.querySelector("input, button, [tabindex]:not([tabindex='-1'])");
    if (focusable) {
      focusable.focus();
      // スマホでキーボードに隠れないよう中央にスクロール
      setTimeout(() => {
        try { focusable.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) {}
      }, 50);
    }
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove("is-open");
    modalEl.hidden = true;
    modalEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    // フォーカスを戻す
    if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === "function") {
      lastFocusedBeforeModal.focus();
      lastFocusedBeforeModal = null;
    }
  }

  // ESC で閉じる（物理キーボードや外付けキーボード対応）
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      [nameModal, deleteModal, restoreModal].forEach(m => {
        if (m && !m.hidden) closeModal(m);
      });
    }
  });

  // --- 色反映ユーティリティ（クラス切替） ---
  function applySelectColor(selectEl) {
    if (!selectEl) return;
    selectEl.classList.remove("maru", "batu", "mitei");
    const v = selectEl.value;
    if (v === "〇") selectEl.classList.add("maru");
    else if (v === "✕") selectEl.classList.add("batu");
    else selectEl.classList.add("mitei");
  }

  // --- 個別カード生成 ---
  function createIndividualElement(name, days = null) {
    if (personTemplate) {
      const node = personTemplate.content.firstElementChild.cloneNode(true);
      const nameInput = node.querySelector(".name-input");
      if (nameInput) nameInput.value = name;
      if (days) {
        const cells = node.querySelectorAll("td");
        days.slice(0, 7).forEach((d, i) => {
          const selects = cells[i].querySelectorAll("select");
          if (selects[0]) selects[0].value = d.check || "";
          if (selects[1]) selects[1].value = d.start || "";
          if (selects[2]) selects[2].value = d.end || "";
          applySelectColor(selects[0]);
        });
      }
      // モバイルではタップ領域を広げるためにボタンに大きめのタッチ属性を付与（CSSで対応）
      return node;
    }

    // テンプレートがない場合のフォールバック（安全にDOM生成）
    const wrapper = document.createElement("div");
    wrapper.className = "individual";

    const top = document.createElement("div");
    top.className = "top-row";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "name-input";
    input.value = name;
    input.setAttribute("inputmode", "text");

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "delete-btn btn";
    delBtn.textContent = "削除";

    top.appendChild(input);
    top.appendChild(delBtn);
    wrapper.appendChild(top);

    const table = document.createElement("table");
    table.className = "shift-table";
    const trHead = document.createElement("tr");
    ["月","火","水","木","金","土","日"].forEach(t => {
      const th = document.createElement("th");
      th.textContent = t;
      trHead.appendChild(th);
    });
    table.appendChild(trHead);

    const tr = document.createElement("tr");
    const times = [
      "09:00","09:30","10:00","10:30","11:00","11:30",
      "12:00","12:30","13:00","13:30","14:00","14:30",
      "15:00","15:30","16:00","16:30","17:00","17:30",
      "18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00"
    ];
    for (let i = 0; i < 7; i++) {
      const td = document.createElement("td");
      const cellWrap = document.createElement("div");
      cellWrap.className = "cell-wrap";

      const selCheck = document.createElement("select");
      selCheck.className = "check-select";
      ["ー","〇","✕"].forEach(v => {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        selCheck.appendChild(opt);
      });

      const selStart = document.createElement("select");
      selStart.className = "time-select start";
      const selEnd = document.createElement("select");
      selEnd.className = "time-select end";

      const emptyOpt = document.createElement("option");
      emptyOpt.value = "";
      emptyOpt.textContent = "--";
      selStart.appendChild(emptyOpt.cloneNode(true));
      selEnd.appendChild(emptyOpt.cloneNode(true));
      times.forEach(t => {
        const o1 = document.createElement("option");
        o1.value = t;
        o1.textContent = t;
        selStart.appendChild(o1);
        const o2 = document.createElement("option");
        o2.value = t;
        o2.textContent = t;
        selEnd.appendChild(o2);
      });

      cellWrap.appendChild(selCheck);
      cellWrap.appendChild(selStart);
      const tilde = document.createElement("span");
      tilde.className = "tilde";
      tilde.textContent = "｜";
      cellWrap.appendChild(tilde);
      cellWrap.appendChild(selEnd);
      td.appendChild(cellWrap);
      tr.appendChild(td);

      if (days && days[i]) {
        selCheck.value = days[i].check || "";
        selStart.value = days[i].start || "";
        selEnd.value = days[i].end || "";
        applySelectColor(selCheck);
      }
    }
    table.appendChild(tr);
    wrapper.appendChild(table);
    return wrapper;
  }

  function addIndividual(name, days = null) {
    const el = createIndividualElement(name, days);
    personContainer.appendChild(el);
    // スクロールして追加したカードを見せる（スマホで視認性向上）
    setTimeout(() => {
      try { el.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
    }, 50);
    saveDebounced();
  }

  // --- 保存処理 ---
  function saveData() {
    if (isRestoring) return;
    const individuals = [];
    personContainer.querySelectorAll(".individual").forEach(ind => {
      const nameInput = ind.querySelector(".name-input");
      const name = nameInput ? nameInput.value : "";
      const days = [];
      ind.querySelectorAll("td").forEach(td => {
        const selects = td.querySelectorAll("select");
        days.push({
          check: selects[0] ? selects[0].value : "",
          start: selects[1] ? selects[1].value : "",
          end: selects[2] ? selects[2].value : ""
        });
      });
      individuals.push({ name, days: days.slice(0, 7) });
    });
    try {
      localStorage.setItem("shiftData", JSON.stringify(individuals));
    } catch (err) {
      console.error("保存に失敗しました", err);
    }
  }

  // --- 読み込み ---
  function loadData() {
    const raw = localStorage.getItem("shiftData");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return;
      isRestoring = true;
      personContainer.querySelectorAll(".individual").forEach(n => n.remove());
      data.forEach(item => addIndividual(item.name || "", item.days || null));
    } catch (err) {
      console.error("復元データが不正です", err);
    } finally {
      isRestoring = false;
    }
  }

  // --- 長押し（long-press）で削除確認（モバイル向け） ---
  const longPressMap = new WeakMap();
  function startLongPress(target) {
    if (!target) return;
    const t = setTimeout(() => {
      // 長押し確定
      deleteTarget = target.closest(".individual");
      openModal(deleteModal);
    }, LONG_PRESS_MS);
    longPressMap.set(target, t);
  }
  function cancelLongPress(target) {
    const t = longPressMap.get(target);
    if (t) {
      clearTimeout(t);
      longPressMap.delete(target);
    }
  }

  // --- 初期化 ---
  function init() {
    // add ボタン
    addPersonBtn.addEventListener("click", () => {
      modalInput.value = "";
      openModal(nameModal);
    }, { passive: true });

    // モーダル OK / Cancel
    modalOk.addEventListener("click", () => {
      const name = modalInput.value.trim();
      if (!name) return;
      addIndividual(name);
      closeModal(nameModal);
    });
    modalCancel.addEventListener("click", () => closeModal(nameModal));

    modalInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") modalOk.click();
    });

    // イベントデリゲーション: 削除ボタン（クリック/タッチ）と select の色反映
    // クリックは通常の操作、タッチは長押しで削除確認を出す
    document.addEventListener("click", (e) => {
      const del = e.target.closest(".delete-btn");
      if (del) {
        // クリックで即確認（短押し）
        deleteTarget = del.closest(".individual");
        openModal(deleteModal);
      }
    }, { passive: true });

    if (isTouch) {
      // タッチ開始で長押し開始、タッチ終了でキャンセル
      document.addEventListener("touchstart", (e) => {
        const del = e.target.closest(".delete-btn");
        if (del) startLongPress(del);
      }, { passive: true });

      document.addEventListener("touchend", (e) => {
        const del = e.target.closest(".delete-btn");
        if (del) cancelLongPress(del);
      }, { passive: true });

      // タッチキャンセル（スクロールなど）でもキャンセル
      document.addEventListener("touchmove", (e) => {
        const del = e.target.closest(".delete-btn");
        if (del) cancelLongPress(del);
      }, { passive: true });
    }

    // select の change と input の保存（デバウンス）
    document.addEventListener("change", (e) => {
      if (e.target && e.target.tagName === "SELECT") {
        applySelectColor(e.target);
      }
      saveDebounced();
    }, { passive: true });

    document.addEventListener("input", (e) => {
      // 名前入力など
      saveDebounced();
    }, { passive: true });

    // 削除モーダル操作
    deleteOkBtn.addEventListener("click", () => {
      if (deleteTarget) deleteTarget.remove();
      deleteTarget = null;
      closeModal(deleteModal);
      saveDebounced();
    });
    deleteCancelBtn.addEventListener("click", () => {
      deleteTarget = null;
      closeModal(deleteModal);
    });

    // 印刷（スマホでは非表示にしていることが多いが一応）
    if (printBtn) printBtn.addEventListener("click", () => window.print(), { passive: true });

    // 復元モーダル
    if (restoreBtn) {
      restoreBtn.addEventListener("click", () => openModal(restoreModal), { passive: true });
      restoreCancelBtn.addEventListener("click", () => closeModal(restoreModal));
    }

    // コピー（クリップボード）: フォールバックあり
    if (copyDataBtn) {
      copyDataBtn.addEventListener("click", async () => {
        const data = localStorage.getItem("shiftData") || "[]";
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(data);
            alert("コピーしました！");
          } else {
            // フォールバック: prompt でユーザーにコピーしてもらう
            window.prompt("以下をコピーしてください（長押しで選択）", data);
          }
        } catch (err) {
          console.error(err);
          alert("コピーに失敗しました");
        }
      }, { passive: true });
    }

    // 貼り付け（クリップボード）: フォールバックあり
    if (pasteDataBtn) {
      pasteDataBtn.addEventListener("click", async () => {
        try {
          let text = "";
          if (navigator.clipboard && navigator.clipboard.readText) {
            text = await navigator.clipboard.readText();
          } else {
            // フォールバック: prompt でユーザーに貼り付けてもらう
            text = window.prompt("貼り付けるデータを入力してください（JSON形式）", "");
            if (text === null) throw new Error("キャンセル");
          }
          const parsed = JSON.parse(text);
          if (!Array.isArray(parsed)) throw new Error("形式不正");
          localStorage.setItem("shiftData", JSON.stringify(parsed));
          personContainer.querySelectorAll(".individual").forEach(n => n.remove());
          isRestoring = true;
          parsed.forEach(item => addIndividual(item.name || "", item.days || null));
          isRestoring = false;
          alert("貼り付けました！復元しました");
        } catch (err) {
          console.error(err);
          alert("データが正しくありません");
        }
      }, { passive: true });
    }

    // 初回ロード
    loadData();

    // 追加: タップ操作で選択肢が小さく感じる場合、select をタップしやすくするために
    // iOS/Android のネイティブピッカーを使うのが最も使いやすいので、JS側では特に変更しない。
  }

  // DOMContentLoaded で初期化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
