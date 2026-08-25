# Database Schema

## 1. Overview

Unwork Health Absence는 PostgreSQL을 사용한다.

해커톤 MVP에서는 실제 의료정보를 저장하는 시스템이 아니라 **병원 방문 사실을 인증하여 학교에 전달하는 시스템**을 구현하는 것을 목표로 한다.

따라서 서비스 수행에 필요한 최소한의 정보만 저장한다.

저장하지 않는 정보:

* 진단명
* 질병명
* 처방 내용
* 처방전
* 상세 진료 기록
* 검사 결과
* 주민등록번호

핵심 Entity는 다음과 같다.

```text
University
Student
Hospital
QrToken
Visit
```

전체 관계는 다음과 같다.

```text
University
    │
    │ 1:N
    ▼
 Student
    │
    │ 1:N
    ▼
  Visit
    ▲
    │ N:1
    │
 Hospital


Hospital
    │
    │ 1:N
    ▼
 QrToken
```

---

# 2. University

학교 정보를 저장한다.

## Table

```text
universities
```

## Columns

| Column     | Type         | Constraint       | Description |
| ---------- | ------------ | ---------------- | ----------- |
| id         | BIGSERIAL    | PK               | 내부 식별자      |
| name       | VARCHAR(100) | NOT NULL         | 학교명         |
| code       | VARCHAR(50)  | NOT NULL, UNIQUE | 학교 코드       |
| created_at | TIMESTAMP    | NOT NULL         | 생성 시각       |
| updated_at | TIMESTAMP    | NOT NULL         | 수정 시각       |

## Example

```text
id: 1
name: 숭실대학교
code: SSU
```

학교명 대신 `code`를 별도로 두는 이유는 학교명이 변경되더라도 내부 연동 식별자는 유지할 수 있기 때문이다.

---

# 3. Student

학생 정보를 저장한다.

## Table

```text
students
```

## Columns

| Column         | Type        | Constraint   | Description |
| -------------- | ----------- | ------------ | ----------- |
| id             | BIGSERIAL   | PK           | 내부 식별자      |
| university_id  | BIGINT      | FK, NOT NULL | 소속 학교       |
| student_number | VARCHAR(30) | NOT NULL     | 학번          |
| name           | VARCHAR(50) | NOT NULL     | 학생 이름       |
| created_at     | TIMESTAMP   | NOT NULL     | 생성 시각       |
| updated_at     | TIMESTAMP   | NOT NULL     | 수정 시각       |

## Constraints

```text
UNIQUE(university_id, student_number)
```

같은 학교에서는 동일한 학번이 두 번 등록될 수 없다.

## Relationship

```text
University 1 : N Student
Student 1 : N Visit
```

---

# 4. Hospital

제휴 병원 정보를 저장한다.

## Table

```text
hospitals
```

## Columns

| Column     | Type         | Constraint       | Description |
| ---------- | ------------ | ---------------- | ----------- |
| id         | BIGSERIAL    | PK               | 내부 식별자      |
| name       | VARCHAR(100) | NOT NULL         | 병원명         |
| code       | VARCHAR(50)  | NOT NULL, UNIQUE | 병원 식별 코드    |
| address    | VARCHAR(255) | NULL             | 병원 주소       |
| active     | BOOLEAN      | NOT NULL         | 제휴 활성 여부    |
| created_at | TIMESTAMP    | NOT NULL         | 생성 시각       |
| updated_at | TIMESTAMP    | NOT NULL         | 수정 시각       |

## Example

```text
id: 1
name: 유니톤의원
code: HOSPITAL_001
active: true
```

## Relationship

```text
Hospital 1 : N Visit
Hospital 1 : N QrToken
```

---

# 5. QrToken

병원에서 학생에게 제공하는 QR 인증 토큰을 관리한다.

QR 자체에 병원 ID 등의 정보를 직접 노출하지 않고 임시 토큰을 사용한다.

## Table

```text
qr_tokens
```

## Columns

