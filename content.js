// content.js
let isEnabled = true;
let activeTable = null;
let toolbarHost = null;
let shadowRoot = null;
let hideTimeout = null;

// 1. 초기 상태 불러오기 및 실시간 토글 수신
chrome.storage.local.get({ tableClipperEnabled: true }, (data) => {
  isEnabled = data.tableClipperEnabled;
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "TOGGLE_TABLE_CLIPPER") {
    isEnabled = msg.isEnabled;
    if (!isEnabled) hideToolbar();
  }
});

// 2. Shadow DOM 기반 플로팅 툴바 초기화 (외부 CSS 오염 완벽 차단)
function initToolbar() {
  if (toolbarHost) return;

  toolbarHost = document.createElement('div');
  toolbarHost.id = 'table-clipper-pro-host';
  toolbarHost.style.cssText = 'position: absolute; z-index: 2147483647; display: none; top: 0; left: 0;';

  shadowRoot = toolbarHost.attachShadow({ mode: 'open' });
  shadowRoot.innerHTML = `
    <style>
      .tc-container {
        display: flex;
        gap: 6px;
        background: #1E293B;
        padding: 6px 10px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        font-family: -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif;
        align-items: center;
        border: 1px solid #334155;
      }
      .tc-btn {
        background: #2563EB;
        color: #FFFFFF;
        border: none;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
        white-space: nowrap;
      }
      .tc-btn:hover { background: #1D4ED8; }
      .tc-btn.secondary { background: #10B981; }
      .tc-btn.secondary:hover { background: #059669; }
      .tc-btn.tertiary { background: #6366F1; }
      .tc-btn.tertiary:hover { background: #4F46E5; }
      .tc-toast {
        color: #38BDF8;
        font-size: 12px;
        font-weight: 600;
        margin-left: 4px;
        display: none;
      }
    </style>
    <div class="tc-container">
      <button class="tc-btn" id="btn-csv" title="한글 깨짐 없는 엑셀 CSV 파일 저장">📥 엑셀(CSV) 저장</button>
      <button class="tc-btn secondary" id="btn-excel-copy" title="엑셀/구글시트에 바로 Ctrl+V 할 수 있게 복사">📋 시트용 복사</button>
      <button class="tc-btn tertiary" id="btn-md" title="노션/옵시디언/AI 프롬프트용 마크다운 표 복사">📝 마크다운 복사</button>
      <span class="tc-toast" id="tc-toast"></span>
    </div>
  `;

  document.body.appendChild(toolbarHost);

  // 툴바 위에 마우스가 있을 때는 사라지지 않게 유지
  toolbarHost.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
  toolbarHost.addEventListener('mouseleave', () => scheduleHideToolbar());

  // 버튼 이벤트 바인딩
  shadowRoot.getElementById('btn-csv').addEventListener('click', () => handleExport('csv'));
  shadowRoot.getElementById('btn-excel-copy').addEventListener('click', () => handleExport('tsv'));
  shadowRoot.getElementById('btn-md').addEventListener('click', () => handleExport('md'));
}

// 3. 마우스 오버 시 유효한 데이터 표(<table>) 감지
document.addEventListener('mouseover', (e) => {
  if (!isEnabled) return;
  const table = e.target.closest('table');

  // 레이아웃용 빈 표를 걸러내기 위해 최소 2행 이상인 표만 타겟팅
  if (table && table.rows && table.rows.length >= 2) {
    clearTimeout(hideTimeout);
    if (activeTable !== table) {
      if (activeTable) activeTable.style.outline = '';
      activeTable = table;
    }
    showToolbar(table);
  }
}, true);

document.addEventListener('mouseout', (e) => {
  if (!isEnabled || !activeTable) return;
  if (e.target.closest('table') === activeTable) {
    scheduleHideToolbar();
  }
}, true);

function showToolbar(table) {
  initToolbar();
  const rect = table.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  // 표 테두리 하이라이트 표시
  table.style.outline = '2px solid #2563EB';
  table.style.outlineOffset = '2px';

  // 표 우측 상단에 툴바 위치 고정
  toolbarHost.style.display = 'block';
  const topPos = Math.max(scrollTop + rect.top - 40, scrollTop + 5);
  const leftPos = scrollLeft + rect.left;

  toolbarHost.style.top = `${topPos}px`;
  toolbarHost.style.left = `${leftPos}px`;
}

