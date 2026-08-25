# REST API Specification

## 1. Overview

Backend는 Spring Boot 기반 REST API를 제공한다.

Base URL:

```text
/api/v1
```

Frontend의 다음 세 화면이 동일한 Backend API를 사용한다.

```text
/student
/hospital
/university
```

API는 크게 다음 영역으로 구분한다.

```text
Authentication
QR Token
Visit
Hospital
University
```

---

# 2. Common Response Rules

응답은 JSON을 사용한다.

성공 요청은 HTTP 의미에 맞는 Status Code를 반환한다.

```text
200 OK
201 Created
204 No Content
```

잘못된 요청은 다음 Status Code를 사용한다.

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

---

# 3. Common Error Response

모든 API Error Response는 가능한 한 동일한 형식을 사용한다.

```json
{
  "code": "VISIT_NOT_FOUND",
  "message": "Visit을 찾을 수 없습니다.",
  "timestamp": "2026-08-25T01:30:00Z"
}
```

예상 Error Code:

```text
INVALID_REQUEST
STUDENT_NOT_FOUND
HOSPITAL_NOT_FOUND
UNIVERSITY_NOT_FOUND

QR_TOKEN_NOT_FOUND
QR_TOKEN_EXPIRED
QR_TOKEN_ALREADY_USED

VISIT_NOT_FOUND
INVALID_VISIT_STATUS

UNAUTHORIZED
FORBIDDEN

INTERNAL_SERVER_ERROR
```

Spring Boot에서는 `@RestControllerAdvice`를 이용해 공통 예외 응답을 처리한다.

---

# 4. Student Authentication

해커톤 MVP에서는 실제 대학 SSO 연동 대신 등록된 학생 데이터를 기반으로 Mock 인증을 제공한다.

## Verify Student

```http
POST /api/v1/auth/students/verify
```

### Request

```json
{
  "universityCode": "SSU",
  "studentNumber": "20231234",
  "name": "홍길동"
}
```

### Response

```http
200 OK
```

```json
{
  "studentId": 1,
  "studentNumber": "20231234",
  "name": "홍길동",
  "university": {
    "id": 1,
    "name": "숭실대학교",
    "code": "SSU"
  }
}
```

### Errors

```text
STUDENT_NOT_FOUND
INVALID_REQUEST
```

MVP에서는 인증 성공 이후 반환된 `studentId`를 Visit 생성에 사용할 수 있다.

실서비스에서는 대학 SSO 또는 인증 Token 방식으로 교체한다.

---

# 5. QR Token API

## 5.1 Generate QR Token

병원에서 학생에게 제공할 QR Token을 생성한다.

```http
POST /api/v1/hospitals/{hospitalId}/qr-tokens
```

### Response

```http
201 Created
```

```json
{
  "token": "M1jA8sN2qPx9...",
  "hospitalId": 1,
  "hospitalName": "유니톤의원",
  "expiresAt": "2026-08-25T02:00:00Z"
}
```

Frontend는 반환된 Token을 다음과 같은 URL에 포함하여 QR을 생성할 수 있다.

```text
/student?token=M1jA8sN2qPx9...
```

QR 이미지 자체는 Backend에서 생성하지 않아도 된다.

Backend는 QR에 들어갈 Token만 생성하고 Frontend에서 QR Code Library를 이용해 렌더링할 수 있다.

---

# 5.2 Verify QR Token

학생이 QR을 스캔한 후 Token이 유효한지 확인한다.

```http
GET /api/v1/qr-tokens/{token}
```

### Response

```http
200 OK
```

```json
{
  "valid": true,
  "hospital": {
    "id": 1,
    "name": "유니톤의원"
  },
  "expiresAt": "2026-08-25T02:00:00Z"
}
```

### Expired Token

```http
400 Bad Request
```

```json
{
  "code": "QR_TOKEN_EXPIRED",
  "message": "만료된 QR 코드입니다.",
  "timestamp": "2026-08-25T02:10:00Z"
}
```

