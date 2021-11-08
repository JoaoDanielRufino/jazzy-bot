export class Queue<T> {
  private queue: Array<T>;
  private onPushEventCallback?: () => void;

  constructor() {
    this.queue = new Array<T>();
  }

  public empty() {
    return !this.queue.length;
  }

  public push(item: T) {
    this.queue.push(item);

    if (this.onPushEventCallback) this.onPushEventCallback();
  }

  public pop() {
    return this.queue.shift();
  }

  public top() {
    return this.queue[0];
  }

  public onPushEvent(cb: () => void) {
    this.onPushEventCallback = cb;
  }
}
