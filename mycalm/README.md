# MyCalm MVP

시험불안 완화·취침 루틴을 돕는 청소년용 웹앱 MVP입니다.  
**Vanilla HTML / CSS / JavaScript**만 사용하며, 별도 빌드 도구 없이 브라우저에서 바로 실행할 수 있습니다.

## 이번 작업 요약 (2026-07-10)

### 주요 내용
- 기술명세서 기준으로 Vanilla HTML/CSS/JS MVP 전체 구현
- 5개 화면: 홈, 호흡 세션(4-7-8), Sleep Stories, 오늘의 루틴, 학부모 리포트
- 공통 데이터 계층 `js/storage.js` — `localStorage` (`mycalm_activity_log`)로 활동·스트릭 관리
- 홈: 시간대별 인사, 연속 이용 스트릭, 수능 D-Day(`2026-11-19`) 표시
- 호흡: 19초 사이클 애니메이션 + 5분 타이머, 완료 시 기록
- Sleep Stories: 샘플 오디오 3개, **끝까지 재생 시에만** 기록
- 루틴: 체크리스트·취침 시간·브라우저 로컬 알림
- 학부모 리포트: 4자리 PIN(최초 설정) + 주간 이용 일수·평균 취침·스트릭만 노출
- 모바일 우선 반응형 CSS (소프트 라벤더·페일 블루 팔레트)
- **전체 페이지 배경 슬라이드쇼**: 안개 숲 이미지 2장(`assets/bg/`)을 `background-size: cover`로 반응형 적용, **60초마다** 교차 페이드 (`js/background.js`)
- 텍스트 가독성을 위해 라벤더 톤 반투명 오버레이(veil) 추가

### 오류 수정 / 실행 이슈
| 증상 | 원인 | 해결 |
|---|---|---|
| `사이트에 연결할 수 없음` / `ERR_CONNECTION_REFUSED` | `localhost`로 접속했는데 **로컬 서버가 실행되지 않음** | 프로젝트 폴더에서 `python3 -m http.server 8080` 실행 후 `http://localhost:8080` 접속 |
| (예방) 날짜/스트릭이 UTC로 어긋날 수 있음 | `toISOString()`은 UTC 기준 | `getTodayKey()`로 **로컬 날짜** 키 사용 |
| (예방) 구형 브라우저 호환 | optional chaining(`?.`) | 일반 조건문으로 교체 |
| 어두운 배경 위 텍스트 가독성 저하 가능 | 숲 사진이 어두운 톤 | `.app-bg__veil` 반투명 오버레이로 기존 UI 대비 유지 |

> **입문자 팁:** 브라우저 주소창의 `localhost`는 “내 컴퓨터에서 돌아가는 서버”를 의미합니다. 서버를 켜지 않은 채 `localhost`만 열면 연결 거부 오류가 납니다. 서버 없이 보려면 Finder에서 `index.html`을 더블클릭하세요.  
> 배경이 60초마다 바뀌는지 확인하려면 페이지를 연 채로 잠시 기다려 보세요. 새로고침하면 다시 첫 번째 이미지부터 시작합니다.

## 로컬 실행

1. 이 저장소를 클론하거나 폴더를 엽니다.
2. 터미널에서 프로젝트 폴더로 이동한 뒤 로컬 서버를 켭니다.

```bash
cd goorm-260710-mycalm-v1
python3 -m http.server 8080
```

3. 브라우저에서 **http://localhost:8080** 접속  
4. 서버를 끄려면 터미널에서 `Ctrl + C`

`index.html` 더블클릭으로도 열 수 있지만, 오디오·알림은 로컬 서버 사용을 권장합니다.

## 화면 구성

| 파일 | 기능 |
|---|---|
| `index.html` | 홈 — 인사, 스트릭, 수능 D-Day, 메뉴 |
| `breathing.html` | 4-7-8 호흡 5분 세션 |
| `stories.html` | Sleep Stories 3개 재생 |
| `routine.html` | 오늘의 체크리스트 · 스트릭 · 취침 알림 |
| `parent-report.html` | 학부모 주간 요약 (PIN 보호) |

데이터는 모두 브라우저 `localStorage` (`mycalm_activity_log`)에만 저장됩니다. 서버로 전송되지 않습니다.

## 한계 안내

- **학부모 PIN**: 우발적 열람 방지 수준입니다. 진짜 보안·계정 분리가 아닙니다.
- **취침 알림**: 브라우저 탭이 열려 있을 때만 동작합니다. iOS Safari는 제약이 큽니다.
- **Sleep Stories 오디오**: `assets/audio/story01~03.wav`는 데모용 짧은 톤입니다. 실제 내레이션 mp3/wav로 교체한 뒤 `js/stories.js`의 `storyList` 제목·러닝타임을 수정하세요.
- **수능 D-Day**: `index.html`에 `2026-11-19`로 하드코딩되어 있습니다. 필요 시 날짜를 바꾸세요.

## GitHub Pages 배포

1. 이 저장소에 코드를 push합니다. ([junsang-dong/goorm-260710-mycalm-v1](https://github.com/junsang-dong/goorm-260710-mycalm-v1))
2. **Settings → Pages → Branch**를 `main`, 폴더를 `/ (root)`로 지정합니다.
3. 발급 URL (`https://junsang-dong.github.io/goorm-260710-mycalm-v1/`)로 접속합니다.

프로젝트 루트에 `index.html`이 있어야 Pages에서 바로 열립니다.

## 폴더 구조

```
├── index.html
├── breathing.html
├── stories.html
├── routine.html
├── parent-report.html
├── css/style.css
├── js/
│   ├── storage.js
│   ├── background.js
│   ├── breathing.js
│   ├── stories.js
│   ├── routine.js
│   └── parent-report.js
├── assets/
│   ├── audio/
│   ├── bg/          # 전체 페이지 배경 (60초 교차)
│   └── icons/
└── doc/
```

기술 명세는 `doc/SPEC mycalm_tech_spec_vanilla_htmlcssjs by Jun.md`를 참고하세요.