### Already Used

```http
409 Conflict
```

```json
{
  "code": "QR_TOKEN_ALREADY_USED",
  "message": "이미 사용된 QR 코드입니다.",
  "timestamp": "2026-08-25T02:10:00Z"
}
```

---

# 6. Visit API

## 6.1 Create Visit

학생 인증과 정보 제공 동의가 끝난 후 Visit을 생성한다.

```http
POST /api/v1/visits
```

### Request

```json
{
  "studentId": 1,
  "qrToken": "M1jA8sN2qPx9...",
  "consent": true
}
```

`hospitalId`와 `universityId`를 Frontend에서 직접 보내지 않는다.

Backend에서:

```text
qrToken
→ Hospital 확인

studentId
→ University 확인
```

을 통해 결정한다.

이렇게 해야 클라이언트가 임의의 병원이나 학교 ID를 조작하는 것을 줄일 수 있다.

### Validation

```text
studentId 존재
QR Token 유효
QR Token 미사용
consent == true
```

### Processing

```text
1. Student 조회
2. QR Token 검증
3. Hospital 확인
4. Student의 University 확인
5. Visit 생성
6. QrToken 상태 USED 변경
```

Visit 최초 상태:

```text
WAITING_HOSPITAL_CONFIRMATION
```

### Response

```http
201 Created
```

```json
{
  "visitId": "9bf81c12-421e-4cfa-bc38-48501fbef439",
  "status": "WAITING_HOSPITAL_CONFIRMATION",
  "student": {
    "name": "홍길동",
    "studentNumber": "20231234"
  },
  "hospital": {
    "id": 1,
    "name": "유니톤의원"
  },
  "university": {
    "id": 1,
    "name": "숭실대학교"
  },
  "createdAt": "2026-08-25T01:40:00Z"
}
```

### Errors

```text
STUDENT_NOT_FOUND
QR_TOKEN_NOT_FOUND
QR_TOKEN_EXPIRED
QR_TOKEN_ALREADY_USED
INVALID_REQUEST
```

---

# 6.2 Get Visit

Visit 현재 상태를 조회한다.

```http
GET /api/v1/visits/{visitId}
```

### Response

```http
200 OK
```

```json
{
  "visitId": "9bf81c12-421e-4cfa-bc38-48501fbef439",
  "status": "WAITING_HOSPITAL_CONFIRMATION",
  "student": {
    "name": "홍길동",
    "studentNumber": "20231234"
  },
  "hospital": {
    "id": 1,
    "name": "유니톤의원"
  },
  "university": {
    "id": 1,
    "name": "숭실대학교"
  },
  "consentedAt": "2026-08-25T01:40:00Z",
  "hospitalConfirmedAt": null,
  "sentToUniversityAt": null,
  "completedAt": null
}
```

학생 화면에서 해당 API를 이용하여 진행 상태를 보여준다.

---

# 6.3 Get Student Visits

학생의 Visit 목록을 조회한다.

```http
GET /api/v1/students/{studentId}/visits
```

### Response

```json
[
  {
    "visitId": "9bf81c12-421e-4cfa-bc38-48501fbef439",
    "hospitalName": "유니톤의원",
    "status": "SENT_TO_UNIVERSITY",
    "createdAt": "2026-08-25T01:40:00Z"
  }
]
```

---

# 7. Hospital API

## 7.1 Get Hospital Visits

병원에서 자신의 Visit 요청 목록을 조회한다.

```http
GET /api/v1/hospitals/{hospitalId}/visits
```

선택적으로 상태를 Query Parameter로 전달할 수 있다.

```http
GET /api/v1/hospitals/1/visits?status=WAITING_HOSPITAL_CONFIRMATION
```

### Response

