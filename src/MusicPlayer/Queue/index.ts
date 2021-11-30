export class Queue<T> {
  private queue: Array<T>;
  private onPushEventCallback?: (item: T) => void;

  constructor() {
    this.queue = new Array<T>();
  }

  public empty() {
    return !this.queue.length;
  }

  public push(item: T) {
    this.queue.push(item);

    if (this.onPushEventCallback) this.onPushEventCallback(item);
  }

  public pop() {
    return this.queue.shift();
  }

  public top() {
    if (this.empty()) return undefined;

    return this.queue[0];
  }

  public size() {
    return this.queue.length;
  }

  public clear() {
    this.queue = new Array<T>();
  }

  public onPushEvent(cb: (item: T) => void) {
    this.onPushEventCallback = cb;
  }
}
