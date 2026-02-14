/* Module declarations for packages that may not ship types or need fallback */
declare module 'redis' {
  const createClient: (options?: { url?: string }) => {
    connect(): Promise<void>;
    ping(): Promise<string>;
    get(key: string): Promise<string | null>;
    setEx(key: string, seconds: number, value: string): Promise<void>;
    del(key: string | string[]): Promise<number>;
    keys(pattern: string): Promise<string[]>;
    exists(key: string): Promise<number>;
    on(event: string, listener: (err: Error) => void): void;
  };
  export { createClient };
}

declare module 'date-fns' {
  export function format(date: Date | number | string, formatStr: string): string;
  export function parseISO(dateStr: string): Date;
  export function isAfter(date: Date | number, dateToCompare: Date | number): boolean;
  export function isBefore(date: Date | number, dateToCompare: Date | number): boolean;
  export function differenceInDays(dateLeft: Date | number, dateRight: Date | number): number;
  export function addDays(date: Date | number, amount: number): Date;
  export function subDays(date: Date | number, amount: number): Date;
  export function startOfDay(date: Date | number): Date;
  export function endOfDay(date: Date | number): Date;
  export function startOfMonth(date: Date | number): Date;
  export function endOfMonth(date: Date | number): Date;
  export const min: (...dates: (Date | number)[]) => Date;
  export const max: (...dates: (Date | number)[]) => Date;
  export function formatDistanceToNow(date: Date | number | string, options?: { addSuffix?: boolean }): string;
}
