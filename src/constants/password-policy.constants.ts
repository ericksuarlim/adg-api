export const PASSWORD_POLICY = {
    minLength: 9,
    validators: ['minLength', 'uppercase', 'lowercase', 'number'] as const,
};

export type PasswordValidatorKey = typeof PASSWORD_POLICY.validators[number];
