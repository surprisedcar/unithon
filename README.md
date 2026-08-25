<<<<<<< HEAD
# Unwork Health Absence
=======
## 🚀 Current Development Status

> Branch: `feature/visit-processing`

현재 백엔드는 **학생 인증 → QR 발급 → 병원 진료 확인 → 학교 전달 → 보건결석 처리 완료**까지의 MVP 전체 흐름이 구현되어 있습니다.

### 구현 완료

- 학생 Mock 인증
- QR Token 생성 및 검증
- QR Token 1회 사용 및 중복 사용 방지
- Visit 생성 및 조회
- 학생별 Visit 목록 조회
- 병원별 Visit 목록 조회
- 병원 진료 완료 처리
- 학교 전달 처리
- 학교별 Visit 목록 조회
- 학교 처리 완료
- Visit 상태 전이 검증
- 잘못된 상태 전이 `409 Conflict` 처리
- PostgreSQL 연동
- Service Transaction 처리
- 상태 변경 시 비관적 Lock을 통한 중복 처리 방지

### Visit 처리 흐름

```text
학생 인증
    ↓
QR Token 생성
    ↓
QR Token 검증
    ↓
Visit 생성
    ↓
WAITING_HOSPITAL_CONFIRMATION
    ↓
병원 진료 완료
    ↓
VISIT_CONFIRMED
    ↓
학교 전달
    ↓
SENT_TO_UNIVERSITY
    ↓
학교 처리 완료
    ↓
COMPLETED

## Backend Development Guide
>>>>>>> team/main

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

<<<<<<< HEAD
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
=======
## 8. Implemented

현재까지 구현 및 실제 동작 검증이 완료된 기능:

```text
✅ Spring Boot 프로젝트 기본 구조
✅ Java 21 개발 환경
✅ Gradle Wrapper
✅ PostgreSQL Driver
✅ Spring Data JPA
✅ Bean Validation
✅ PostgreSQL Docker Compose
✅ Database 연결 설정

✅ University Entity
✅ Student Entity
✅ Hospital Entity
✅ QrToken Entity
✅ Visit Entity
✅ QrTokenStatus Enum
✅ VisitStatus Enum

✅ JPA Repository 기본 구조
✅ 공통 예외 처리
✅ 개발용 Seed Data

✅ Health Check API
✅ 학생 Mock 인증 API
✅ QR Token 생성 API
✅ QR Token 검증 API
✅ Visit 생성 API
✅ Visit 단건 조회 API
✅ 학생 Visit 목록 조회 API

✅ QR Token 1회 사용 처리
✅ QR Token 중복 사용 방지
✅ Visit 생성 + QR Token USED 변경 Transaction 처리

✅ Gradle Build 검증
✅ Spring Boot 실행 검증
✅ PostgreSQL 실제 연동 테스트
✅ Core API 전체 시나리오 테스트
```

현재 구현된 API:

```http
GET  /api/v1/health

POST /api/v1/auth/students/verify

POST /api/v1/hospitals/{hospitalId}/qr-tokens
GET  /api/v1/qr-tokens/{token}

POST /api/v1/visits
GET  /api/v1/visits/{visitId}
GET  /api/v1/students/{studentId}/visits
```

현재 실제 동작 확인 완료 흐름:

```text
Docker PostgreSQL 실행
        ↓
Spring Boot 실행
        ↓
학생 Mock 인증
        ↓
QR Token 생성
        ↓
QR Token 검증
        ↓
Visit 생성
        ↓
WAITING_HOSPITAL_CONFIRMATION
        ↓
Visit 단건 조회
        ↓
학생 Visit 목록 조회
        ↓
동일 QR Token 재사용 시도
        ↓
409 Conflict
>>>>>>> team/main
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

<<<<<<< HEAD
## Mock으로 유지되는 기능

- `student / 1234`, `hospital / 1234` 역할 로그인
- 실제 대학 SSO, 병원 EMR 및 학사 시스템 연동
- 학교 시간표, 성적, 등록금 데이터
- 결석 인정 과목 선택 데이터
- 제휴 병원 검색 목록과 일부 홈 화면 예시 콘텐츠

상세 계약은 [API 문서](docs/api.md), 데이터 구조는 [DB 스키마](docs/db-schema.md)를 참고하세요.
=======
현재 남아 있는 Backend 기능:

```text
⬜ 병원 Visit 목록 조회
⬜ 병원 진료 완료 처리
⬜ 학교 전달 처리
⬜ 학교 Visit 목록 조회
⬜ 보건결석 처리 완료
```

아직 구현하지 않는 기능:

```text
⬜ Frontend 연동
⬜ 실제 대학 SSO
⬜ 실제 병원 EMR 연동
⬜ 실제 학교 학사 시스템 연동
⬜ 실제 병원 관계자 인증
⬜ 실제 학교 관계자 인증
```

---

## 10. Current Backend Flow

현재까지 실제 구현된 흐름:

```text
학생 Mock 인증
        ↓
QR Token 생성
        ↓
QR Token 검증
        ↓
학생 정보 제공 동의
        ↓
Visit 생성
        ↓
WAITING_HOSPITAL_CONFIRMATION
```

현재 `Visit` 생성 이후의 상태 처리 기능은 다음 작업에서 구현한다.

```text
WAITING_HOSPITAL_CONFIRMATION
        ↓
병원 진료 완료
        ↓
VISIT_CONFIRMED
        ↓
학교 전달
        ↓
SENT_TO_UNIVERSITY
        ↓
학교 처리 완료
        ↓
COMPLETED
```

최종 Backend MVP 목표:

```text
QR
→ 학생 인증
→ QR 검증
→ Visit 생성
→ 병원 진료 완료
→ 학교 전달
→ 보건결석 처리 완료
```

---

## 11. Core API Test Result

현재 Core API는 PostgreSQL과 실제로 연결하여 다음 시나리오를 검증했습니다.

```text
1. Student Verify 성공
2. QR Token 생성 성공
3. QR Token 검증 성공
4. Visit 생성 성공
5. Visit 상태 WAITING_HOSPITAL_CONFIRMATION 확인
6. Visit 단건 조회 성공
7. 학생 Visit 목록 조회 성공
8. 동일 QR Token 재사용 시 409 Conflict 확인
```

QR Token은 한 번 Visit 생성에 사용되면 `USED` 상태로 변경되며 동일 Token으로 두 번째 Visit을 생성할 수 없습니다.

---

## 12. Development Documents

상세 설계는 다음 문서를 기준으로 합니다.

```text
docs/architecture.md
docs/db-schema.md
docs/api.md
```

기능 구현 전에 해당 문서를 먼저 확인합니다.

문서와 코드의 설계가 충돌할 경우 임의로 구현하지 않고 설계를 먼저 확인합니다.
>>>>>>> team/main
