import { useEffect, useRef, type RefObject } from 'react';

/**
 * 在 Web Component 元素上安全绑定事件监听器。
 *
 * 遵循 mdui 官方 React 集成指南：https://www.mdui.org/zh-cn/docs/2/frameworks/react
 * React 不支持 Web Component 自定义事件，需通过 ref + addEventListener 手动绑定。
 *
 * 此 hook 解决了以下问题：
 * - chen-the-dawnstreak 部分组件缺少事件映射（如 Button 缺少 onClick）
 * - mdui 组件内部 stopPropagation 阻断原生事件后重新 emit 的时序问题
 * - useEffect 无依赖数组导致的监听器频繁重绑定
 *
 * @param ref - Web Component 元素的 ref
 * @param event - DOM 事件名称（如 'click', 'input', 'change'）
 * @param handler - 事件处理函数
 */
export function useWebComponentEvent(
  ref: RefObject<HTMLElement | null>,
  event: string,
  handler: (e: Event) => void,
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const listener = (e: Event) => handlerRef.current(e);
    el.addEventListener(event, listener);
    return () => el.removeEventListener(event, listener);
  }, [ref, event]);
}
