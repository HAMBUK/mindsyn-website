# MindSyn 웹사이트 재배포 가이드

## 변경 사항 요약

### 1. 언어 전환 기능 추가
- 네비게이션 바 우측에 언어 전환 버튼 추가 (한국어/English)
- 🌐 아이콘과 현재 언어 표시
- 클릭하면 페이지 전체가 한국어 ↔ 영어로 전환

### 2. Demo 섹션 추가
- 새로운 Demo 섹션이 Product와 Technology 사이에 추가됨
- resources 폴더의 3개 영상 임베드:
  - MindCore-MNIST.mp4 (MNIST 손글씨 인식)
  - MindCore-NMNIST.mp4 (N-MNIST 이벤트 기반 인식)
  - MindCore-ADFTD.mp4 (ADFTD 시계열 데이터 분석)
- 각 영상마다 한국어/영어 설명 제공

## 재배포 방법

현재 웹사이트가 GitHub Pages로 호스팅되어 있다고 가정합니다.

### Option 1: GitHub를 통한 배포 (권장)

#### 1단계: Git 저장소 확인
```bash
cd ~/mindsyn-website
git status
```

#### 2단계: 변경사항 추가 및 커밋
```bash
# 모든 변경사항 추가
git add index.html styles.css script.js

# 커밋 메시지 작성
git commit -m "Add language switcher and Demo section with videos"

# 만약 resources 폴더의 영상도 처음 추가하는 경우
git add resources/*.mp4
git commit -m "Add demo videos"
```

#### 3단계: GitHub에 푸시
```bash
git push origin main
# 또는 브랜치가 master인 경우
# git push origin master
```

#### 4단계: GitHub Pages 설정 확인
1. GitHub 저장소 페이지 접속
2. Settings → Pages 메뉴
3. Source가 올바른 브랜치(main 또는 master)로 설정되어 있는지 확인
4. 보통 5-10분 후 자동으로 배포됨

### Option 2: 직접 웹 서버에 업로드

FTP/SFTP 또는 웹 호스팅 서비스를 사용하는 경우:

```bash
# 변경된 파일들을 서버에 업로드
# - index.html
# - styles.css
# - script.js

# FTP 예시 (lftp 사용)
lftp -u username,password ftp.yourserver.com
cd public_html
mput index.html styles.css script.js
bye
```

### Option 3: 로컬에서 테스트

배포 전 로컬에서 테스트하려면:

```bash
cd ~/mindsyn-website

# Python 3가 설치되어 있는 경우
python3 -m http.server 8000

# 또는 Python 2
python -m SimpleHTTPServer 8000

# 브라우저에서 접속
# http://localhost:8000
```

### Option 4: VS Code Live Server 사용

1. VS Code에서 index.html 파일 열기
2. 우클릭 → "Open with Live Server" 선택
3. 자동으로 브라우저가 열리며 실시간으로 변경사항 확인 가능

## 배포 후 확인사항

### ✅ 체크리스트

1. **언어 전환 기능**
   - [ ] 네비게이션 바에 🌐 한국어/English 버튼이 보이는가?
   - [ ] 버튼 클릭 시 페이지 텍스트가 변경되는가?
   - [ ] Hero 섹션, About 섹션 텍스트가 번역되는가?

2. **Demo 섹션**
   - [ ] Demo 섹션이 올바른 위치에 표시되는가?
   - [ ] 3개 영상이 모두 정상적으로 로드되는가?
   - [ ] 영상 재생이 잘 되는가?
   - [ ] 각 영상의 설명이 언어 전환 시 변경되는가?

3. **반응형 디자인**
   - [ ] 모바일에서 네비게이션 메뉴가 정상 작동하는가?
   - [ ] 데모 영상이 모바일에서도 잘 보이는가?
   - [ ] 언어 전환 버튼이 모바일에서도 접근 가능한가?

4. **브라우저 호환성**
   - [ ] Chrome/Edge에서 정상 작동
   - [ ] Firefox에서 정상 작동
   - [ ] Safari에서 정상 작동

## 문제 해결

### 영상이 재생되지 않는 경우

1. **파일 경로 확인**
   ```bash
   ls -la ~/mindsyn-website/resources/*.mp4
   ```
   영상 파일이 올바른 위치에 있는지 확인

2. **MIME 타입 설정** (웹 서버 설정)
   - Apache의 경우 .htaccess 파일에 추가:
   ```
   AddType video/mp4 .mp4
   ```

3. **파일 크기 확인**
   - 영상 파일이 너무 크면 로딩 시간이 오래 걸림
   - 필요시 영상을 압축하거나 스트리밍 서비스 사용 고려

### 언어 전환이 작동하지 않는 경우

1. **브라우저 콘솔 확인**
   - F12 키를 눌러 개발자 도구 열기
   - Console 탭에서 JavaScript 오류 확인

2. **script.js 로딩 확인**
   - Network 탭에서 script.js가 성공적으로 로드되었는지 확인

3. **캐시 지우기**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

## 추가 개선 사항 (선택사항)

### 더 많은 콘텐츠 번역

현재는 주요 섹션만 번역되어 있습니다. 더 많은 콘텐츠를 번역하려면:

1. HTML 파일에서 번역할 텍스트 찾기
2. `data-ko="한국어 텍스트"` `data-en="English Text"` 속성 추가
3. 언어 전환 시 자동으로 변경됨

### 언어 설정 저장

사용자가 선택한 언어를 기억하도록:

script.js에 추가:
```javascript
// 언어 설정 저장
localStorage.setItem('preferredLang', currentLang);

// 페이지 로드 시 저장된 언어 불러오기
window.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('preferredLang');
    if (savedLang && savedLang !== currentLang) {
        switchLanguage();
    }
});
```

### 영상 최적화

데모 영상의 로딩 속도를 개선하려면:

1. **압축**: FFmpeg를 사용하여 파일 크기 줄이기
   ```bash
   ffmpeg -i input.mp4 -vcodec libx264 -crf 28 output.mp4
   ```

2. **썸네일 생성**: poster 속성 추가
   ```html
   <video controls preload="metadata" poster="thumbnail.jpg">
   ```

3. **CDN 사용**: 큰 파일은 YouTube나 Vimeo에 업로드 후 임베드

## 지원

문제가 발생하면 다음을 확인하세요:
- 브라우저 개발자 도구 (F12)
- 웹 서버 로그
- GitHub Pages 빌드 로그 (GitHub Actions 탭)

배포 성공을 축하합니다! 🎉
