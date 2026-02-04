import { Article } from './customArticleService';

interface CacheEntry {
    data: Article;
    timestamp: number;
}

export class ArticleCache {
    private cache = new Map<string, CacheEntry>();
    private pendingRequests = new Map<string, Promise<Article>>();
    private readonly TTL = 60 * 60 * 1000; // 1 hour

    private isExpired(entry: CacheEntry): boolean {
        const now = Date.now();
        return now - entry.timestamp > this.TTL;
    }

    get(articleId: string | number): Article | null {
        const entry = this.cache.get(String(articleId));
        if (!entry || this.isExpired(entry)) {
            if (entry) this.cache.delete(String(articleId));
            return null;
        }
        return entry.data;
    }

    set(articleId: string | number, data: Article): void {
        this.cache.set(String(articleId), {
            data,
            timestamp: Date.now(),
        });
    }

    getPendingRequest(articleId: string | number): Promise<Article> | undefined {
        return this.pendingRequests.get(String(articleId));
    }

    setPendingRequest(articleId: string | number, promise: Promise<Article>): void {
        const key = String(articleId);
        this.pendingRequests.set(key, promise);
        promise.finally(() => this.pendingRequests.delete(key));
    }

    delete(articleId: string | number): void {
        const key = String(articleId);
        this.cache.delete(key);
        this.pendingRequests.delete(key);
    }

    clear(): void {
        this.cache.clear();
        this.pendingRequests.clear();
    }

    clearExpired(): void {
        const entries = Array.from(this.cache.entries());
        for (const [key, entry] of entries) {
            if (this.isExpired(entry)) {
                this.cache.delete(key);
            }
        }
    }


    // Dev tools
    size(): number {
        return this.cache.size;
    }

    getStats() {
        return {
            size: this.cache.size,
            pending: this.pendingRequests.size,
            entries: Array.from(this.cache.entries()).map(([id, entry]) => {
                const remainingMs = this.TTL - (Date.now() - entry.timestamp);
                const remainingMinutes = Math.floor(remainingMs / 60000);
                const remainingHours = Math.floor(remainingMinutes / 60);
                const remainingMins = remainingMinutes % 60;
                const expiresIn = this.isExpired(entry)
                    ? 'expired'
                    : remainingHours > 0
                        ? `${remainingHours}h${remainingMins > 0 ? ` ${remainingMins}m` : ''}`
                        : `${remainingMinutes}m`;
                return {
                    id,
                    name: entry.data.name,
                    cachedAt: new Date(entry.timestamp).toISOString(),
                    expiresIn,
                };
            }),
        };
    }
}

export const articleCache = new ArticleCache();

if (typeof window !== 'undefined') {
    setInterval(() => articleCache.clearExpired(), 5 * 60 * 1000);

    if (process.env.NODE_ENV === 'development') {
        (window as any).__articleCache__ = {
            stats: () => articleCache.getStats(),
            clear: () => articleCache.clear(),
            size: () => articleCache.size(),
        };
    }
}
