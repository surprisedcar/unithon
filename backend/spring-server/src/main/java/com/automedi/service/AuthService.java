package com.automedi.service;

import com.automedi.api.ApiDtos.LoginResponse;
import com.automedi.api.ApiDtos.SignupResponse;
import com.automedi.api.ApiDtos.UserResponse;
import com.automedi.common.ApiException;
import com.automedi.domain.Role;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    public record Session(String userId, String name, Role role) {}
    private record Account(
        String id,
        String loginId,
        byte[] salt,
        byte[] passwordHash,
        String userId,
        String name,
        Role role
    ) {}

    private final Map<String, Account> accountsByLoginId = new ConcurrentHashMap<>();
    private final PasswordHasher passwordHasher;
    private final JwtService jwtService;

    public AuthService(PasswordHasher passwordHasher, JwtService jwtService) {
        this.passwordHasher = passwordHasher;
        this.jwtService = jwtService;
        addAccount("account-student-1", "student", "1234", "student-1", "김지수", Role.STUDENT);
        addAccount("account-hospital-1", "hospital", "1234", "hospital-1", "OO병원 접수 담당자", Role.HOSPITAL);
    }

    public LoginResponse login(String loginId, String password) {
        Account account = accountsByLoginId.get(loginId);
        if (account == null || !passwordHasher.matches(password, account.salt(), account.passwordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH_INVALID_CREDENTIALS", "아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        String accessToken = jwtService.issue(account.userId(), account.name(), account.role());
        return new LoginResponse(
            accessToken,
            jwtService.accessTokenSeconds(),
            new UserResponse(account.userId(), account.role(), account.name())
        );
    }

    public synchronized SignupResponse registerStudent(String loginId, String password, String studentId, String name) {
        Account account = addAccount(UUID.randomUUID().toString(), loginId, password, studentId, name, Role.STUDENT);
        return new SignupResponse(account.id(), account.loginId(), account.role(), "ACTIVE");
    }

    public synchronized SignupResponse registerHospital(String loginId, String password, String hospitalId, String managerName) {
        Account account = addAccount(UUID.randomUUID().toString(), loginId, password, hospitalId, managerName, Role.HOSPITAL);
        return new SignupResponse(account.id(), account.loginId(), account.role(), "ACTIVE");
    }

    public Session require(String authorization, Role role) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED", "인증이 필요합니다.");
        }
        String token = authorization.substring(7);
        var principal = jwtService.verify(token);
        Session session = new Session(principal.userId(), principal.name(), principal.role());
        if (session.role() != role) {
            throw new ApiException(HttpStatus.FORBIDDEN, "AUTH_FORBIDDEN", "이 작업을 수행할 권한이 없습니다.");
        }
        return session;
    }

    private Account addAccount(String id, String loginId, String password, String userId, String name, Role role) {
        if (accountsByLoginId.containsKey(loginId)) {
            throw new ApiException(HttpStatus.CONFLICT, "AUTH_LOGIN_ID_DUPLICATED", "이미 사용 중인 아이디입니다.");
        }
        byte[] salt = passwordHasher.newSalt();
        Account account = new Account(id, loginId, salt, passwordHasher.hash(password, salt), userId, name, role);
        accountsByLoginId.put(loginId, account);
        return account;
    }
}
