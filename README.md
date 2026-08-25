# Unwork Health Absence

> **QR 기반 유고결석 처리 자동화 서비스**

제휴 병원의 방문 인증을 학교에 전달해 유고결석 처리를 지원하는 해커톤 MVP입니다. 하나의 저장소에서 Spring Boot API, 학생/병원 서비스 UI, 학교 u-SAINT Mock UI를 관리합니다.

학생이 병원 진료 후 별도의 진료확인서 제출 과정을 거치지 않고,
**학생 → 병원 → 학교** 간 진료 확인 및 유고결석 처리를 하나의 서비스에서 처리하는 것을 목표로 합니다.

기존의 유고결석 처리 과정에서 발생하는 서류 발급, 제출, 확인 등의 번거로운 절차를 줄이고
QR 기반 인증과 상태 관리를 통해 전체 처리 과정을 단순화합니다.

---

## 🚀 Current Development Status

현재 MVP의 핵심 흐름인

**학생 인증 → QR 발급 → 병원 진료 확인 → 학교 전달 → 유고결석 처리 완료**

과정이 구현되어 있으며, Frontend와 Backend를 통해 전체 시나리오를 실행할 수 있습니다.

### 전체 처리 흐름

```text
학생 인증
    ↓
QR Token 생성
    ↓
병원에서 QR 확인
    ↓
Visit 생성
    ↓
병원 진료 완료
    ↓
학교로 Visit 전달
    ↓
학교 담당자 확인
    ↓
유고결석 처리 완료
```

Visit은 처리 단계에 따라 상태가 변경되며, 잘못된 순서의 요청은 서버에서 차단합니다.

---

## ✨ 주요 기능

### 👨‍🎓 학생

* 학생 Mock 인증
* 개인 QR Token 발급
* 자신의 진료 기록 조회
* 유고결석 처리 진행 상태 확인

### 🏥 병원

* 학생 QR Token 검증
* QR 기반 Visit 생성
* 병원별 Visit 목록 조회
* 진료 완료 처리
* 완료된 진료 정보를 학교로 전달

### 🏫 학교

* 학교로 전달된 Visit 목록 조회
* 학생 진료 정보 확인
* 유고결석 최종 처리

### 🔐 Backend 안정성

* QR Token 만료 시간 관리
* QR Token 1회 사용
* 사용된 QR Token 재사용 방지
* Visit 상태 전이 검증
* 잘못된 상태 전이에 `409 Conflict` 반환
* Service Layer Transaction 처리
* 비관적 Lock을 통한 중복 처리 방지
* PostgreSQL 기반 데이터 영속화
* 공통 예외 처리

---

## 🔄 Visit 상태 관리

Visit은 다음과 같은 상태 흐름을 가집니다.

```text
CREATED
   ↓
HOSPITAL_COMPLETED
   ↓
SENT_TO_UNIVERSITY
   ↓
UNIVERSITY_COMPLETED
```

각 단계는 정해진 순서대로만 변경할 수 있습니다.

예를 들어 병원 진료가 완료되지 않은 Visit을 학교로 전달하거나,
이미 처리 완료된 Visit을 다시 처리하려는 요청은 허용되지 않습니다.

이를 통해 중복 처리 및 비정상적인 상태 변경을 방지합니다.

---

## 🏗 Architecture

```text
┌──────────────────┐
│     Frontend     │
│                  │
│ Student /        │
│ Hospital /       │
│ University       │
└────────┬─────────┘
         │ REST API
         ▼
┌──────────────────┐
│   Spring Boot    │
│                  │
│   Controller     │
│       ↓          │
│    Service       │
│       ↓          │
│   Repository     │
└────────┬─────────┘
         │ JPA
         ▼
┌──────────────────┐
│    PostgreSQL    │
└──────────────────┘
```

Frontend와 Backend는 REST API를 통해 통신하며,
Backend는 Controller → Service → Repository 계층으로 구성되어 있습니다.

---

## 🛠 Tech Stack

### Frontend

* React
* TypeScript
* Vite

### Backend

* Java
* Spring Boot
* Spring Web
* Spring Data JPA
* Gradle

