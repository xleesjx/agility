# 염포초 민첩성 게임

웹캠과 MediaPipe 자세 인식으로, 화면에 나타나는 타겟을 손이나 발로 터치하는 체육 수업용 게임입니다.

- **게임 주소 (GitHub Pages):** https://xleesjx.github.io/agility/
- **기록 시트 웹앱:** `index.html` 의 `SHEET_WEBAPP_URL`

## 폴더 구성

| 경로 | 내용 |
|---|---|
| `index.html` | 게임 (HTML 한 파일) |
| `apps-script/Code.gs` | 구글 시트 기록 저장 · 순위표 (Apps Script) |
| `apps-script/appsscript.json` | Apps Script 설정 (웹앱: 나로 실행, 모든 사용자 접근) |
| `apps-script/.clasp.json` | 연결할 Apps Script 프로젝트 ID |
| `.github/workflows/deploy-apps-script.yml` | `apps-script/` 가 바뀌면 자동으로 Apps Script 배포 |

## Apps Script 자동 배포 설정 (처음 한 번만)

`apps-script/` 폴더를 고쳐서 main 에 올리면 GitHub Actions 가 Apps Script 에 코드를 올리고
**같은 웹앱 주소 그대로** 새 버전으로 배포합니다. 이를 위해 처음 한 번 아래 설정이 필요합니다.

1. **Apps Script API 켜기**
   https://script.google.com/home/usersettings 에서 "Google Apps Script API" 를 **사용**으로 바꿉니다.

2. **스크립트 ID 넣기**
   시트 → 확장 프로그램 → Apps Script → 왼쪽 ⚙️ **프로젝트 설정** → **스크립트 ID** 복사 →
   `apps-script/.clasp.json` 의 `SCRIPT_ID_HERE` 자리에 넣습니다.

3. **clasp 로그인 정보 만들기** (Node.js 가 설치된 PC에서)
   ```bash
   npx @google/clasp@2.4.2 login
   ```
   브라우저에서 구글 계정으로 허용하면 홈 폴더에 `.clasprc.json` 파일이 생깁니다.
   - Windows: `C:\Users\<사용자이름>\.clasprc.json`
   - Mac: `~/.clasprc.json`

4. **GitHub 에 등록**
   저장소 → Settings → Secrets and variables → Actions → **New repository secret**
   - Name: `CLASPRC_JSON`
   - Secret: `.clasprc.json` 파일 내용 전체

   ⚠️ 이 파일은 구글 계정 열쇠와 같으니 **채팅이나 파일로 공유하지 말고** Secret 에만 넣으세요.

설정 후에는 Actions 탭의 "Apps Script 배포" → **Run workflow** 로 한 번 실행해 확인할 수 있습니다.
