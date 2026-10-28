# Table Clipper Pro (표 원클릭 엑셀/마크다운 변환기)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)
![Manifest](https://img.shields.io/badge/Manifest-V3-success.svg?style=for-the-badge)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-informational.svg?style=for-the-badge&logo=googlechrome)
![License](https://img.shields.io/badge/License-MIT-brightgreen.svg?style=for-the-badge)

<br/>

**웹페이지의 모든 표(`<table>`)를 감지하여 엑셀(CSV), 구글 시트(TSV), 노션/AI용 마크다운(Markdown)으로 즉시 변환·추출하는 스마트 브라우저 생산성 도구입니다.**

</div>

---

## 👨‍💻 Developer Information (개발자 정보)

| 항목 | 내용 |
| :--- | :--- |
| **Developer** | **cybereun** |
| **GitHub** | [@cybereun](https://github.com/cybereun) |
| **Repository** | [table-clipper-pro](https://github.com/cybereun/table-clipper-pro) |
| **Tech Stack** | Chrome Extension (Manifest V3), JavaScript (Pure Content Script), Web Components (Shadow DOM) |

---

## ✨ 핵심 기능 및 특징

### 1. 📥 한글 깨짐 방지 엑셀 (CSV) 저장
- 일반 CSV 다운로드 시 Windows Excel에서 발생하는 한글 자모 깨짐(외계어) 현상을 **UTF-8 BOM(`\uFEFF`) 바이트 주입 알고리즘**으로 100% 방지합니다.
- 셀 내 따옴표(`"`) 이스케이프 및 안전한 데이터 파싱을 지원합니다.

### 2. 📋 스프레드시트/문서 즉시 붙여넣기 (시트용 복사)
- 탭(`\t`) 구분 TSV 표준 규격으로 클립보드에 복사됩니다.
- 엑셀, 구글 스프레드시트, 노션, 한글(HWP) 문서에 별도 파일 저장 없이 **`Ctrl + V`** 한 번으로 셀 행과 열이 정확하게 입력됩니다.

### 3. 📝 AI 프롬프트 & 노션용 마크다운 (Markdown) 표 변환
- 표 데이터를 정규화된 마크다운 테이블 문법(`| Header |`, `| --- |`)으로 변환하여 클립보드에 복사합니다.
- ChatGPT, Claude, Gemini 등 LLM에게 표 데이터 기반 분석을 요청하거나 노션/옵시디언 문서에 정리할 때 매우 유용합니다.

### 4. 🧩 rowspan & colspan 2차원 매트릭스 보정 알고리즘
- 공공기관, 통계자료, 대학 입시 요강 등 복잡한 **셀 병합(`colspan`, `rowspan`)**이 적용된 표도 열이 밀리지 않도록 2차원 좌표 매트릭스를 추적하여 정확하게 정렬합니다.
- 셀 내부 줄바꿈(`\n`)이나 다중 공백을 자동으로 정돈하여 데이터 왜곡을 방지합니다.

### 5. 🛡️ Shadow DOM 기반 UI 격리 레이어
- 웹페이지 본문의 복잡한 외부 CSS/스타일시트의 영향을 받지 않도록 플로팅 툴바가 **Shadow DOM(`attachShadow`)** 환경에 캡슐화되어 렌더링됩니다.
- 네이버, 정부 공공포털, 대학 사이트 등 어떤 웹사이트에서도 버튼 디자인이 깨지지 않고 견고하게 작동합니다.

### 6. ⚡ 원클릭 단축키 및 전원 제어
- 단축키 **`Alt + T`** 또는 브라우저 툴바 아이콘을 클릭하여 언제든 간편하게 기능을 켜고(`ON`) 끌(`OFF`) 수 있습니다.
- 불필요한 레이아웃용 단일 셀 표는 무시하고 실제 데이터가 존재하는 2행 이상의 표만 감지합니다.

---

## 🛠️ 설치 및 사용 방법

### 크롬 브라우저에 직접 설치하기 (개발자 모드)
1. GitHub 저장소의 최신 Release에서 **`table-clipper-pro-v1.0.0.zip`** 파일을 다운로드하고 압축을 해제합니다.
2. Chrome 브라우저 주소창에 `chrome://extensions`를 입력하여 확장 프로그램 관리 페이지로 이동합니다.
3. 우측 상단의 **[개발자 모드]** 토글 스위치를 활성화합니다.
4. 좌측 상단의 **[압축해제된 확장 프로그램을 로드합니다]** 버튼을 클릭합니다.
5. 압축을 해제한 `table-clipper-extension` 폴더를 선택합니다.
6. 표가 포함된 웹페이지로 이동 후 표에 마우스를 올리면 파란 테두리와 함께 플로팅 툴바가 표시됩니다!

---

## 📂 프로젝트 구조

```plaintext
table-clipper-extension/
├── manifest.json       # Manifest V3 설정 및 권한 명세
├── background.js      # 단축키(Alt+T) 및 아이콘 클릭 시 기능 ON/OFF 토글
├── content.js         # 표 감지, Shadow DOM 툴바 렌더링, CSV/TSV/MD 변환 엔진
├── icons/
│   └── icon128.png    # 128x128 확장 프로그램 아이콘
└── README.md          # 프로젝트 문서 및 사용 가이드
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
