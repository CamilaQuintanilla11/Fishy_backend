import { createHash } from 'node:crypto';

export function hash(password: string): string {
    return createHash('sha256').update(password).digest('hex');
}