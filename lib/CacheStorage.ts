import Cache from './Cache';

class CacheManager<T> {
    private cacheList: Array<Cache<T>> = [];
    constructor(private cacheCapacity = 5) {}
    public set(key: string, value: T) {
        let cache = this.cacheList.filter((item) => item.key === key)[0];
        if (!cache) {
            cache = new Cache(key, value);
            this.cacheList.push(cache);
            this.shrink();
        } else {
            cache.value = value;
        }
    }
    public get(key: string): T | null {
        const cache = this.cacheList.filter((item) => item.key === key)[0];
        if (cache) {
            cache.visit();
            return cache.value;
        }
        return null;
    }
    public shrink() {
        this.cacheList.sort((a, b) => (a.priority - b.priority));

        if (this.cacheList.length > this.cacheCapacity) {
            this.cacheList.splice(0, this.cacheCapacity / 2);
        }
    }

    public clear() {
        this.cacheList = [];
    }
}

export default CacheManager;
