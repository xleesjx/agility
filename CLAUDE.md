# 프로젝트 메모

- 염포초 체육 수업용 민첩성 게임. 사용자는 교사이며 한국어로 소통.
- `index.html`: 게임 전체(HTML/CSS/JS 한 파일). GitHub Pages(main 루트)로 서비스됨.
  - 판정·점수 로직(sweepHit, isValidPlayPose, nextStimulus 등)은 사용자가 명시적으로 요청하지 않는 한 바꾸지 않는다. UI 수정 위주.
  - `SHEET_WEBAPP_URL` = Apps Script 웹앱 /exec 주소 (저장 POST + `?format=json` 순위 + 순위 페이지).
- `apps-script/`: 구글 시트에 붙은 Apps Script. main 에 push 하면 `.github/workflows/deploy-apps-script.yml` 이 clasp 로 push + 기존 배포 ID 갱신(주소 유지).
  - 순위는 학생(학반+이름)별 최고 점수 기준. 시트 열: 저장 시각, 학반, 이름, 종목, 점수, 평균 반응시간, 성공률.
- 변경 후 Playwright 로 화면 확인(결과 창은 script.google.com 요청을 route 로 모킹해 테스트).