function scheduleHideToolbar() {
  hideTimeout = setTimeout(() => hideToolbar(), 350);
}

function hideToolbar() {
  if (activeTable) {
    activeTable.style.outline = '';
    activeTable = null;
  }
  if (toolbarHost) {
    toolbarHost.style.display = 'none';
  }
}

// 4. 핵심 알고리즘: 병합된 셀(rowspan, colspan)까지 정확히 보정하는 2차원 배열 파서
function parseTableToMatrix(table) {
  const matrix = [];
  const rows = Array.from(table.querySelectorAll('tr'));

  rows.forEach((tr, rowIndex) => {
    if (!matrix[rowIndex]) matrix[rowIndex] = [];
    let colIndex = 0;

    Array.from(tr.children).forEach((cell) => {
      if (cell.tagName !== 'TD' && cell.tagName !== 'TH') return;

      // 이전 행의 rowspan으로 인해 이미 채워진 칸 건너뛰기
      while (matrix[rowIndex][colIndex] !== undefined) {
        colIndex++;
      }

      // 셀 내부 줄바꿈 및 불필요한 공백 정리
      const cleanText = (cell.innerText || cell.textContent || '')
        .replace(/\r?\n|\r/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const rowspan = parseInt(cell.getAttribute('rowspan') || 1, 10);
      const colspan = parseInt(cell.getAttribute('colspan') || 1, 10);

      for (let r = 0; r < rowspan; r++) {
        for (let c = 0; c < colspan; c++) {
          if (!matrix[rowIndex + r]) matrix[rowIndex + r] = [];
          // 병합된 첫 번째 셀에만 값을 넣고 나머지는 빈칸(또는 동일값) 처리하여 열 밀림 방지
          matrix[rowIndex + r][colIndex + c] = (r === 0 && c === 0) ? cleanText : '';
        }
      }
      colIndex += colspan;
    });
  });

  return matrix.filter(row => row && row.some(cell => cell !== ''));
}

// 5. 포맷별 변환 및 다운로드/복사 실행
async function handleExport(format) {
  if (!activeTable) return;
  const matrix = parseTableToMatrix(activeTable);
  if (matrix.length === 0) return;

  if (format === 'csv') {
    const csvContent = matrix.map(row =>
      row.map(cell => `"${(cell ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\r\n');

    // 핵심: \uFEFF (UTF-8 BOM) 추가로 윈도우 엑셀 한글 깨짐 완벽 방지
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    a.href = url;
    a.download = `table-data-${timestamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('엑셀 파일 저장 완료!');

  } else if (format === 'tsv') {
    // 엑셀이나 구글 시트에 바로 붙여넣기(Ctrl+V) 할 때는 탭(\t) 구분자가 표준
    const tsvContent = matrix.map(row => row.join('\t')).join('\n');
    await navigator.clipboard.writeText(tsvContent);
    showToast('시트 붙여넣기용 복사 완료!');

  } else if (format === 'md') {
    // 마크다운 표 생성 (노션, 옵시디언, AI 프롬프트 입력용)
    const maxCols = Math.max(...matrix.map(r => r.length));
    const normalized = matrix.map(r => {
      const copy = [...r];
      while (copy.length < maxCols) copy.push('');
      return copy.map(c => (c ?? '').replace(/\|/g, '\\|'));
    });

    const header = `| ${normalized[0].join(' | ')} |`;
    const divider = `| ${normalized[0].map(() => '---').join(' | ')} |`;
    const body = normalized.slice(1).map(r => `| ${r.join(' | ')} |`).join('\n');
    const mdContent = [header, divider, body].join('\n');

    await navigator.clipboard.writeText(mdContent);
    showToast('마크다운 복사 완료!');
  }
}

function showToast(message) {
  const toast = shadowRoot.getElementById('tc-toast');
  toast.textContent = `✓ ${message}`;
  toast.style.display = 'inline';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2000);
}
