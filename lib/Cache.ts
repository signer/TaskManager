class Cache<T> {
    private visitCount = 1;
    private timestamp = Date.now();
    constructor(public key: string | number, public value: T) {}
    public visit() {
        this.visitCount += 1;
        this.timestamp = Date.now();
    }
    
    public get priority() {
        const ONE_VISIT_VALUE_TIME = 60000;
        return this.timestamp + this.visitCount * ONE_VISIT_VALUE_TIME;
    }
}

export default Cache;
