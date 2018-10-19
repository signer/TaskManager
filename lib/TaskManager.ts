// import Task from './Task';
import CacheStorage from './CacheStorage';

type Handler<T> = (value?: T, error?: Error) => void;
type Handlers<T> = Array<Handler<T>>;

interface ICacheStorage<T> {
    set(key: string, value: T): void;
    get(key: string): T | null;
}

interface Task {
    hash: string;
};

abstract class TaskManager<T> {
    private taskList: Array<Task> = [];
    private workingCount = 0;
    private handlerMap = new Map<string, Handlers<T>>();

    constructor(private concurrentCapacity = 5, private cacheStorage: ICacheStorage<T> = new CacheStorage<T>()) {}
    public addTask(task: Task): Promise<T> {
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

    abstract execute(task: Task): Promise<T>;

    public addTaskCallback(task: Task, handler: Handler<T>) {
        if (this.cacheStorage) {
            const value = this.cacheStorage.get(task.hash);
            if (value) {
                handler(value);
                return;
            }
        }
        this.addTaskAndHandler(task, handler);
        this.runTask();
    }

    private addTaskAndHandler(task: Task, handler: Handler<T>) {
        this.pushTask(task);
        let handlers = this.handlerMap.get(task.hash);
        if (!handlers) {
            handlers = [];
        }
        handlers.push(handler);
        this.handlerMap.set(task.hash, handlers);
    }

    private pushTask(task: Task) {
        this.taskList.push(task);
    }

    private popTask(): Task {
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
            if (this.cacheStorage) {
                this.cacheStorage.set(task.hash, value);
            }
            const handlers = this.handlerMap.get(task.hash);
            handlers!.forEach((handler) => handler(value));
        } catch (e) {
            const handlers = this.handlerMap.get(task.hash);
            handlers!.forEach((handler) => handler(undefined, e));
        }
        this.workingCount -= 1;
        this.runTask();
    }
}

export default TaskManager;
