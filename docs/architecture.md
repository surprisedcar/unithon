# System Architecture

## 1. Overview

Unwork Health Absence는 학생이 진단서를 직접 발급하거나 학교에 제출하지 않아도, 제휴 병원의 진료 완료 사실을 학교에 전달하여 보건결석 처리를 지원하는 시스템이다.

본 프로젝트는 해커톤 MVP를 목표로 하며, 실제 병원 및 학교 시스템과 직접 연동하는 대신 웹 인터페이스와 Mock 처리를 통해 전체 서비스 흐름을 구현한다.

시스템은 다음 구성요소로 이루어진다.

* Student Web
* Hospital Web
* University Web
* Spring Boot Backend
* PostgreSQL Database

---

## 2. System Components

### 2.1 Student Web

학생이 사용하는 웹 인터페이스이다.

병원에 비치된 QR 코드를 스캔하여 접속하는 것을 기본 시나리오로 한다.

주요 기능:

* QR을 통한 진료 인증 절차 진입
* 학생 정보 확인
* 개인정보 제공 동의
* 진료 인증 요청 생성
* 현재 처리 상태 조회

접근 경로:

```text
/student
```

---

### 2.2 Hospital Web

병원 측에서 사용하는 웹 인터페이스이다.

해커톤 MVP에서는 실제 병원 전산 시스템 연동을 대신하여 병원 관계자가 진료 완료 상태를 직접 처리할 수 있도록 구현한다.

주요 기능:

* 병원에 연결된 Visit 목록 조회
* 학생의 진료 요청 확인
* 진료 완료 처리

접근 경로:

```text
/hospital
```

병원에서는 진단명, 처방 내용 등의 상세 의료정보를 학교로 전달하지 않는다.

---

### 2.3 University Web

학교 측에서 사용하는 웹 인터페이스이다.

병원에서 인증된 학생의 진료 사실을 확인하고 보건결석 처리 상태를 관리한다.

주요 기능:

* 전달된 진료 인증 목록 조회
* 학생 및 진료 인증 정보 확인
* 보건결석 처리 완료

접근 경로:

```text
/university
```

---

## 3. Backend

Backend는 Spring Boot 기반 REST API 서버로 구현한다.

Frontend와 Database 사이에서 전체 비즈니스 로직을 처리하며 학생, 병원, 학교 시스템을 연결하는 중심 역할을 담당한다.

주요 기능:

1. 학생 정보 확인
2. QR Token 생성 및 검증
3. Visit 생성
4. Visit 상태 조회
5. 개인정보 제공 동의 처리
6. 병원 진료 완료 처리
7. 학교 전달 처리
8. 보건결석 처리 완료
9. Visit 상태 변경 및 관리

기본 구조는 다음과 같다.

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL
```

Spring Boot 내부 패키지는 다음 구조를 기본으로 한다.

```text
controller/
service/
repository/
entity/
dto/
config/
```

---

## 4. Database

데이터베이스는 PostgreSQL을 사용한다.

해커톤 MVP에서는 다음 데이터를 중심으로 관리한다.

* Student
* Hospital
* University
* Visit
* QrToken

상세한 테이블 구조 및 Entity 관계는 `db-schema.md`에서 정의한다.

개인정보 최소 수집을 원칙으로 하며, 진단명이나 처방 내용 등 서비스 제공에 필요하지 않은 상세 의료정보는 저장하지 않는다.

---

## 5. Core Service Flow

전체 서비스 흐름은 다음과 같다.

```text
[Hospital]
QR 제공
    │
    ▼
[Student]
QR Scan
    │
    ▼
학생 정보 확인
    │
    ▼
정보 제공 동의
    │
    ▼
[Backend]
Visit 생성
    │
    ▼
[Hospital]
진료 완료 처리
    │
    ▼
[Backend]
진료 사실 인증
    │
    ▼
[University]
인증 정보 확인
    │
    ▼
보건결석 처리
    │
    ▼
[Backend]
처리 완료
```

---

## 6. Visit Status Flow

서비스의 핵심 데이터는 `Visit`이며 하나의 진료 인증 요청에 대한 전체 처리 상태를 관리한다.

초기 상태 흐름은 다음과 같다.

```text
CREATED
    ↓
STUDENT_VERIFIED
    ↓
CONSENTED
    ↓
VISIT_CONFIRMED
    ↓
SENT_TO_UNIVERSITY
    ↓
COMPLETED
```

### CREATED

Visit이 생성된 상태.

### STUDENT_VERIFIED

학생 정보 확인이 완료된 상태.

### CONSENTED

학생이 학교로 진료 인증 정보를 전달하는 것에 동의한 상태.

### VISIT_CONFIRMED

병원에서 실제 진료가 완료되었음을 확인한 상태.

### SENT_TO_UNIVERSITY

학교 측으로 진료 인증 정보가 전달된 상태.

### COMPLETED

학교에서 보건결석 처리를 완료한 상태.

---

## 7. MVP Architecture

```text
                     ┌─────────────────┐
                     │   Student Web   │
                     │    /student     │
                     └────────┬────────┘
                              │
                              │ REST API
                              ▼
                     ┌─────────────────┐
                     │                 │
┌─────────────────┐  │   Spring Boot   │  ┌─────────────────┐
│  Hospital Web   │◀─▶│     Backend     │◀─▶│ University Web  │
│   /hospital     │  │                 │  │  /university    │
└─────────────────┘  └────────┬────────┘  └─────────────────┘
                              │
                              │ JPA
                              ▼
                     ┌─────────────────┐
                     │   PostgreSQL    │
                     └─────────────────┘
```

Frontend는 하나의 Next.js 프로젝트에서 구현한다.

```text
frontend/web

/student
/hospital
/university
```

Backend는 하나의 Spring Boot 애플리케이션으로 구현한다.

```text
backend/spring-server
```

---

## 8. MVP Scope

이번 해커톤에서는 실제 병원 및 학교의 외부 시스템 연동 자체보다 전체 서비스 흐름을 검증하는 것을 목표로 한다.

따라서 다음 기능은 Mock 또는 간소화된 방식으로 구현할 수 있다.

* 실제 대학 학사 시스템 연동
* 실제 병원 EMR 연동
* 실제 대학 SSO 인증
* 실제 병원 관계자 인증
* 실제 의료 문서 발급

대신 다음 핵심 흐름이 실제로 동작하는 것을 우선한다.

```text
QR
→ 학생 확인
→ 정보 제공 동의
→ Visit 생성
→ 병원 진료 완료
→ 학교 전달
→ 보건결석 처리
```

---

## 9. Development Principles

### Minimal MVP

해커톤에 필요하지 않은 기능은 구현하지 않는다.

### Backend-Centered State Management

진료 인증 상태는 Frontend가 아닌 Backend의 `Visit`을 기준으로 관리한다.

### Minimal Medical Information

진단명, 처방전, 상세 진료 기록 등 불필요한 의료정보는 저장하지 않는다.

### Single Source of Truth

Visit의 현재 상태는 PostgreSQL에 저장된 Backend 데이터를 기준으로 한다.

### API-First Communication

Student, Hospital, University Web은 모두 Spring Boot REST API를 통해 데이터를 조회하고 변경한다.