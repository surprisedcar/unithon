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

현재 백엔드는 Spring Boot 기반 기본 실행 환경까지 구현되어 있습니다.

프로젝트 경로:

```text id="0q52z8"
backend/spring-server
```

기술 스택:

```text id="7e0b60"
Java 21
Spring Boot 3.3.x
Gradle
Spring Data JPA
PostgreSQL
Docker Compose
```

---

## 1. Prerequisites

백엔드를 실행하기 전에 다음 프로그램이 필요합니다.

```text id="f9l88v"
Java 21
Docker Desktop
Git
```

Java 버전 확인:

```powershell id="pqmq74"
java -version
```

Java 21이 출력되어야 합니다.

예:

```text id="oklyo5"
java version "21..."
```

Gradle은 별도로 설치할 필요가 없습니다.

프로젝트에 포함된 Gradle Wrapper를 사용합니다.

---

## 2. PostgreSQL 실행

프로젝트 루트에서 Docker Compose를 실행합니다.

```powershell id="tk3udc"
docker compose up -d
```

실행 중인 Container 확인:

```powershell id="tt4wec"
docker ps
```

PostgreSQL Container가 `Up` 상태이면 정상입니다.

현재 기본 Database 설정:

```text id="dc0er3"
Database: unwork
Username: unwork
Password: unwork
Port: 5432
```

위 설정은 로컬 개발용 기본값입니다.

---

## 3. Backend Build

백엔드 디렉터리로 이동합니다.

```powershell id="wwccuk"
cd backend\spring-server
```

Gradle Build:

```powershell id="ag4tz7"
.\gradlew.bat clean build
```

정상적으로 완료되면 다음 메시지가 출력됩니다.

```text id="afdc5i"
BUILD SUCCESSFUL
```

Mac 또는 Linux 환경에서는 다음 명령을 사용합니다.

```bash id="4wm8so"
./gradlew clean build
```

---

## 4. Backend 실행

Windows:

```powershell id="dmqm4c"
.\gradlew.bat bootRun
```

Mac / Linux:

```bash id="sfc780"
./gradlew bootRun
```

Spring Boot 기본 Port:

```text id="gaw80d"
8080
```

---

## 5. Health Check

Backend 실행 후 다음 주소에 접속합니다.

```text id="l201yq"
http://localhost:8080/api/v1/health
```

정상 응답:

```json id="g562j0"
{
  "status": "UP"
}
```

위 응답이 나오면 Spring Boot 서버가 정상적으로 실행된 상태입니다.

---

## 6. Database Connection

Spring Boot는 기본적으로 다음 PostgreSQL Database에 연결합니다.

```text id="34357z"
jdbc:postgresql://localhost:5432/unwork
```

환경변수로 설정을 변경할 수 있습니다.

```text id="h91rfv"
DB_URL
DB_USERNAME
DB_PASSWORD
```

기본값:

```text id="p2d3kr"
DB_URL=jdbc:postgresql://localhost:5432/unwork
DB_USERNAME=unwork
DB_PASSWORD=unwork
```

실제 비밀번호나 Secret은 GitHub에 Commit하지 않습니다.

---

## 7. Current Backend Structure

현재 주요 구조:

```text id="jo0m4f"
backend/spring-server/
├─ src/main/java/com/unwork/healthabsence/
│  ├─ controller/
│  ├─ service/
│  ├─ repository/
│  ├─ entity/
│  ├─ dto/
│  ├─ exception/
│  └─ config/
│
└─ src/main/resources/
   └─ application.yml
```

기본 계층 구조:

```text id="6qv4hh"
Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL
```

---

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
```

---

## 9. Not Implemented Yet

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
