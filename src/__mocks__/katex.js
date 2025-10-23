// Mock implementation of katex for Jest tests

const katex = {
  render: jest.fn(),
  renderToString: jest.fn((latex) => `<span class="katex">${latex}</span>`),
};

module.exports = {
  default: katex,
};