### Database

* PostgreSQL

### Infrastructure / Development

* Docker
* Docker Compose
* Git
* GitHub

---

## 📁 Project Structure

```text
unithon
├── frontend/
│
├── backend/
│   └── spring-server/
│       ├── src/main/java/
│       │   └── com/unwork/healthabsence/
│       │       ├── config/
│       │       ├── controller/
│       │       │   ├── auth/
│       │       │   ├── hospital/
│       │       │   ├── qr/
│       │       │   ├── university/
│       │       │   └── visit/
│       │       ├── dto/
│       │       ├── entity/
│       │       ├── exception/
│       │       ├── repository/
│       │       └── service/
│       │
│       └── src/test/
│
├── docs/
├── docker-compose.yml
└── README.md
```

---

## 🌐 Core API

### Student / Authentication

```http
POST /api/auth/student
```

학생 정보를 기반으로 Mock 인증을 수행합니다.

### QR

```http
POST /api/qr
```

학생의 진료 인증을 위한 QR Token을 생성합니다.

QR Token은 제한된 유효 시간을 가지며 한 번 사용된 Token은 다시 사용할 수 없습니다.

### Visit

```http
GET /api/visits/{visitId}
```

특정 Visit 정보를 조회합니다.

학생, 병원, 학교는 각각 자신의 역할에 맞는 API를 통해 Visit 목록과 처리 상태를 확인할 수 있습니다.

### Hospital Processing

병원은 QR 검증 후 Visit을 생성하고 진료가 완료되면 해당 Visit을 완료 상태로 변경합니다.

```text
QR 검증
    ↓
Visit 생성
    ↓
진료 완료
    ↓
학교 전달
```

### University Processing

학교는 전달받은 Visit을 확인하고 최종 유고결석 처리를 완료합니다.

```text
학교 Visit 조회
    ↓
진료 정보 확인
    ↓
유고결석 처리 완료
```

---

## 🗄 Database

개발 환경에서는 PostgreSQL을 사용합니다.

Docker Compose를 이용해 로컬 PostgreSQL 환경을 실행할 수 있습니다.

```bash
docker compose up -d
```

Backend 실행:

```bash
cd backend/spring-server

# Windows
gradlew.bat bootRun

# macOS / Linux
./gradlew bootRun
```

---

## 🧪 Test

Backend에는 핵심 비즈니스 로직에 대한 테스트가 포함되어 있습니다.

```bash
cd backend/spring-server

# Windows
gradlew.bat test

# macOS / Linux
./gradlew test
```

현재 주요 테스트 대상은 다음과 같습니다.

* Backend Health Check
* Visit 처리 상태 전이
* 잘못된 상태 전이 방지
* Visit Processing Service

---

## 🎯 MVP Scope

현재 프로젝트는 실제 대학 및 병원 시스템과 직접 연결하기 전 단계의 **MVP / Proof of Concept**입니다.

실제 서비스에서는 다음 외부 시스템과의 연동을 고려할 수 있습니다.

```text
대학 인증 시스템 / SSO
        ↓
Unwork
        ↕
병원 시스템 / EMR
        ↓
대학 학사 시스템
```

현재는 외부 기관과의 실제 연동 대신 Mock 데이터와 자체 API를 통해 전체 서비스 흐름을 검증합니다.

---

## 🔮 Future Improvements

* Swagger / OpenAPI 기반 API 문서화
* 전체 사용자 흐름 Integration Test
* 실제 대학 인증 시스템 연동
* 병원 시스템 연동
* 사용자 역할 기반 인증 / 인가
* Backend 및 Frontend 배포
* CI/CD Pipeline 구축
* 모니터링 및 로그 관리

---

## 💡 Goal

Unwork Health Absence는 단순히 진료 정보를 저장하는 서비스가 아니라,

**학생이 병원에서 진료받은 사실을 학교의 유고결석 처리까지 안전하게 전달하는 전체 과정을 디지털화하는 것**

을 목표로 합니다.

```text
학생          병원            학교

 QR 발급  →  진료 확인  →  유고결석 처리
    │            │              │
    └──────── Unwork ───────────┘
```
