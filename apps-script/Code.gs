/**
 * 염포초 민첩성 게임 기록용 Apps Script (구글 시트 → 확장 프로그램 → Apps Script 에 붙여 넣기)
 *  - doPost            : 게임에서 보낸 기록을 시트에 한 줄씩 추가
 *  - doGet             : "나의 기록 확인하기" 순위 페이지 (학반 · 이름 · 점수)
 *  - doGet?format=json : 게임 결과 창의 TOP 10 / 내 순위용 데이터
 * 순위는 학생(학반+이름)별 최고 점수 기준입니다.
 */
const SCHOOL_NAME = '염포초';
const SHEET_NAME = '기록';
const HEADERS = ['저장 시각', '학반', '이름', '종목', '점수', '평균 반응시간(ms)', '성공률'];
const PAGE_TITLE = SCHOOL_NAME + ' 민첩성 게임 순위';

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#e8eefc');
    sh.setFrozenRows(1);
  } else if (sh.getRange(1, 2).getValue() === '학번') {
    sh.getRange(1, 2).setValue('학반'); // 예전 머리글 정리
  }
  return sh;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // 여러 학생이 동시에 저장해도 줄이 섞이지 않도록
  try {
    const r = JSON.parse(e.postData.contents);
    getSheet_().appendRow([
      r.timestamp || new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      "'" + String(r.id || '').trim(),   // 학반이 날짜/숫자로 바뀌지 않도록 텍스트로 저장
      String(r.name || '').trim(),
      String(r.exercise || ''),
      Number(r.count) || 0,
      r.rtAvg === '–' ? '' : r.rtAvg,
      r.acc === '–' ? '' : r.acc
    ]);
    return ContentService.createTextOutput('OK');
  } catch (err) {
    return ContentService.createTextOutput('ERROR: ' + err);
  } finally {
    lock.releaseLock();
  }
}

/** 학생별 최고 점수 목록 (점수 내림차순, 같은 점수는 같은 순위) */
function buildBoard_() {
  const values = getSheet_().getDataRange().getDisplayValues().slice(1);
  const best = {};
  values.forEach(v => {
    const c = String(v[1]).trim(), n = String(v[2]).trim();
    if (!n) return;
    const s = Number(v[4]) || 0;
    const key = c.replace(/\s/g, '') + '|' + n;
    if (!best[key] || s > best[key].s) best[key] = { c: c, n: n, s: s };
  });
  const list = Object.keys(best).map(k => best[k]);
  list.sort((a, b) => b.s - a.s || a.c.localeCompare(b.c, 'ko') || a.n.localeCompare(b.n, 'ko'));
  let prev = null, rank = 0;
  list.forEach((r, i) => { if (r.s !== prev) { rank = i + 1; prev = r.s; } r.r = rank; });
  return list;
}

function doGet(e) {
  const list = buildBoard_();

  if (e && e.parameter && e.parameter.format === 'json') {
    return ContentService.createTextOutput(JSON.stringify({ list: list }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = JSON.stringify(list).replace(/</g, '\\u003c');
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${PAGE_TITLE}</title>
<style>
  body{margin:0;font-family:system-ui,"Malgun Gothic","Apple SD Gothic Neo",sans-serif;background:#101b2d;color:#f2f6fb}
  .wrap{max-width:760px;margin:0 auto;padding:24px 16px}
  h1{text-align:center;font-size:32px;margin:8px 0 6px}
  .sub{text-align:center;color:#98a2ab;margin-bottom:18px}
  input{width:100%;box-sizing:border-box;padding:13px 16px;border-radius:14px;border:1px solid #426086;background:#17243a;color:#fff;font-size:17px}
  table{width:100%;border-collapse:collapse;margin-top:14px;background:#17243a;border-radius:16px;overflow:hidden}
  th,td{padding:12px 10px;text-align:center;border-bottom:1px solid #31425c;font-size:19px}
  th{background:#223653;font-size:16px}
  td.sc{font-weight:900;color:#fff3a3}
  tr.r1 td{background:rgba(255,216,74,.16)} tr.r2 td{background:rgba(226,232,240,.1)} tr.r3 td{background:rgba(240,179,126,.13)}
  tr.r1 td,tr.r2 td,tr.r3 td{font-weight:800}
  .empty{color:#98a2ab;padding:36px}
</style></head><body><div class="wrap">
<h1>🏆 ${PAGE_TITLE}</h1>
<div class="sub">학생별 최고 기록 기준</div>
<input id="q" placeholder="학반 또는 이름으로 내 기록 찾기">
<table><thead><tr><th>순위</th><th>학반</th><th>이름</th><th>점수</th></tr></thead>
<tbody id="tb"></tbody></table></div>
<script>
const rows = ${data};
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const medal = r => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : r;
function render(q){
  const list = rows.filter(r => !q || r.c.includes(q) || r.n.includes(q));
  document.getElementById('tb').innerHTML = list.length ? list.map(r =>
    '<tr class="r'+r.r+'"><td>'+medal(r.r)+'</td><td>'+esc(r.c)+'</td><td>'+esc(r.n)+'</td><td class="sc">'+r.s+'점</td></tr>'
  ).join('') : '<tr><td colspan="4" class="empty">기록이 없습니다.</td></tr>';
}
document.getElementById('q').addEventListener('input', e => render(e.target.value.trim()));
render('');
</script></body></html>`;

  return HtmlService.createHtmlOutput(html)
    .setTitle(PAGE_TITLE)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
