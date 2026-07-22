const test = require('node:test');
const assert = require('node:assert/strict');

const {
    createSessionStore,
    signSessionCookie,
    verifySessionCookie,
    parseCookieHeader,
    readSession,
    setSessionCookie,
    clearSessionCookie,
    buildSessionCookieHeader,
    COOKIE_NAME,
    MIN_SECRET_LENGTH
} = require('../../../src/queue-monitor/auth/session');

const SECRET = 'a'.repeat(MIN_SECRET_LENGTH) + '-test-secret-do-not-use-in-prod';
const USER = { sub: 'user-1', name: 'Test Operator', email: 'op@example.com' };

function mockReq(cookieHeader) {
    return { headers: cookieHeader ? { cookie: cookieHeader } : {} };
}

function mockRes() {
    const headers = {};
    return {
        headers,
        setHeader(name, value) { headers[name] = value; }
    };
}

test('createSessionStore requires secret', () => {
    assert.throws(() => createSessionStore({}), /session secret is required/);
});

test('createSessionStore rejects short secret', () => {
    assert.throws(
        () => createSessionStore({ secret: 'short' }),
        new RegExp(`session secret must be at least ${MIN_SECRET_LENGTH} chars`)
    );
});

test('createSessionStore accepts 32+ char secret', () => {
    const store = createSessionStore({ secret: SECRET });
    assert.equal(store.maxAgeSeconds, 86400);
    assert.equal(typeof store.create, 'function');
    assert.equal(store._size(), 0);
});

test('create returns sessionId, csrf and stores session', () => {
    const store = createSessionStore({ secret: SECRET });
    const result = store.create(USER);

    assert.equal(typeof result.sessionId, 'string');
    assert.ok(result.sessionId.length > 0);
    assert.equal(typeof result.csrf, 'string');
    assert.ok(result.csrf.length > 0);
    assert.equal(typeof result.expiresAt, 'number');
    assert.ok(result.expiresAt > Math.floor(Date.now() / 1000));
    assert.equal(store._size(), 1);
});

test('get returns session by sessionId', () => {
    const store = createSessionStore({ secret: SECRET });
    const { sessionId } = store.create(USER);

    const session = store.get(sessionId);
    assert.deepEqual(session.user, USER);
    assert.equal(typeof session.csrf, 'string');
});

test('get returns null for unknown sessionId', () => {
    const store = createSessionStore({ secret: SECRET });
    assert.equal(store.get('nonexistent'), null);
    assert.equal(store.get(''), null);
    assert.equal(store.get(null), null);
});

test('destroy removes session', () => {
    const store = createSessionStore({ secret: SECRET });
    const { sessionId } = store.create(USER);
    assert.equal(store.get(sessionId) !== null, true);

    store.destroy(sessionId);
    assert.equal(store.get(sessionId), null);
    assert.equal(store._size(), 0);
});

test('get auto-purges expired session', () => {
    const store = createSessionStore({ secret: SECRET, maxAgeSeconds: -10 });
    const { sessionId } = store.create(USER);
    // expiresAt = now - 10, т.е. уже истекла
    assert.equal(store.get(sessionId), null);
    assert.equal(store._size(), 0);
});

// --- Cookie signing ---

test('signSessionCookie produces payload.hmac format', () => {
    const value = signSessionCookie(SECRET, 'sid-1', 'csrf-1', 9999999999);
    const parts = value.split('.');
    assert.ok(parts.length >= 2, 'cookie must contain payload and signature');
});

test('verifySessionCookie roundtrip returns parsed claims', () => {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const value = signSessionCookie(SECRET, 'sid-1', 'csrf-1', expiresAt);

    const result = verifySessionCookie(SECRET, value);
    assert.equal(result.sessionId, 'sid-1');
    assert.equal(result.csrf, 'csrf-1');
    assert.equal(result.expiresAt, expiresAt);
});

test('verifySessionCookie returns null for tampered signature', () => {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const value = signSessionCookie(SECRET, 'sid-1', 'csrf-1', expiresAt);
    // Меняем последний символ HMAC.
    const tampered = value.slice(0, -1) + (value.endsWith('A') ? 'B' : 'A');

    assert.equal(verifySessionCookie(SECRET, tampered), null);
});

test('verifySessionCookie returns null for wrong secret', () => {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const value = signSessionCookie(SECRET, 'sid-1', 'csrf-1', expiresAt);

    assert.equal(verifySessionCookie('b'.repeat(40) + '-other-secret', value), null);
});

test('verifySessionCookie returns null for expired cookie', () => {
    const expiresAt = Math.floor(Date.now() / 1000) - 10;
    const value = signSessionCookie(SECRET, 'sid-1', 'csrf-1', expiresAt);

    assert.equal(verifySessionCookie(SECRET, value), null);
});