```json
[
  {
    "visitId": "9bf81c12-421e-4cfa-bc38-48501fbef439",
    "student": {
      "name": "홍길동",
      "studentNumber": "20231234"
    },
    "universityName": "숭실대학교",
    "status": "WAITING_HOSPITAL_CONFIRMATION",
    "createdAt": "2026-08-25T01:40:00Z"
  }
]
```

---

# 7.2 Confirm Hospital Visit

병원에서 학생의 진료가 완료되었음을 확인한다.

```http
POST /api/v1/hospitals/{hospitalId}/visits/{visitId}/confirm
```

Request Body는 필요하지 않다.

### Preconditions

현재 Visit 상태:

```text
WAITING_HOSPITAL_CONFIRMATION
```

이어야 한다.

또한 해당 Visit의 `hospital_id`가 URL의 `hospitalId`와 동일해야 한다.

### Processing

```text
WAITING_HOSPITAL_CONFIRMATION
        ↓
VISIT_CONFIRMED
```

### Response

```http
200 OK
```

```json
{
  "visitId": "9bf81c12-421e-4cfa-bc38-48501fbef439",
  "status": "VISIT_CONFIRMED",
  "hospitalConfirmedAt": "2026-08-25T02:00:00Z"
}
```

잘못된 상태에서 요청하면:

```http
409 Conflict
```

```json
{
  "code": "INVALID_VISIT_STATUS",
  "message": "현재 상태에서는 진료 완료 처리를 할 수 없습니다.",
  "timestamp": "2026-08-25T02:00:00Z"
}
```

---

# 8. University Delivery

병원 진료가 확인된 Visit을 학교에 전달한다.

실제 서비스에서는 학교 API 또는 학사 시스템 연동이 담당할 영역이다.

해커톤 MVP에서는 Backend 내부 처리를 통해 상태를 변경한다.

```http
POST /api/v1/visits/{visitId}/send-to-university
```

### Preconditions

현재 상태:

```text
VISIT_CONFIRMED
```

### Processing

```text
VISIT_CONFIRMED
        ↓
SENT_TO_UNIVERSITY
```

### Response

```json
{
  "visitId": "9bf81c12-421e-4cfa-bc38-48501fbef439",
  "status": "SENT_TO_UNIVERSITY",
  "sentToUniversityAt": "2026-08-25T02:01:00Z"
}
```

실제 Frontend에서는 병원 확인 직후 Backend Service가 이 처리를 자동으로 호출하도록 구현할 수 있다.

따라서 사용자가 별도의 "학교 전송" 버튼을 누르게 할 필요는 없다.

---

# 9. University API

## 9.1 Get University Visits

학교에 전달된 진료 인증 요청을 조회한다.

```http
GET /api/v1/universities/{universityId}/visits
```

기본적으로 다음 상태를 조회한다.

```text
SENT_TO_UNIVERSITY
COMPLETED
```

특정 상태 조회:

```http
GET /api/v1/universities/1/visits?status=SENT_TO_UNIVERSITY
```

### Response

```json
[
  {
    "visitId": "9bf81c12-421e-4cfa-bc38-48501fbef439",
    "student": {
      "name": "홍길동",
      "studentNumber": "20231234"
    },
    "hospital": {
      "name": "유니톤의원"
    },
    "status": "SENT_TO_UNIVERSITY",
    "hospitalConfirmedAt": "2026-08-25T02:00:00Z",
    "sentToUniversityAt": "2026-08-25T02:01:00Z"
  }
]
```

진단명이나 상세 진료정보는 반환하지 않는다.

---

# 9.2 Complete Visit

학교에서 보건결석 처리를 완료한다.

```http
POST /api/v1/universities/{universityId}/visits/{visitId}/complete
```

### Preconditions

Visit 상태:

```text
SENT_TO_UNIVERSITY
```

이어야 한다.

또한 Visit의 `university_id`와 URL의 `universityId`가 동일해야 한다.

### Processing

```text
SENT_TO_UNIVERSITY
        ↓
COMPLETED
```

### Response

