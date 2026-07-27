export const hasPrimaryVerification = (user) => Boolean(
    user?.phone_verified || user?.phone_verified_at
);
