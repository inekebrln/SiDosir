// resources/js/routes/two-factor.ts

export const qrCode = () => ({
    method: 'get' as const,
    url: '/user/two-factor-qr-code',
});

export const secretKey = () => ({
    method: 'get' as const,
    url: '/user/two-factor-secret-key',
});

export const recoveryCodes = () => ({
    method: 'get' as const,
    url: '/user/two-factor-recovery-codes',
});

export const confirm = () => ({
    method: 'post' as const,
    url: '/user/confirmed-two-factor-authentication',
});