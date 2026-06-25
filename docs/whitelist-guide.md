# 회원가입 허용 이메일(화이트리스트) 관리 방법

## 1. Prisma Studio로 추가하기 (가장 간단)

터미널에서:
```bash
npx prisma studio
```

브라우저가 열리면:
1. 좌측에서 `AllowedEmail` 테이블 클릭
2. 우측 상단 `Add record` 클릭
3. `email` 칸에 허용할 이메일 입력 (예: `friend@example.com`)
4. `note` 칸에 메모 입력 (예: `철수` — 누구에게 준 초대인지 기억하기 좋게)
5. `Save 1 change` 클릭

이제 그 이메일로만 `/login`에서 회원가입이 가능합니다.

## 2. SQL로 직접 추가하기 (DB에 바로 접속 가능한 경우)

```sql
INSERT INTO "AllowedEmail" (id, email, note, "createdAt")
VALUES (gen_random_uuid(), 'friend@example.com', '철수', now());
```

## 3. 초대를 취소하고 싶을 때

Prisma Studio에서 `AllowedEmail` 테이블의 해당 row를 찾아 삭제하면 됩니다.
**주의:** 이미 가입을 완료한 사람의 계정(`User` 테이블)은 그대로 남아있습니다 — 화이트리스트는 "가입 시점"에만 검사하므로, 이미 가입한 사람의 접근을 막으려면 `User` 테이블에서 직접 그 계정을 삭제해야 합니다.

## 본인(관리자) 계정은 어떻게 만드나요?

배포 후 맨 처음에는 `AllowedEmail`에도 아무도 없는 상태입니다. 본인 이메일을 가장 먼저 직접 추가해주세요:

```bash
npx prisma studio
```
`AllowedEmail` 테이블에 본인 이메일을 추가 → `/login`에서 회원가입 → 이후 지인들 이메일을 하나씩 추가해주시면 됩니다.
