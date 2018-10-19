# TaskManager

对异步任务进行调度处理

## Features

- 支持最大并发任务
- 支持任务结果缓存

## Example

```js
    // 计算非负整数的平方
    class SquareTask { 
        constructor(num) {
            this.num = num;
        }

        get hash() {
            return '' + this.num;
        }
    }

    var TASK_DURATION = 100;
    class SquareTaskManager extends TaskManager {
        constructor(concurrentCapacity = 5) {
            super(concurrentCapacity);
        }
        execute(task) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (task.num >= 0) {
                        resolve(task.num * task.num);
                    } else {
                        reject('num should >= 0, meet ' + task.num);
                    }
                }, TASK_DURATION);
            });
        }
    }

    var taskManager = new SquareTaskManager(concurrentCapacity);
    taskManager.addTask(new SquareTask(1)).then(result => console.log(result)); // 1
    taskManager.addTask(new SquareTask(2)).then(result => console.log(result)); // 4
    taskManager.addTask(new SquareTask(4)).then(result => console.log(result)); // 16
    taskManager.addTask(new SquareTask(-1)).then(result => console.log(result)); // rejected
```