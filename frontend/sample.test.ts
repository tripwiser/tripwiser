function multiply(a: number, b: number): number {
  return a * b;
}

test('multiplies 2 * 3 to equal 6', () => {
  expect(multiply(2, 3)).toBe(6);
}); 