export const getUIElement = (container, label) =>
  container.getChildByLabel(label);

export function getByLabel(container, label) {
  for (const child of container.children) {
    if (child.label === label) {
      return child;
    }
    if (child.children?.length) {
      const found = getByLabel(child, label);
      if (found) return found;
    }
  }
  return null;
}
