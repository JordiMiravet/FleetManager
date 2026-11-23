export function resolvingQuery<T>(value: T) {
  return { exec: jest.fn().mockResolvedValue(value) };
}