| Column      | Type         | Constraint       | Description |
| ----------- | ------------ | ---------------- | ----------- |
| id          | BIGSERIAL    | PK               | 내부 식별자      |
| hospital_id | BIGINT       | FK, NOT NULL     | QR을 발급한 병원  |
| token_hash  | VARCHAR(255) | NOT NULL, UNIQUE | QR Token 해시 |
| status      | VARCHAR(20)  | NOT NULL         | Token 상태    |
| expires_at  | TIMESTAMP    | NOT NULL         | 만료 시각       |
| used_at     | TIMESTAMP    | NULL             | 사용 시각       |
| created_at  | TIMESTAMP    | NOT NULL         | 생성 시각       |

실제 QR에 포함된 Token 문자열을 그대로 DB에 저장하지 않고 해시값을 저장하는 것을 기본 설계로 한다.

MVP 구현 복잡도를 줄여야 하는 경우 실제 Token 저장 방식으로 구현할 수 있지만, 외부 API에서는 내부 DB ID가 아닌 임의 Token을 사용한다.

---

# 6. QrTokenStatus

QR Token 상태는 다음과 같다.

```text
ACTIVE
USED
EXPIRED
```

## ACTIVE

사용 가능한 QR Token.

## USED

학생이 해당 QR을 이용하여 Visit을 생성한 상태.

## EXPIRED

유효 시간이 지나 더 이상 사용할 수 없는 상태.

QR Token은 원칙적으로 한 번만 사용할 수 있는 One-Time Token으로 설계한다.

---

# 7. Visit

본 프로젝트에서 가장 중요한 Entity이다.

학생의 병원 방문 인증 요청 하나를 나타낸다.

학생 인증과 정보 제공 동의가 완료된 이후 Visit을 생성한다.

## Table

```text
visits
```

## Columns

| Column                | Type        | Constraint   | Description         |
| --------------------- | ----------- | ------------ | ------------------- |
| id                    | UUID        | PK           | 외부에서도 사용할 Visit 식별자 |
| student_id            | BIGINT      | FK, NOT NULL | 방문 학생               |
| hospital_id           | BIGINT      | FK, NOT NULL | 방문 병원               |
| university_id         | BIGINT      | FK, NOT NULL | 정보를 전달할 학교          |
| qr_token_id           | BIGINT      | FK, NOT NULL | 사용한 QR Token        |
| status                | VARCHAR(40) | NOT NULL     | 현재 처리 상태            |
| consented_at          | TIMESTAMP   | NOT NULL     | 학생 정보 제공 동의 시각      |
| hospital_confirmed_at | TIMESTAMP   | NULL         | 병원 진료 완료 확인 시각      |
| sent_to_university_at | TIMESTAMP   | NULL         | 학교 전달 시각            |
| completed_at          | TIMESTAMP   | NULL         | 학교 처리 완료 시각         |
| created_at            | TIMESTAMP   | NOT NULL     | Visit 생성 시각         |
| updated_at            | TIMESTAMP   | NOT NULL     | 최종 변경 시각            |

Visit ID는 `BIGSERIAL` 대신 UUID 사용을 권장한다.

예:

```text
9bf81c12-421e-4cfa-bc38-48501fbef439
```

외부 API URL에 단순 증가 숫자를 노출하는 것보다 안전하며, 프론트엔드에서도 Visit 식별자로 사용하기 편하다.

---

# 8. VisitStatus

Visit은 다음 상태를 가진다.

```text
WAITING_HOSPITAL_CONFIRMATION
VISIT_CONFIRMED
SENT_TO_UNIVERSITY
COMPLETED
```

상태 흐름:

```text
학생 인증
    ↓
정보 제공 동의
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
학교 처리
    ↓
COMPLETED
```

---

## WAITING_HOSPITAL_CONFIRMATION

학생 인증과 정보 제공 동의가 끝나 Visit이 생성되었지만 아직 병원에서 진료 완료를 확인하지 않은 상태.

---

## VISIT_CONFIRMED

병원에서 학생의 진료 완료 사실을 확인한 상태.

---

## SENT_TO_UNIVERSITY

병원에서 확인된 방문 인증 정보가 학교에 전달된 상태.

MVP에서는 실제 대학 시스템 API 대신 University Web에서 조회 가능하도록 만드는 것을 학교 전달로 간주할 수 있다.

---

## COMPLETED

학교에서 보건결석 처리를 완료한 상태.

