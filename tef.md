# AutoMedi 구현 기능 정리

## 1. 실행 구성

- 프론트엔드: React 19, Vite 8, TypeScript, Tailwind CSS v4
- 백엔드: Java 21, Spring Boot 3.5.5
- 프론트엔드 기본 주소: `http://localhost:8443`
- 백엔드 API 기본 주소: `http://localhost:8080/api/v1`
- 헬스 체크: `GET /api/v1/health`

## 2. 인증 및 계정

- 로그인 API 연동
- 로그인 성공 시 HS256 JWT 액세스 토큰 발급
- 학생과 병원 역할 구분 및 역할별 화면 이동
- 비밀번호 PBKDF2-HMAC-SHA256 해시 처리
- 학생 재학 인증 후 회원가입
- 병원 코드와 등록 키 확인 후 병원 회원가입
- JWT가 필요한 병원 및 학생 API의 권한 검사

시연 계정:

- 학생: `student / 1234`
- 병원: `hospital / 1234`
- 학생 본인 확인: `2023123456 / 김지수`

> LMS 아이디·비밀번호 인증과 실제 LMS API 연동은 아직 구현되지 않았다.

## 3. 병원 QR 생성 및 접수

### 병원 화면

- 병원 계정 로그인 후 방문 세션 관리 화면 표시
- `접수 QR 생성` 버튼으로 백엔드에 QR 토큰 발급 요청
- 발급받은 토큰을 실제 PNG QR 이미지로 변환하여 모달에 표시
- QR에 현재 프론트엔드 주소와 일회용 토큰만 포함
- QR 만료 시각과 1회 사용 안내 표시
- 모달에서 새 QR 재발급 가능

QR 링크 형식:

```text
http://{frontend-host}:8443/?qrToken={one-time-token}
```

### QR 보안 및 상태

- 32바이트 난수 기반 URL-safe 토큰 생성
- 서버에는 평문 대신 SHA-256 해시 저장
- 유효시간 30초 이상 900초 이하
- 기본 발급 유효시간 300초
- 상태: `ISSUED`, `USED`, `EXPIRED`, `REVOKED`
- 방문 접수가 생성되면 QR을 `USED`로 변경하여 재사용 차단
- 만료되거나 이미 사용된 QR에 오류 응답
- QR을 발급한 병원 계정과 요청의 병원 ID 일치 여부 확인

## 4. 학생 QR 접수 흐름

- QR 링크의 토큰을 백엔드에서 검증
- 병원명, 제휴 여부, 토큰 상태, 만료 시각 확인
- 학번과 이름으로 학생 본인 확인
- 이번 진료에 대한 개인정보 제공 동의 확인
- 동의 후 방문 세션 생성
- `Idempotency-Key`를 사용해 중복 방문 생성 방지
- 접수 완료 후 생성된 연계 ID 표시
- 2초마다 방문 상태를 조회
- 병원이 진료 완료 처리하면 학생 화면을 학교 승인 대기 상태로 갱신

## 5. 병원 방문 관리

- 로그인한 병원의 방문 목록 API 조회
- 오늘/이번 주 필터
- 학생명 또는 연계 ID 검색
- 3초 간격 자동 갱신 및 수동 새로고침
- 대기중, 진료완료 건수 표시
- 방문 세션 상세 정보 표시
- 대기중 방문에 대한 진료 완료 처리
- 완료 처리 시 방문 상태를 `TREATMENT_COMPLETED`로 변경
- 학교 승인 및 전송 기능은 아직 구현하지 않음

## 6. 학생 서비스 API

- 학생 대시보드 조회
- 학생 방문 기록 조회 및 상태 필터
- 학생 알림 목록 조회
- 자동 전달 동의 및 푸시 알림 설정 변경 API
- 병원 검색 API

## 7. 현재 UI 전용 기능

다음 학생 화면은 UI가 구현되어 있으나 일부 데이터가 정적 예시이거나 백엔드와 연결되지 않았다.

- 학생 홈 화면의 요약 정보
- 병원 목록 화면
- 유고결석 처리 내역 화면
- 알림 예시 화면
- 내 정보의 자동 전달 동의 및 푸시 알림 토글

특히 내 정보의 토글은 현재 React 로컬 상태만 변경하며 환경설정 API를 호출하지 않는다.

## 8. 백엔드 API 목록

### 공통 및 인증

- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/student-enrollment-verifications`
- `POST /api/v1/auth/signup/student`
- `POST /api/v1/auth/signup/hospital`
- `POST /api/v1/auth/student-verifications`

### QR 및 방문

- `POST /api/v1/qr-tokens`
- `GET /api/v1/qr-tokens/{token}`
- `POST /api/v1/visits`
- `GET /api/v1/visits/{visitId}`

### 병원

- `GET /api/v1/hospitals`
- `GET /api/v1/hospital/visits`
- `POST /api/v1/hospital/visits/{visitId}/complete-treatment`

### 학생

- `GET /api/v1/students/me/dashboard`
- `GET /api/v1/students/me/visits`
- `GET /api/v1/students/me/notifications`
- `PATCH /api/v1/students/me/preferences`

## 9. 저장 방식과 제한사항

- 현재 DB를 연결하지 않고 `ConcurrentHashMap`과 `ArrayList`에 데이터를 저장한다.
- 서버를 재시작하면 계정, QR, 방문, 알림 등 실행 중 생성된 데이터가 초기화된다.
- PostgreSQL/JPA 영구 저장소는 아직 구현되지 않았다.
- 실제 학교 LMS 로그인, 시간표 조회, 과목 선택, 유고결석 신청 API는 아직 구현되지 않았다.
- 학교 시스템으로 실제 데이터를 전송하지 않으며 현재는 방문 상태와 알림만 서버 메모리에서 변경한다.
- 로컬 개발용 CORS는 localhost와 사설 네트워크 대역의 프론트엔드 접속을 허용한다.

## 10. 확인된 동작

- 프론트엔드 프로덕션 빌드 성공
- 백엔드 전체 테스트 성공
- 병원 로그인 성공
- QR 토큰 발급 및 검증 성공
- QR PNG 데이터 생성 성공
- 시연 학생 본인 확인 성공
- QR 1회 사용 후 방문 생성 성공
- 생성된 방문이 병원 방문 목록에 반영되는 것 확인
