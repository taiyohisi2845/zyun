// script.js（アニメーション対応版）
(() => {
  'use strict';

  // 要素参照
  const modal = document.getElementById("nameModal");
  const modalInput = document.getElementById("modalNameInput");
  const modalOk = document.getElementById("modalOkBtn");
  const modalCancel = document.getElementById("modalCancelBtn");
  const addPersonBtn = document.getElementById("addPersonBtn");
  const personContainer = document.getElementById("personContainer");
  const deleteModal = document.getElementById("deleteModal");
  const deleteOkBtn = document.getElementById("deleteOkBtn");
  const deleteCancelBtn = document.getElementById("deleteCancelBtn");
  const printBtn = document.getElementById("printBtn");
  const restoreBtn = document.getElementById("restoreBtn");
  const restoreModal = document.getElementById("restoreModal");
  const copyDataBtn = document.getElementById("copyDataBtn");
  const pasteDataBtn = document.getElementById("pasteDataBtn");
  const restoreCancelBtn = document.getElementById("restoreCancelBtn");

  // 状態
  let deleteTarget = null;
  let isRestoring = false;

  // ユーティリティ: 安全にHTMLエスケープ（名前に特殊文字が入っても安全）
  const escapeHtml = (str) => {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // モーダル表示（追加ボタン）
  addPersonBtn.addEventListener('click', () => {
    modal.style.display = "block";
    modalInput.value = "";
    setTimeout(() => modalInput.focus(), 10);
  });

  // モーダル外クリックで閉じる
  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) m.style.display = 'none';
    });
    const content = m.querySelector('.modal-content');
    if (content) content.addEventListener('click', e => e.stopPropagation());
  });

  // チェックの色を適用する共通関数
  function applyColorToCheck(selectEl) {
    if (!selectEl) return;
    const val = selectEl.value;
    if (val === '〇') selectEl.style.color = 'red';
    else if (val === '✕') selectEl.style.color = '#0088ff';
    else if (val === '△') selectEl.style.color = '#ff8800';
    else selectEl.style.color = 'black';
  }

  // 個別枠追加（復元にも使う）
  function addIndividual(name, days = null, animate = true) {
    const container = personContainer;
    const safeName = escapeHtml(name || '');

    const html = `
      <div class="individual">
        <div class="top-row">
          <input type="text" class="name-input" value="${safeName}">
          <button class="delete-btn" type="button">削除</button>
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
                    <option value="ー">ー</option>
                    <option value="〇">〇</option>
                    <option value="✕">✕</option>
                    <option value="△">△</option>
                  </select>

                  <select class="time-select">
                    <option value="">--</option>
                    <option>08:30</option>
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

                  <select class="time-select">
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
            `).join('')}
          </tr>
        </table>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", html);
    const ind = container.lastElementChild;
    if (!ind) return;

    // 追加アニメーションを付与
    if (animate) {
      ind.classList.add('item-enter');
      // アニメーション終了後にクラスを除去しておく
      ind.addEventListener('animationend', function handler() {
        ind.classList.remove('item-enter');
        ind.removeEventListener('animationend', handler);
      });
    }

    // days がある場合（復元）
    if (Array.isArray(days)) {
      const cells = ind.querySelectorAll("td");
      days.slice(0, 7).forEach((d, i) => {
        const selects = cells[i].querySelectorAll("select");
        if (selects[0]) {
          selects[0].value = (d.check !== undefined && d.check !== null) ? String(d.check) : 'ー';
          applyColorToCheck(selects[0]);
        }
        if (selects[1]) selects[1].value = d.start || '';
        if (selects[2]) selects[2].value = d.end || '';
      });
    } else {
      ind.querySelectorAll('.check-select').forEach(s => applyColorToCheck(s));
    }
  }

  // モーダル OK → 新しい枠追加
  modalOk.addEventListener('click', () => {
    const name = modalInput.value.trim();
    if (!name) return;
    addIndividual(name, null, true);
    modal.style.display = "none";
  });

  modalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') modalOk.click();
  });

  modalCancel.addEventListener('click', () => {
    modal.style.display = "none";
  });

  // 色反映
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t && t.tagName === 'SELECT') {
      if (t.classList.contains('check-select')) {
        applyColorToCheck(t);
      }
    }
  });

  // 印刷
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
      window.print();
    });
  }

  // 削除ボタン（イベント委譲）
  document.addEventListener('click', (e) => {
    const el = e.target;
    if (el && el.classList && el.classList.contains('delete-btn')) {
      deleteTarget = el.closest('.individual');
      if (deleteTarget) {
        deleteModal.style.display = 'block';
      }
    }
  });

  deleteOkBtn.addEventListener('click', () => {
    if (deleteTarget) {
      // 削除アニメーションを付与してから DOM から削除
      deleteTarget.classList.add('item-exit');
      // アニメーション終了後に要素を削除し、保存を行う
      deleteTarget.addEventListener('animationend', function handler() {
        if (deleteTarget && deleteTarget.parentNode) {
          deleteTarget.parentNode.removeChild(deleteTarget);
        }
        deleteTarget.removeEventListener('animationend', handler);
        deleteTarget = null;
        saveData(); // 削除後に確実に保存
      });
    }
    deleteModal.style.display = 'none';
  });

  deleteCancelBtn.addEventListener('click', () => {
    deleteTarget = null;
    deleteModal.style.display = 'none';
  });

  // 保存（完全版）
  function saveData() {
    if (isRestoring) return;
    try {
      const individuals = document.querySelectorAll(".individual");
      const data = [];
      individuals.forEach(ind => {
        const name = ind.querySelector(".name-input")?.value || '';
        const cells = ind.querySelectorAll("td");
        const days = [];
        cells.forEach(cell => {
          const selects = cell.querySelectorAll("select");
          days.push({
            check: selects[0]?.value || 'ー',
            start: selects[1]?.value || '',
            end: selects[2]?.value || ''
          });
        });
        data.push({ name, days: days.slice(0, 7) });
      });
      localStorage.setItem("shiftData", JSON.stringify(data));
    } catch (err) {
      console.error('保存エラー', err);
    }
  }

  document.addEventListener('input', () => saveData());
  document.addEventListener('change', () => saveData());

  // 読み込み（復元）
  function loadData() {
    const saved = localStorage.getItem("shiftData");
    if (!saved) return;
    let parsed;
    try {
      parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return;
    } catch (e) {
      console.error('読み込みエラー: JSON 解析失敗', e);
      return;
    }
    isRestoring = true;
    document.querySelectorAll('.individual').forEach(ind => ind.remove());
    parsed.forEach(item => {
      const name = typeof item.name === 'string' ? item.name : '';
      const days = Array.isArray(item.days) ? item.days.map(d => ({
        check: d && typeof d.check === 'string' ? d.check : 'ー',
        start: d && typeof d.start === 'string' ? d.start : '',
        end: d && typeof d.end === 'string' ? d.end : ''
      })) : null;
      // 復元時はアニメーションを無効にして素早く復元
      addIndividual(name, days, false);
    });
    setTimeout(() => { isRestoring = false; }, 50);
  }

  window.addEventListener('load', loadData);

  // 復元モーダル
  if (restoreBtn) {
    restoreBtn.addEventListener('click', () => {
      restoreModal.style.display = 'block';
    });
  }
  if (restoreCancelBtn) {
    restoreCancelBtn.addEventListener('click', () => {
      restoreModal.style.display = 'none';
    });
  }

  // コピー
  if (copyDataBtn) {
    copyDataBtn.addEventListener('click', async () => {
      try {
        const data = localStorage.getItem("shiftData") || "[]";
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(data);
        } else {
          const ta = document.createElement('textarea');
          ta.value = data;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        alert('コピーしました！');
      } catch (e) {
        console.error('コピー失敗', e);
        alert('コピーに失敗しました');
      }
    });
  }

  // 貼り付け（即復元）
  if (pasteDataBtn) {
    pasteDataBtn.addEventListener('click', async () => {
      try {
        let text = '';
        if (navigator.clipboard && navigator.clipboard.readText) {
          text = await navigator.clipboard.readText();
        } else {
          text = prompt('クリップボードから貼り付けられない環境です。復元用JSONを貼り付けてください。');
          if (text === null) return;
        }
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) throw new Error('不正なデータ形式');
        localStorage.setItem("shiftData", JSON.stringify(parsed));
        alert('貼り付けました！復元します');
        loadData();
      } catch (e) {
        console.error('貼り付け/復元エラー', e);
        alert('データが正しくありません');
      }
    });
  }

  // Esc キーでモーダルを閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal').forEach(m => {
        if (m.style.display === 'block') m.style.display = 'none';
      });
    }
  });

})();
