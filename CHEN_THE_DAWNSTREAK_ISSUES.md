# chen-the-dawnstreak 框架问题缓解措施文档

> **项目**: classtop-remix
> **环境**: React 19.2.4 + mdui 2.1.4 + chen-the-dawnstreak 2.1.0 + Electron 40
> **日期**: 2025-02-13
> **目的**: 记录 chen-the-dawnstreak 框架在 React 19 + mdui 2 环境下的已知问题，供框架团队参考修复

---

## 背景

[mdui 官方文档](https://www.mdui.org/zh-cn/docs/2/frameworks/react)明确指出：

> 由于 React 不支持自定义事件，因此在使用 mdui 组件提供的事件时，需要先使用 `ref` 属性获取组件的引用。

chen-the-dawnstreak 作为 mdui 的 React 封装库，通过 `createComponent()` 函数将 mdui Web Components 包装为 React 组件，核心职责是：

1. 拦截事件 props（如 `onInput`、`onChange`），通过 `ref` + `addEventListener` 绑定到 DOM 元素
2. 将非事件 props 透传给 `React.createElement(tagName, ...)`
3. 提供 TypeScript 类型声明

**当前 `createComponent` 实现核心逻辑**:

```javascript
// create-component.js
export function createComponent(tagName, eventMap) {
    const eventEntries = eventMap ? Object.entries(eventMap) : [];
    const eventPropNames = new Set(eventEntries.map(([propName]) => propName));

    const Component = forwardRef((props, forwardedRef) => {
        const internalRef = useRef(null);
        const eventHandlers = {};
        const elementProps = {};

        for (const [key, value] of Object.entries(props)) {
            if (eventPropNames.has(key)) {
                if (typeof value === 'function') {
                    eventHandlers[key] = value;
                }
            } else if (key === 'className') {
                elementProps['class'] = value;
            } else if (key === 'children') {
                // skip
            } else {
                elementProps[key] = value;  // ⚠️ 未映射的 on* props 也会进入这里
            }
        }

        useEffect(() => {  // ⚠️ 无依赖数组
            const el = internalRef.current;
            if (!el || eventEntries.length === 0) return;
            const listeners = [];
            for (const [propName, domEvent] of eventEntries) {
                const handler = eventHandlers[propName];
                if (handler) {
                    el.addEventListener(domEvent, handler);
                    listeners.push([domEvent, handler]);
                }
            }
            return () => {
                for (const [domEvent, handler] of listeners) {
                    el.removeEventListener(domEvent, handler);
                }
            };
        });

        return createElement(tagName, {
            ...elementProps,
            ref: mergeRefs(internalRef, forwardedRef),
        }, props.children);
    });
    return Component;
}
```

---

## 问题 1（Critical）：交互组件缺少 `onClick` 事件映射

### 现象

`<Button onClick={fn}>` 点击无反应（或行为不可靠）。

### 根因

以下组件的 `eventMap` 缺少 `onClick: 'click'` 映射：

| 组件 | 当前映射的事件 | 缺少 |
|------|---------------|------|
| `Button` | onFocus, onBlur, onInvalid | **onClick** |
| `Fab` | onFocus, onBlur, onInvalid | **onClick** |
| `Card` | （无） | **onClick** |
| `ButtonIcon` | onFocus, onBlur, onChange, onInvalid | **onClick** |
| `Chip` | onFocus, onBlur, onInvalid, onChange, onDelete | **onClick** |
| `ListItem` | onFocus, onBlur | **onClick** |
| `NavigationBarItem` | onFocus, onBlur | **onClick** |
| `SegmentedButton` | onFocus, onBlur, onInvalid | **onClick** |

当 `onClick` 不在 `eventPropNames` 中时，它被放入 `elementProps` 并传递给 `createElement('mdui-button', { onClick: fn })`。

React 19 对自定义元素的 `onClick` 处理（`setPropOnCustomElement`）:
```javascript
case "onClick":
    null != value &&
        (domElement.onclick = noop$1);  // 仅设置 noop，依赖事件委派
    break;
```

React 19 设置 `domElement.onclick = noop` 并依赖根级事件委派来分发 `click` 事件。**理论上**这应该工作，但在实际使用中（特别是在 Dialog action slot 中使用时），点击事件未能可靠触发回调函数。

### 建议修复

为所有可交互组件添加 `onClick: 'click'` 映射：

```javascript
export const Button = createComponent('mdui-button', {
    onClick: 'click',      // ← 添加
    onFocus: 'focus',
    onBlur: 'blur',
    onInvalid: 'invalid',
});

export const Fab = createComponent('mdui-fab', {
    onClick: 'click',      // ← 添加
    onFocus: 'focus',
    onBlur: 'blur',
    onInvalid: 'invalid',
});

export const Card = createComponent('mdui-card', {
    onClick: 'click',      // ← 添加
});
```

通过 `addEventListener` 显式绑定 `click` 事件可确保在所有场景下可靠工作，避免依赖 React 对自定义元素的事件委派行为。

---

## 问题 2（Critical）：Dialog `close` 事件从子组件 Select/Dropdown 冒泡

### 现象

在 `<Dialog>` 内部使用 `<Select>` 时，从 Select 下拉菜单选择选项后，Dialog 意外关闭。

### 根因

mdui 的 `Select` 组件内部使用 `Dropdown`，Dropdown 关闭时通过 `this.emit('close')` 派发 `close` 事件。该事件配置为 `{ bubbles: true, composed: true }`，因此会穿越 Shadow DOM 边界冒泡到父级 Dialog。

Dialog 的 `onClose` 监听 `'close'` 事件。当 Select 的 Dropdown 关闭时：

```
Select 内部 Dropdown → emit('close') → 冒泡 → Dialog 捕获 → 触发 onClose 回调
```

两个完全不同的语义（"下拉菜单关闭" vs "对话框关闭"）使用了相同的事件名称 `'close'`，且事件冒泡导致混淆。

### 当前缓解措施（应用层）

在 Dialog 的 `onClose` 回调中检查事件来源：
```typescript
<Dialog
    onClose={(e: Event) => {
        if ((e.target as HTMLElement).tagName === 'MDUI-DIALOG') {
            onClose();
        }
    }}
>
```

### 建议修复（框架层）

**方案 A**（推荐）：在 `createComponent` 中为 Dialog 的 `onClose` 自动添加 `e.target` 过滤：

```javascript
export const Dialog = createComponent('mdui-dialog', {
    onOpen: 'open',
    onOpened: 'opened',
    onClose: { event: 'close', filter: (e) => e.target.tagName === 'MDUI-DIALOG' },
    onClosed: { event: 'closed', filter: (e) => e.target.tagName === 'MDUI-DIALOG' },
    onOverlayClick: 'overlay-click',
});
```

需要扩展 `createComponent` 以支持带 filter 的事件映射。

**方案 B**：在 `addEventListener` 时添加事件来源检查：

```javascript
el.addEventListener(domEvent, (e) => {
    if (e.target === el || !e.composed) {
        handler(e);
    }
});
```

---

## 问题 3（Medium）：`useEffect` 无依赖数组导致监听器反复销毁重建

### 现象

每次组件 re-render 时，所有事件监听器被 `removeEventListener` 移除后立即用 `addEventListener` 重新绑定。在频繁 re-render 的场景下（如输入框每键一次触发 re-render）造成性能浪费。

### 根因

```javascript
useEffect(() => {
    // 添加监听器...
    return () => {
        // 移除监听器...
    };
});  // ← 无依赖数组 = 每次 render 后都执行
```

### 建议修复

使用 `useRef` 保存最新的 handler 引用，避免频繁重建监听器：

```javascript
const handlersRef = useRef(eventHandlers);
handlersRef.current = eventHandlers;

useEffect(() => {
    const el = internalRef.current;
    if (!el || eventEntries.length === 0) return;

    const listeners = eventEntries.map(([propName, domEvent]) => {
        const handler = (e) => handlersRef.current[propName]?.(e);
        el.addEventListener(domEvent, handler);
        return [domEvent, handler];
    });

    return () => {
        for (const [domEvent, handler] of listeners) {
            el.removeEventListener(domEvent, handler);
        }
    };
}, []);  // ← 仅在挂载/卸载时执行
```

---

## 问题 4（Medium）：未映射的事件 props 泄漏到 React createElement

### 现象

当开发者传递 `eventMap` 中未注册的 `on*` prop 时（如 `<Button onClick={fn}>`），该 prop 被放入 `elementProps` 并透传给 `createElement(tagName, { onClick: fn })`。

### 根因

```javascript
for (const [key, value] of Object.entries(props)) {
    if (eventPropNames.has(key)) {
        eventHandlers[key] = value;  // 已映射 → 由 addEventListener 管理
    } else {
        elementProps[key] = value;   // 未映射 → 透传给 React ← 问题
    }
}
```

对于标准 HTML 元素，React 的合成事件系统能正确处理 `onClick`。但对于自定义元素（`mdui-*`），React 19 的行为不同：

- 已知的 React 事件（如 `onClick`）→ 设置 `domElement.onclick = noop` + 事件委派
- 未知的 `on*` props → `addEventListener(eventName, handler)` 直接绑定

这导致同一个事件可能被 chen-the-dawnstreak 的 `addEventListener`（如果在 eventMap 中）和 React 19 的机制同时处理，或者完全不被处理（如果两边都没有正确拦截）。

### 建议修复

**方案 A**（推荐）：识别所有 `on*` props 并拦截它们：

```javascript
const isEventProp = (key) => /^on[A-Z]/.test(key);

for (const [key, value] of Object.entries(props)) {
    if (eventPropNames.has(key)) {
        // 已映射事件 → addEventListener
        eventHandlers[key] = value;
    } else if (isEventProp(key) && typeof value === 'function') {
        // 未映射但是事件 prop → 也通过 addEventListener 处理
        // 事件名: onClick → click, onCustomEvent → CustomEvent
        const eventName = key.slice(2, 3).toLowerCase() + key.slice(3);
        dynamicEventHandlers[eventName] = value;
    } else {
        elementProps[key] = value;
    }
}
```

**方案 B**：在文档中明确标注每个组件支持的事件 props，并对未映射的 `on*` props 打印警告。

---

## 问题 5（Low）：缺少使用文档和事件映射表

### 现象

开发者无法得知某个组件支持哪些事件 props，只能查看源码中的 `eventMap`。

### 建议

在 README 或文档中提供完整的事件映射表，例如：

| 组件 | 支持的事件 props |
|------|-----------------|
| Button | onFocus, onBlur, onInvalid |
| TextField | onFocus, onBlur, onChange, onInput, onInvalid, onClear |
| Dialog | onOpen, onOpened, onClose, onClosed, onOverlayClick |
| Select | onFocus, onBlur, onChange, onInvalid, onClear |

并明确说明：**未列出的事件（如 onClick）不会通过 addEventListener 绑定，其行为依赖 React 对自定义元素的处理，可能不可靠。**

---

## 应用层临时缓解措施

在框架修复前，classtop-remix 项目采用以下方案：

### 1. 使用自定义 Hook 替代直接 onClick

```typescript
// src/hooks/useWebComponentEvent.ts
import { useEffect, useRef } from 'react';

export function useWebComponentEvent(
  ref: React.RefObject<HTMLElement | null>,
  event: string,
  handler: (...args: any[]) => void
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
```

### 2. Dialog onClose 事件过滤

```typescript
onClose={(e: Event) => {
    if ((e.target as HTMLElement).tagName === 'MDUI-DIALOG') {
        onClose();
    }
}}
```

### 3. 按钮点击使用 ref + addEventListener

```typescript
const saveRef = useRef<HTMLElement>(null);
useWebComponentEvent(saveRef, 'click', handleSave);

<Button ref={saveRef} slot="action" variant="tonal">保存</Button>
```

---

## 复现环境

```json
{
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "chen-the-dawnstreak": "2.1.0",
  "mdui": "2.1.4",
  "electron": "40.x",
  "vite": "6.x"
}
```
