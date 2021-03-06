var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var { default: TaskManager } = require('../dist/TaskManager.js');

chai.use(chaiAsPromised);
chai.should();

describe('TaskManager Test', () => {
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

    function makeTasks(concurrentCapacity, numCount) {
        var taskmanager = new SquareTaskManager(concurrentCapacity);
        var promises = [];
        for (var i = 0; i < numCount; i++) {
            var task = new SquareTask(i);
            var promise = taskmanager.addTask(task);
            promises.push(promise.should.eventually.equal(i * i));
        }
        return promises;
    }

    it('test taskmanager result', () => {
        var taskmanager = new SquareTaskManager();
        var promises = [];
        for (var i = 0; i < 10; i++) {
            var task = new SquareTask(i);
            var promise = taskmanager.addTask(task);
            promises.push(promise.should.eventually.equal(i * i));
        }
        var task = new SquareTask(-1);
        var promise = taskmanager.addTask(task);
        promises.push(promise.should.be.rejected);
        return Promise.all(promises);
    })

    it('test taskmanager concurrentCapacity=1', () => {
        var numCount = 10;
        var promises = makeTasks(1, numCount);
        var begin = Date.now();
        return Promise.all(promises).then(() => {
            var duration = (Date.now() - begin) / 100;
            return Math.round(duration);
        }).should.eventually.equal(Math.round(TASK_DURATION * numCount / 100));
    });

    it('test taskmanager concurrentCapacity=10', () => {
        var numCount = 10;
        var concurrentCapacity = 10;
        var promises = makeTasks(concurrentCapacity, numCount);
        var begin = Date.now();
        return Promise.all(promises).then(() => {
            var duration = (Date.now() - begin) / 100;
            return Math.round(duration);
        }).should.eventually.equal(Math.round(TASK_DURATION * numCount / 100 / concurrentCapacity));
    });

    it('test taskmanager cache', () => {
        var taskmanager = new SquareTaskManager(1);
        var promises = [2, 3, 2, 3, 2, 3, 2, 3].map(num => new SquareTask(num))
            .map(task => taskmanager.addTask(task));
        var begin = Date.now();
        return Promise.all(promises).then(() => {
            var duration = (Date.now() - begin) / 100;
            return Math.round(duration);
        }).should.eventually.equal(Math.round(TASK_DURATION * 2 / 100));
    })

    it('test taskmanager fifo', () => {
        var results = [];
        for (var i = 0; i < 10; i++) {
            results.push(i * i);
        }
        return Promise.all(makeTasks(1, 10)).should.eventually.deep.equal(results);
    });
});