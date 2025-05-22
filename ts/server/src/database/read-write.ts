export type ReadWrite<T> = {
  read: T;
  write: T;
};

export function mapReadWrite<T, V>(inp: ReadWrite<T>, func: (t: T) => V): ReadWrite<V> {
  return {
    read: func(inp.read),
    write: func(inp.write),
  };
}
