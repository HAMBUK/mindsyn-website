# MindSyn - 회사 웹사이트

## 개요
MindSyn은 Brain-Inspired AI 기술을 개발하는 스타트업의 공식 웹사이트입니다.

## 파일 구조
```
mindsyn-website/
├── index.html          # 메인 HTML 파일
├── styles.css          # 스타일시트
├── script.js           # JavaScript 파일
├── images/             # 이미지 폴더
│   ├── logo.png        # 메인 로고 (가로형)
│   ├── logo-vertical.png # 세로형 로고
│   └── chip.png        # 칩 이미지
├── documents/          # 문서 폴더
│   ├── paper.pdf       # 논문 (MindSyn_Paper.pdf)
│   └── poster.pptx     # 포스터 (BCL_SUNY Research Challenge)
├── resources/          # 원본 리소스 폴더
│   ├── MindSyn_01_로고.png
│   ├── MindSyn_04_관련이미지1.png
│   ├── MindSyn_Paper.pdf
│   └── BCL_SUNY Research Challenge Poster.pptx
└── README.md
```

## ✅ 완료된 설정

### 이미지 파일 ✓
- ✅ `images/logo.png` - MindSyn 로고 (네비게이션 바)
- ✅ `images/chip.png` - 뇌 기반 칩 이미지 (Hero 섹션)
- ✅ `images/logo-vertical.png` - 로고 (About 섹션)

### 문서 파일 ✓
- ✅ `documents/paper.pdf` - 연구 논문
- ✅ `documents/poster.pptx` - 연구 포스터

## 웹사이트 실행 방법

### 로컬 서버로 실행 (권장)
```bash
cd mindsyn-website
python3 -m http.server 8000
```
그런 다음 브라우저에서 `http://localhost:8000` 접속

### 또는 직접 HTML 파일 열기
```bash
cd mindsyn-website
xdg-open index.html  # Linux
```

## Google Sites로 이전하기

### 방법 1: HTML 직접 임베드
1. Google Sites 접속 (sites.google.com)
2. 새 사이트 만들기
3. "삽입" > "임베드" 선택
4. HTML 코드 붙여넣기

### 방법 2: 콘텐츠 복사
Google Sites는 사용자 정의 HTML/CSS를 제한적으로 지원하므로, 
다음 방법으로 콘텐츠를 이전하는 것을 권장합니다:

1. **섹션별로 페이지 생성**
   - Home
   - About
   - Technology
   - Research
   - Team
   - Contact

2. **이미지 업로드**
   - Google Sites에 이미지를 직접 업로드
   - 각 섹션에 맞게 배치

3. **텍스트 콘텐츠 복사**
   - index.html의 텍스트를 섹션별로 복사하여 붙여넣기

4. **디자인 조정**
   - Google Sites의 테마를 파란색/보라색 계열로 설정
   - 그라데이션 효과는 이미지로 대체

### 방법 3: 외부 호스팅 + Google Sites 링크
1. GitHub Pages, Netlify, Vercel 등에 이 웹사이트 호스팅
2. Google Sites를 랜딩 페이지로 사용하고 메인 사이트로 연결

## 웹사이트 섹션 설명

### 1. Home (Hero)
- 회사 로고와 슬로건
- "BRAIN INSPIRED" 태그라인
- 칩 이미지
- CTA 버튼

### 2. About
- 회사 소개
- 미션과 비전
- 핵심 통계 (에너지 효율, 실시간 처리, Edge AI)

### 3. Technology
- Spiking Neural Networks
- Event-Driven Computing
- Deep Learning Optimization
- Edge AI Solutions

### 4. Applications
- 컴퓨터 비전
- 의료 AI
- 자율주행
- 로보틱스
- IoT & 스마트 센서
- 뇌-컴퓨터 인터페이스

### 5. Research
- 논문 및 연구 성과
- 포스터

### 6. Team
- 창업자 및 팀 소개

### 7. Contact
- 연락처 정보
- 문의 폼

## 커스터마이징

### 색상 변경
`styles.css` 파일의 `:root` 섹션에서 색상 변경:
```css
:root {
    --primary-color: #00D4FF;    /* 메인 컬러 (청록색) */
    --secondary-color: #5B4DFF;  /* 보조 컬러 (보라색) */
    --dark-bg: #0A0E27;          /* 다크 배경 */
}
```

### 콘텐츠 수정
`index.html` 파일에서 텍스트 내용 수정

### 추가 기능
- 팀 멤버 추가
- 블로그 섹션
- 뉴스레터 구독
- 소셜 미디어 링크

## 브라우저 호환성
- Chrome (권장)
- Firefox
- Safari
- Edge

## 라이선스
© 2024 MindSyn. All rights reserved.
