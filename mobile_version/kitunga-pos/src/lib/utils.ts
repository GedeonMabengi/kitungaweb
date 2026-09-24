// src/lib/utils.ts

/**
 * Combine plusieurs styles React Native.
 * Équivalent RN de cn() pour les styles en tableau.
 *
 * Usage :
 *   <View style={cn(styles.card, isActive && styles.cardActive)} />
 */
export function cn<T>(...styles: (T | false | null | undefined)[]): T[] {
    return styles.filter(Boolean) as T[];
}

/** Génère un identifiant local unique (pour les lignes SQLite offline) */
export function uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/** Sleep utilitaire */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retourne un numéro de document type "FAC-20250924-0012" */
export function generateDocNumber(prefix: string, sequence: number): string {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${prefix}-${y}${m}${d}-${String(sequence).padStart(4, '0')}`;
}