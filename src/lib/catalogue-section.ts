/** Bound display-only catalogue waits; never use for booking/payment mutations. */
export async function catalogueSection<T>(request: Promise<T>, fallback: T, timeoutMs = 12000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      request.catch(() => fallback),
      new Promise<T>((resolve) => { timer = setTimeout(() => resolve(fallback), timeoutMs); }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
