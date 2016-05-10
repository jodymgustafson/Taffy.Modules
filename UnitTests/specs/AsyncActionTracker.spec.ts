/// <reference path="../../scripts/typings/jasmine/jasmine.d.ts" />
import {AsyncAction} from "../../src/AsyncAction";
import {AsyncActionTracker} from "../../src/AsyncActionTracker";

class TestAction extends AsyncAction
{
    constructor(private id: number)
    {
        super();
    }

    public start(): TestAction
    {
        return this;
    }

    public fireComplete(): void
    {
        this.complete();
    }
    public fireError(msg: string): void
    {
        this.error(msg);
    }
}

describe("AsyncActionTracker", () =>
{
    describe("when complete all actions", () =>
    {
        let tracker = new AsyncActionTracker<TestAction>();
        let actions = [new TestAction(1), new TestAction(2), new TestAction(3)];
        tracker.addActions(...actions);
        let count = 0;
        tracker.actionComplete(item => count += 1);
        let done = false;
        let doneErrors = false;
        tracker.done((tracker, hasErrors) =>
        {
            done = true;
            doneErrors = hasErrors;
        });

        it("should have 3 actions", () => expect(tracker.totalCount).toBe(3));
        it("should have no completed actions", () => expect(tracker.completedCount).toBe(0));
        it("should have no errors", () => expect(tracker.errorCount).toBe(0));
        it("should not be done", () => expect(tracker.isDone).toBe(false));
        it("should be 0% complete", () => expect(tracker.percentComplete).toBe(0));

        it("should be 33% complete", () =>
        {
            actions[0].fireComplete();
            expect(tracker.percentComplete).toBeCloseTo(0.33, 2);
            expect(tracker.completedCount).toBe(1);
            expect(tracker.isDone).toBe(false);
        });
        it("should be 66% complete", () =>
        {
            actions[1].fireComplete();
            expect(tracker.percentComplete).toBeCloseTo(0.67, 2);
            expect(tracker.completedCount).toBe(2);
            expect(tracker.isDone).toBe(false);
        });
        it("should be 100% complete", () =>
        {
            actions[2].fireComplete();
            expect(tracker.percentComplete).toBe(1);
            expect(tracker.errorCount).toBe(0);
            expect(tracker.completedCount).toBe(3);
            expect(tracker.isDone).toBe(true);
        });
        it("should have called callbacks", () =>
        {
            expect(count).toBe(3);
            expect(done).toBe(true);
            expect(doneErrors).toBe(false);
        });
    });
    describe("when error on an action", () =>
    {
        let tracker = new AsyncActionTracker<TestAction>();
        let actions = [new TestAction(1), new TestAction(2), new TestAction(3)];
        tracker.addActions(...actions);
        let count = 0;
        tracker.actionComplete(item => count += 1);
        let done = false;
        let doneErrors = false;
        tracker.done((tracker, hasErrors) =>
        {
            done = true;
            doneErrors = hasErrors;
        });
        let errorCnt = 0;
        let errmsg = "";
        tracker.actionError((item, msg) => { errorCnt++; errmsg = msg; });

        it("should have 1 error", () =>
        {
            actions[0].fireError("Error1");
            expect(errorCnt).toBe(1);
            expect(errmsg).toBe("Error1");
            expect(tracker.errorCount).toBe(1);
            expect(tracker.completedCount).toBe(0);
        });
        it("should have 1 completed", () =>
        {
            actions[0].fireComplete();
            expect(errorCnt).toBe(1);
            expect(tracker.errorCount).toBe(1);
            expect(tracker.completedCount).toBe(1);
            expect(tracker.isDone).toBe(false);
        });
        it("should have 2 completed", () =>
        {
            actions[0].fireComplete();
            expect(errorCnt).toBe(1);
            expect(tracker.errorCount).toBe(1);
            expect(tracker.completedCount).toBe(2);
            expect(tracker.isDone).toBe(true);
        });
        it("should have called callbacks", () =>
        {
            expect(count).toBe(2);
            expect(done).toBe(true);
            expect(doneErrors).toBe(true);
        });
    });
});