```json
{
  "visitId": "9bf81c12-421e-4cfa-bc38-48501fbef439",
  "status": "COMPLETED",
  "completedAt": "2026-08-25T03:00:00Z"
}
```

---

# 10. Visit State API Mapping

전체 상태 흐름과 API의 관계:

```text
[Student]

POST /auth/students/verify
        ↓
GET /qr-tokens/{token}
        ↓
POST /visits
        ↓
WAITING_HOSPITAL_CONFIRMATION


[Hospital]

GET /hospitals/{hospitalId}/visits
        ↓
POST /hospitals/{hospitalId}/visits/{visitId}/confirm
        ↓
VISIT_CONFIRMED


[Backend]

POST /visits/{visitId}/send-to-university
        ↓
SENT_TO_UNIVERSITY


[University]

GET /universities/{universityId}/visits
        ↓
POST /universities/{universityId}/visits/{visitId}/complete
        ↓
COMPLETED
```

---

# 11. Recommended Automatic Processing

최종 구현에서는 병원 확인 요청:

```http
POST /api/v1/hospitals/{hospitalId}/visits/{visitId}/confirm
```

하나의 요청 안에서 다음 작업을 수행하도록 단순화할 수 있다.

```text
병원 진료 확인

WAITING_HOSPITAL_CONFIRMATION
        ↓
VISIT_CONFIRMED

학교 전달 처리

VISIT_CONFIRMED
        ↓
SENT_TO_UNIVERSITY
```

즉 사용자 관점에서는:

```text
병원 "진료 완료" 버튼
        ↓
학교 화면에 즉시 표시
```

되게 만든다.

`VISIT_CONFIRMED` 상태와 관련 timestamp는 내부적으로 기록하면서 최종 응답은:

```json
{
  "visitId": "9bf81c12-421e-4cfa-bc38-48501fbef439",
  "status": "SENT_TO_UNIVERSITY"
}
```

를 반환할 수 있다.

해커톤 MVP에서는 이 방식이 가장 단순하다.

---

# 12. Initial Data

개발 편의를 위해 테스트 데이터는 Seed Data로 생성할 수 있다.

예:

## University

```text
1
숭실대학교
SSU
```

## Student

```text
1
university_id = 1
student_number = 20231234
name = 홍길동
```

## Hospital

```text
1
유니톤의원
HOSPITAL_001
```

이를 통해 별도의 관리자 등록 기능 없이 핵심 시나리오를 바로 테스트할 수 있다.

---

# 13. API Implementation Priority

Spring Boot 구현 순서는 다음을 권장한다.

```text
1. University / Student / Hospital Entity
2. QrToken
3. Visit
4. Student Verification
5. QR Token 생성
6. QR Token 검증
7. Visit 생성
8. Visit 조회
9. Hospital Visit 목록
10. Hospital Confirm
11. University Visit 목록
12. University Complete
13. Exception Handling
```

---

# 14. API Design Principles

## Backend owns state

Frontend가 Visit 상태를 임의로 지정하지 않는다.

예를 들어 다음 요청은 만들지 않는다.

```json
{
  "status": "COMPLETED"
}
```

대신:

```text
/confirm
/complete
```

처럼 Backend가 특정 행동에 따라 상태를 결정한다.

---

## Do not trust client relationships

Visit 생성 시 Frontend가 다음 값을 모두 보내지 않는다.

```text
hospitalId
universityId
```

Backend가 기존 데이터 관계를 통해 결정한다.

```text
QR Token → Hospital

Student → University
```

---

## Do not expose JPA Entity directly

Controller는 반드시 Response DTO를 반환한다.

---

## Minimal medical data

API Response에도 진단명, 질환명, 처방 등 상세 의료정보를 포함하지 않는다.

---

## Version API from the beginning

모든 API는 다음 prefix를 사용한다.

```text
/api/v1
```

향후 API 변경 시:

```text
/api/v2
```

를 추가할 수 있도록 한다.
