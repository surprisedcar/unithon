# AutoMedi Spring Server

설계 문서의 API를 구현한 Spring Boot 인메모리 프로토타입입니다. 기존 프론트엔드 코드는 변경하지 않습니다.

## 실행

```bash
./gradlew bootRun
```

테스트:

```bash
./gradlew test
```

기본 주소는 `http://localhost:8080/api/v1`입니다.

## 시연 계정

- 학생: `student / 1234`
- 병원: `hospital / 1234`
- 학생 본인 확인: `2023123456 / 김지수`
- 학생 가입 인증 코드: `한국대학교 / UNIV-2026`
- 병원 가입용 시연 등록 키: `H001 / AUTO-H001`

## 회원가입

- 학생 인증: `POST /api/v1/auth/student-enrollment-verifications`
- 학생 가입: `POST /api/v1/auth/signup/student` (학생 인증 ID 필수)
- 병원: `POST /api/v1/auth/signup/hospital`

비밀번호는 PBKDF2-HMAC-SHA256으로 솔트와 함께 해시합니다. 로그인 성공 시 HS256 JWT 액세스 토큰을 발급합니다. 학생 계정은 학교 재학 인증 결과가 있어야 생성할 수 있고, 병원 계정은 제휴 병원 코드와 별도로 발급된 등록 키가 일치해야 활성화됩니다.

## QR 확인 순서

1. 병원 계정으로 `POST /auth/login`
2. 액세스 토큰을 넣어 `POST /qr-tokens`
3. 반환된 `token`을 `GET /qr-tokens/{token}`으로 검증
4. 학생 확인 후 `POST /visits` 호출
5. 방문이 만들어지면 QR은 `USED`가 되어 다시 사용할 수 없음

현재 저장소는 인메모리이므로 서버를 재시작하면 데이터가 초기화됩니다. 운영 단계에서는 문서의 PostgreSQL/JPA 저장소로 교체합니다.
