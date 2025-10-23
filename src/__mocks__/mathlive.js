// Mock implementation of mathlive for Jest tests

class MockMathfieldElement extends HTMLElement {
  constructor() {
    super();
    this.value = '';
    this.mathModeSpace = '';
    this.mathVirtualKeyboardPolicy = 'manual';
  }

  focus() {
    // Mock focus
  }

  executeCommand() {
    // Mock executeCommand
  }

  addEventListener() {
    // Mock addEventListener
  }

  removeEventListener() {
    // Mock removeEventListener
  }
}

module.exports = {
  MathfieldElement: MockMathfieldElement,
};