---

# 9. Visit State Transition Rules

잘못된 상태 변경을 방지하기 위해 Backend Service에서 상태 전이 규칙을 검사한다.

허용되는 상태 변경:

```text
WAITING_HOSPITAL_CONFIRMATION
    ↓
VISIT_CONFIRMED
    ↓
SENT_TO_UNIVERSITY
    ↓
COMPLETED
```

예를 들어 다음 변경은 허용하지 않는다.

```text
WAITING_HOSPITAL_CONFIRMATION
→ COMPLETED
```

또한 이미 `COMPLETED` 상태인 Visit은 더 이상 변경할 수 없다.

Controller에서 직접 상태를 변경하지 않고 반드시 Service를 통해 변경한다.

---

# 10. Entity Relationships

전체 관계:

```text
University
    │
    │ 1
    │
    │ N
 Student
    │
    │ 1
    │
    │ N
  Visit
   ▲  ▲
   │  │
   │  └──────── University
   │
Hospital
```

구체적으로:

```text
University 1 : N Student

Student 1 : N Visit

Hospital 1 : N Visit

University 1 : N Visit

Hospital 1 : N QrToken

QrToken 1 : 0..1 Visit
```

하나의 QR Token은 최대 하나의 Visit 생성에 사용한다.

---

# 11. Referential Integrity

Foreign Key:

```text
students.university_id
→ universities.id

qr_tokens.hospital_id
→ hospitals.id

visits.student_id
→ students.id

visits.hospital_id
→ hospitals.id

visits.university_id
→ universities.id

visits.qr_token_id
→ qr_tokens.id
```

---

# 12. Indexes

MVP에서도 조회가 자주 발생하는 컬럼에는 Index를 둔다.

권장 Index:

```text
students(university_id, student_number)

visits(student_id)

visits(hospital_id, status)

visits(university_id, status)

qr_tokens(token_hash)
```

병원 화면에서는:

```text
hospital_id + status
```

학교 화면에서는:

```text
university_id + status
```

조건 조회가 많기 때문이다.

---

# 13. Timestamp Policy

Java에서는 시간 정보에 다음 타입 사용을 권장한다.

```text
Instant
```

또는:

```text
OffsetDateTime
```

DB에서는 UTC 기준으로 저장한다.

Frontend에서 사용자 지역 시간으로 변환한다.

MVP에서 단순 구현이 필요한 경우 `LocalDateTime`으로 통일할 수 있지만 프로젝트 전체에서 하나의 기준을 유지한다.

---

# 14. JPA Entity Recommendation

Spring Boot에서는 다음 Entity를 생성한다.

```text
University
Student
Hospital
QrToken
Visit
```

Enum:

```text
QrTokenStatus
VisitStatus
```

각 Entity의 연관 관계는 처음부터 양방향으로 만들 필요가 없다.

예:

```text
Visit → Student
Visit → Hospital
Visit → University
Visit → QrToken
```

처럼 Visit에서 필요한 Entity를 참조하는 단방향 관계를 우선 사용한다.

불필요한 양방향 JPA 관계는 JSON 순환 참조와 복잡도를 증가시키므로 MVP에서는 피한다.

---

# 15. DTO Principle

JPA Entity를 Controller에서 직접 반환하지 않는다.

다음 구조를 사용한다.

```text
Controller
    ↓
Request DTO
    ↓
Service
    ↓
Entity
    ↓
Response DTO
    ↓
Controller
```

예:

```text
CreateVisitRequest
VisitResponse
HospitalVisitResponse
UniversityVisitResponse
```

이렇게 하면 DB 구조가 변경되더라도 API 응답 구조가 직접적으로 영향을 받지 않는다.

---

# 16. Future Extensions

해커톤 이후 서비스 확장 시 다음 Entity를 추가할 수 있다.

```text
User
HospitalStaff
UniversityStaff
VisitStatusHistory
Notification
AuditLog
```

하지만 MVP 단계에서는 구현하지 않는다.

현재 목표는 다음 핵심 흐름을 안정적으로 구현하는 것이다.

```text
QR
→ 학생 인증
→ 동의
→ Visit
→ 병원 확인
→ 학교 전달
→ 처리 완료
```
