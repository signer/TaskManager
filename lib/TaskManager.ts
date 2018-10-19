import Task from './Task';
import CacheManager from './CacheManager';

type Handler<T> = (value?: T, error?: Error) => void;
type Handlers<T> = Array<Handler<T>>;

interface ICacheManager<T> {
    set(key: string, value: T): void;
    get(key: string): T | null;
}

abstract class TaskManager<T> {
    private taskList: Array<Task<T>> = [];
    private workingCount = 0;
    private handlerMap = new Map<string, Handlers<T>>();

    constructor(public concurrentCapacity = 5, public cacheManager: ICacheManager<T> = new CacheManager<T>()) {}
    public addTask(task: Task<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.addTaskCallback(task, (value, error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(value);
                }
            });
        });
    }

    abstract execute(task: Task<T>): any;

    public addTaskCallback(task: Task<T>, handler: Handler<T>) {
        if (this.cacheManager) {
            const value = this.cacheManager.get(task.key);
            if (value) {
                handler(value);
                return;
            }
        }
        this.addTaskAndHandler(task, handler);
        this.runTask();
    }

    private addTaskAndHandler(task: Task<T>, handler: Handler<T>) {
        this.pushTask(task);
        let handlers = this.handlerMap.get(task.key);
        if (!handlers) {
            handlers = [];
        }
        handlers.push(handler);
        this.handlerMap.set(task.key, handlers);
    }

    private pushTask(task: Task<T>) {
        this.taskList.push(task);
    }

    private popTask(): Task<T> {
        const task = this.taskList.pop()!;
        return task;
    }

    private async runTask() {
        const exeedsConcurrentLimits = this.workingCount >= this.concurrentCapacity;
        const noTask = this.taskList.length === 0;
        if (exeedsConcurrentLimits || noTask) {
            return;
        }

        const task = this.popTask();
        this.workingCount += 1;

        try {
            const value = await this.execute(task);
            if (this.cacheManager) {
                this.cacheManager.set(task.key, value);
            }
            const handlers = this.handlerMap.get(task.key);
            handlers!.forEach((handler) => handler(value));
        } catch (e) {
            const handlers = this.handlerMap.get(task.key);
            handlers!.forEach((handler) => handler(undefined, e));
        }
        this.workingCount -= 1;
        this.runTask();
    }
}

export default TaskManager;
