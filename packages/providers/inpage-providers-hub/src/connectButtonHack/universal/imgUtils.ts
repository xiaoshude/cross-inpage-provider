import { ICON_MAX_SIZE, ICON_MIN_SIZE } from './consts';
import { dbg, isClickable } from './utils';

export function replaceIcon(originalNode: HTMLElement, newIconSrc: string) {
  if (originalNode instanceof HTMLImageElement) {
    originalNode.src = newIconSrc;
    originalNode.removeAttribute('srcset');
    return originalNode;
  } else {
    const imgNode = createImageEle(newIconSrc);
    const style = window.getComputedStyle(originalNode);
    imgNode.style.width = style.width;
    imgNode.style.height = style.height;
    imgNode.classList.add(...Array.from(originalNode.classList));
    originalNode.replaceWith(imgNode);
    return imgNode;
  }
}

export function createImageEle(src: string) {
  const img = new Image();
  img.src = src;
  img.style.maxWidth = '100%';
  img.style.maxHeight = '100%';
  return img;
}

export function findIconNodesByParent(parent: HTMLElement) {
  const walker = document.createTreeWalker(parent, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      const hasBgImg = window.getComputedStyle(node as HTMLElement).backgroundImage !== 'none';
      return node.nodeName === 'IMG' || hasBgImg || node.nodeName === 'svg'
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    },
  });
  const matchingNodes: HTMLElement[] = [];
  while (walker.nextNode()) {
    matchingNodes.push(walker.currentNode as HTMLElement);
  }
  return matchingNodes;
}
/**
 * @description:
 * make sure that there is only one icon node match walletIcon to ignore hidden icon and other icon
 */
export function findWalletIconByParent(parent: HTMLElement, textNode: Text) {
  const iconNodes = findIconNodesByParent(parent);
  if (iconNodes.length > 1) {
    return;
  }
  const icon = iconNodes[0];
  if (!icon || !textNode.parentElement || !isWalletIcon(icon, textNode.parentElement)) {
    dbg(`===>${icon?.tagName || ''} it is not a wallet icon`);
    return;
  }
  return icon;
}

export function isWalletIcon(walletIcon: HTMLElement, textNode: HTMLElement) {
  const { width, height } = walletIcon.getBoundingClientRect();
  const isSizeMatch =
    width < ICON_MAX_SIZE &&
    width > ICON_MIN_SIZE &&
    height < ICON_MAX_SIZE &&
    height > ICON_MIN_SIZE;
  return isClickable(walletIcon) && isSizeMatch;
}
