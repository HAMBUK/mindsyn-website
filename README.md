# MindSyn 웹사이트 리뉴얼 (2026)

`mindsyn.net` 정적 사이트의 리뉴얼 버전입니다. 빌드 도구 없이 순수 HTML/CSS/JS로 되어 있어
파일을 그대로 올리면 배포됩니다.

```
mindsyn-website_new/
├── index.html            # 전체 페이지 (한 페이지, 섹션 앵커)
├── assets/
│   ├── css/styles.css    # 디자인 시스템 + 전 섹션 스타일
│   └── js/
│       ├── visuals.js    # 캔버스 그래픽 (스파이크 래스터, 연산 패브릭 비교)
│       └── main.js       # 내비게이션, 다국어, 스크롤 연출, 라이트박스
├── images/
│   ├── mark.svg          # 로고 심볼을 SVG로 재현 (파비콘 겸용, 무한 확대 가능)
│   ├── wordmark.png      # 워드마크만 잘라낸 로고 (다크 배경에서 invert 처리)
│   └── ...               # 기존 이미지 그대로
├── resources/
│   ├── *.mp4             # 데모 영상 (기존과 동일)
│   ├── poster-*.jpg      # 영상 썸네일 (ffmpeg으로 추출, 자동 재생 없이 지연 로딩)
│   └── MindSyn_Paper.pdf
├── documents/
└── CNAME                 # mindsyn.net
```

## 로컬에서 보기

```bash
cd mindsyn-website_new
python3 -m http.server 8000
# http://localhost:8000
```

`file://`로 직접 열어도 동작하지만, 영상 재생은 로컬 서버를 통해 확인하는 편이 정확합니다.

## 디자인 개요

- **브랜드 모티프**: 로고 심볼 자체가 스파이크 래스터 플롯 모양이라, 이 패턴을 사이트
  전체의 그래픽 언어로 사용했습니다. 히어로 배경은 실제로 뉴런 집단이 발화하는 방식
  (포아송 발화 + 주기적 population burst)으로 그려지는 라이브 래스터입니다.
- **컬러**: 로고에서 그대로 추출한 `#19D1FF → #4C24FF` 그라디언트. 다크 베이스
  `#05070E` 위에서 전 섹션이 같은 톤을 유지하고, 위계는 배경 밝기 대신 반투명
  카드와 헤어라인, 은은한 글로우로 만듭니다.
- **타이포**: Pretendard Variable (CDN). 한글 줄바꿈은 `word-break: keep-all`로
  단어 단위로 끊습니다.
- **모션**: 스크롤 위치에 따라 진행되는 스티키 섹션 두 개 (작동 원리, 칩 스테이지),
  스크롤 리빌, 숫자 카운트업, 마그네틱 버튼. `prefers-reduced-motion`을 켜면
  모든 애니메이션이 멈추고 정적인 레이아웃으로 대체됩니다.

## 콘텐츠 수정하기

### 한국어 / 영어 문구

기본 언어는 **영어**입니다. HTML 본문에 영어가 그대로 들어 있어 JS가 실행되기 전에도,
검색엔진에도 영어가 보입니다. 한국어는 `data-ko` 속성에 담겨 있고 토글을 누르면 교체됩니다.

```html
<p data-ko="한국어 문장" data-en="English sentence">English sentence</p>
```

**문구를 고칠 때는 속성과 본문을 함께 고쳐야 합니다.** 영어는 `data-en`과 본문 두 곳,
한국어는 `data-ko` 한 곳입니다. 한쪽만 고치면 화면과 토글 결과가 어긋납니다.

기본 언어를 바꾸려면 `assets/js/main.js`의 `DEFAULT_LANG`과 HTML 본문 텍스트를 함께 바꾸면
됩니다. 방문자가 토글을 직접 누른 경우에만 `localStorage`(`mindsyn-lang`)에 저장되므로,
누른 적 없는 방문자는 항상 기본 언어를 봅니다.

### 데모 영상 추가

1. `resources/`에 mp4를 넣고, 썸네일을 뽑습니다.
   ```bash
   ffmpeg -ss 12 -i resources/새영상.mp4 -vframes 1 -vf scale=1280:-2 -q:v 4 resources/poster-새영상.jpg
   ```
2. `index.html`의 `.demo-grid` 안에 `.dcard` 블록을 복사해 `data-video`, `data-title`,
   포스터 경로, 문구를 바꿉니다. (카드는 2열 그리드라 짝수 개가 보기 좋습니다.)

### 논문 추가

`index.html`의 `<article class="paper">` 블록을 복사하고, BibTeX는 `<pre class="paper__bib">`
안에 넣은 뒤 버튼의 `data-bib` 값과 `id`를 새로 맞춰 주면 됩니다.

## 배포 (GitHub Pages)

기존 저장소(`HAMBUK/mindsyn-website`)와 동일한 방식입니다.

```bash
cd mindsyn-website_new
git init && git add -A && git commit -m "Site renewal"
git remote add origin https://github.com/HAMBUK/mindsyn-website.git
git push -f origin main        # 기존 사이트를 교체하는 경우
```

`CNAME`이 포함되어 있으므로 커스텀 도메인 설정은 그대로 유지됩니다.
기존 버전은 `../mindsyn-website`에 그대로 남아 있습니다.

## 확인이 필요한 내용

- **ASIC 일정**: 이전 사이트에는 "2026년 상반기 ASIC 제조 / Coming 2026"으로 적혀 있었지만
  이미 지난 시점이라, 날짜 대신 "ASIC 개발 진행 중"으로 표현했습니다 (히어로 배지와
  개발 현황 로드맵). 확정된 일정이 있으면 그 문구로 바꾸시면 됩니다.
- **성능 수치**: 10-100× 에너지 효율, <1ms 지연, 1M 뉴런, <1W 전력은 이전 사이트의 수치를
  그대로 옮긴 것입니다.
- **연구팀 소개**: 이전 사이트의 팀원 소개(`bio`)가 비어 있어 이름과 직함만 표시했습니다.
- **연락처**: `yoonseok.yang@sunykorea.ac.kr` (이전 푸터에 있던 `contact@mindsyn.ai`는
  본문 연락처와 달라서 제외했습니다).