test('verifySessionCookie returns null for malformed input', () => {
    assert.equal(verifySessionCookie(SECRET, ''), null);
    assert.equal(verifySessionCookie(SECRET, 'no-dot-here'), null);
    assert.equal(verifySessionCookie(SECRET, 'payload.not-base64-json!!'), null);
    assert.equal(verifySessionCookie(SECRET, null), null);
    assert.equal(verifySessionCookie(SECRET, undefined), null);
});

// --- Cookie header parsing ---

test('parseCookieHeader parses multiple cookies', () => {
    const cookies = parseCookieHeader('session=abc; theme=dark; foo=bar');
    assert.equal(cookies.session, 'abc');
    assert.equal(cookies.theme, 'dark');
    assert.equal(cookies.foo, 'bar');
});

test('parseCookieHeader handles empty/missing header', () => {
    assert.deepEqual(parseCookieHeader(''), {});
    assert.deepEqual(parseCookieHeader(null), {});
    assert.deepEqual(parseCookieHeader(undefined), {});
});

// --- readSession integration ---

test('readSession returns session for valid request', () => {
    const store = createSessionStore({ secret: SECRET });
    const { sessionId, csrf, expiresAt } = store.create(USER);
    const cookieValue = signSessionCookie(SECRET, sessionId, csrf, expiresAt);

    const req = mockReq(`${COOKIE_NAME}=${cookieValue}`);
    const result = readSession(req, store);

    assert.equal(result.sessionId, sessionId);
    assert.deepEqual(result.user, USER);
    assert.equal(result.csrf, csrf);
});

test('readSession returns null for missing cookie', () => {
    const store = createSessionStore({ secret: SECRET });
    const req = mockReq(null);
    assert.equal(readSession(req, store), null);
});

test('readSession returns null when session destroyed server-side', () => {
    const store = createSessionStore({ secret: SECRET });
    const { sessionId, csrf, expiresAt } = store.create(USER);
    const cookieValue = signSessionCookie(SECRET, sessionId, csrf, expiresAt);

    store.destroy(sessionId); // logout на другом запросе

    const req = mockReq(`${COOKIE_NAME}=${cookieValue}`);
    assert.equal(readSession(req, store), null);
});

test('readSession returns null when csrf in cookie does not match store', () => {
    const store = createSessionStore({ secret: SECRET });
    const { sessionId, expiresAt } = store.create(USER);
    // Cookie с подменённым csrf (другой) но валидной подписью для подделанного csrf.
    const forgedCsrf = 'forged-csrf-token';
    const cookieValue = signSessionCookie(SECRET, sessionId, forgedCsrf, expiresAt);

    const req = mockReq(`${COOKIE_NAME}=${cookieValue}`);
    assert.equal(readSession(req, store), null);
});

// --- Set-Cookie response helpers ---

test('buildSessionCookieHeader includes HttpOnly, SameSite, Max-Age', () => {
    const header = buildSessionCookieHeader('sid.x', 3600, { secure: false });
    assert.ok(header.startsWith(`${COOKIE_NAME}=sid.x`));
    assert.ok(header.includes('HttpOnly'));
    assert.ok(header.includes('SameSite=Lax'));
    assert.ok(header.includes('Max-Age=3600'));
    assert.ok(header.includes('Path=/'));
    assert.ok(!header.includes('Secure'));
});

test('buildSessionCookieHeader adds Secure when requested', () => {
    const header = buildSessionCookieHeader('sid.x', 3600, { secure: true });
    assert.ok(header.includes('Secure'));
});

test('setSessionCookie writes Set-Cookie header to response', () => {
    const store = createSessionStore({ secret: SECRET });
    const res = mockRes();
    const expiresAt = Math.floor(Date.now() / 1000) + store.maxAgeSeconds;

    setSessionCookie(res, store, 'sid-1', 'csrf-1', expiresAt, { secure: false });

    assert.ok(res.headers['Set-Cookie'].startsWith(`${COOKIE_NAME}=`));
    assert.ok(res.headers['Set-Cookie'].includes('HttpOnly'));
});

test('clearSessionCookie writes Max-Age=0 to expire cookie', () => {
    const res = mockRes();
    clearSessionCookie(res, { secure: false });
    assert.ok(res.headers['Set-Cookie'].includes('Max-Age=0'));
});

test('setSessionCookie value round-trips through readSession', () => {
    const store = createSessionStore({ secret: SECRET });
    const { sessionId, csrf, expiresAt } = store.create(USER);
    const res = mockRes();
    setSessionCookie(res, store, sessionId, csrf, expiresAt);

    // Извлекаем cookie-значение из Set-Cookie header.
    const setCookie = res.headers['Set-Cookie'];
    const cookieValue = setCookie.split(';')[0].split('=').slice(1).join('=');

    const req = mockReq(`${COOKIE_NAME}=${cookieValue}`);
    const result = readSession(req, store);
    assert.equal(result.sessionId, sessionId);
});
