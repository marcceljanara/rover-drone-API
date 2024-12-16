import hello from '../src/hello';

describe('Hello World', () => {
  it('should print hello world', () => {
    expect(hello()).toBe('Hello World!');
  });
});
