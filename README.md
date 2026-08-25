# Unwork Health Absence

제휴 병원의 방문 인증을 학교에 전달해 보건결석 처리를 지원하는 해커톤 MVP입니다. 하나의 저장소에서 Spring Boot API, 학생/병원 서비스 UI, 학교 u-SAINT Mock UI를 관리합니다.

## 프로젝트 구조

```text
.
├─ backend/
│  └─ spring-server/       Spring Boot REST API
├─ frontend/
│  ├─ service/             학생·병원 React 앱
│  └─ school/              학교 u-SAINT Mock React 앱
├─ docs/                   아키텍처, DB, API 문서
├─ docker-compose.yml      PostgreSQL 16
└─ README.md
```

## 사전 준비

- Java 21
- Docker Desktop
- Node.js 20 이상 및 npm

## Backend 실행

저장소 루트에서 PostgreSQL을 시작합니다.

```powershell
docker compose up -d
cd backend\spring-server
.\gradlew.bat clean build
.\gradlew.bat bootRun
```

기본 서버는 `http://localhost:8080`이며 Health Check는 `GET /api/v1/health`입니다.

DB 환경변수:

```text
DB_URL=jdbc:postgresql://localhost:5432/unwork
DB_USERNAME=unwork
DB_PASSWORD=unwork
```

## 학생·병원 Frontend 실행

```bash
cd frontend/service
cp .env.example .env
npm install
npm run dev
```

기본 주소는 `http://localhost:5173`입니다. 해커톤용 Mock 로그인은 `student / 1234`, `hospital / 1234`입니다. 로그인 이후 학생 인증, QR Token, Visit 및 병원 처리 데이터는 Backend API를 사용합니다.

환경변수:

```text
VITE_API_BASE_URL=http://localhost:8080
VITE_HOSPITAL_ID=1
VITE_UNIVERSITY_CODE=SSU
```

## 학교 Frontend 실행

```bash
cd frontend/school
cp .env.example .env
npm install
npm run dev
```

기본 주소는 `http://localhost:5174`입니다.

환경변수:

```text
VITE_API_BASE_URL=http://localhost:8080
VITE_UNIVERSITY_ID=1
```

## 전체 서비스 흐름

```text
병원 QR Token 발급
→ 학생 QR 스캔 및 검증
→ 학생 Mock 인증·동의
→ Visit 생성 (WAITING_HOSPITAL_CONFIRMATION)
→ 병원 진료 완료 (VISIT_CONFIRMED)
→ 학교 전달 (SENT_TO_UNIVERSITY)
→ 학교 보건결석 처리 (COMPLETED)
→ 학생 처리 상태 조회
```

## 구현 완료 범위

- PostgreSQL, JPA Entity 및 Repository
- 개발용 University/Student/Hospital Seed
- 학생 Mock 인증
- QR Token 발급·검증과 일회 사용
- Visit 생성·단건·학생 목록 조회
- 병원 Visit 목록과 진료 완료
- 학교 전달, 학교 Visit 목록과 처리 완료
- 학생/병원 UI의 실제 API 연동
- 학교 결석 화면의 실제 Visit 조회·완료 연동
- localhost 개발 서버용 제한적 CORS

## Mock으로 유지되는 기능

- `student / 1234`, `hospital / 1234` 역할 로그인
- 실제 대학 SSO, 병원 EMR 및 학사 시스템 연동
- 학교 시간표, 성적, 등록금 데이터
- 결석 인정 과목 선택 데이터
- 제휴 병원 검색 목록과 일부 홈 화면 예시 콘텐츠

상세 계약은 [API 문서](docs/api.md), 데이터 구조는 [DB 스키마](docs/db-schema.md)를 참고하세요.
