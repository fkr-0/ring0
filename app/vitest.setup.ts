import '@testing-library/jest-dom/vitest'

class ResizeObserverMock {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  disconnect() {}
  observe() {
    this.callback([], this)
  }
  unobserve() {}
}

if (!('ResizeObserver' in globalThis)) {
  // @ts-expect-error add shim for jsdom
  globalThis.ResizeObserver = ResizeObserverMock
}

globalThis.scrollTo = globalThis.scrollTo || (() => {})
