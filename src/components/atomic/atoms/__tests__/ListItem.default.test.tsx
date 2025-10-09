import DefaultListItem, { ListItem } from '../ListItem';

describe('ListItem default export', () => {
  it('exports a default component identical to named export', () => {
    expect(typeof DefaultListItem).toBe('function');
    expect(DefaultListItem).toBe(ListItem);
  });
});
