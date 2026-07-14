export {};

declare global {
  interface PromiseLike<T> {
    finally(onfinally?: (() => void) | null): PromiseLike<T>;
  }
}
