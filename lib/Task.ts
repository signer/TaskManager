abstract class Task<T> {
    public value?: T;
    public abstract get key(): string;
}

export default Task;
