(() => {
  const nativeClass = "app-select-native";
  const wrapperClass = "app-select";
  const stateBySelect = new WeakMap();
  let nextSelectId = 1;
  let activeState = null;
  let scanQueued = false;

  function injectStyles() {
    if (document.getElementById("app-select-styles")) return;
    const style = document.createElement("style");
    style.id = "app-select-styles";
    style.textContent = `
      .${nativeClass} {
        display: none !important;
      }

      .${wrapperClass} {
        position: relative;
        width: 100%;
        max-width: 100%;
        min-width: 0;
      }

      .app-select__button {
        width: 100%;
        min-height: 42px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        border: 1px solid rgba(31, 95, 143, 0.18);
        border-radius: 8px;
        padding: 12px 14px;
        color: var(--ink, #172033);
        background: #ffffff;
        cursor: pointer;
        font: 800 14px "Inter", "Segoe UI", system-ui, sans-serif;
        line-height: 1.25;
        letter-spacing: 0;
        text-align: left;
        text-transform: none;
        box-shadow: none;
        transform: none;
        -webkit-tap-highlight-color: transparent;
      }

      .app-select__button:hover,
      .${wrapperClass}.is-open .app-select__button {
        border-color: rgba(31, 95, 143, 0.42);
        box-shadow: 0 0 0 3px rgba(31, 95, 143, 0.1);
        transform: none;
      }

      .app-select__button:focus-visible {
        outline: none;
        border-color: rgba(31, 95, 143, 0.56);
        box-shadow: 0 0 0 4px rgba(31, 95, 143, 0.14);
      }

      .app-select__button:disabled {
        cursor: not-allowed;
        opacity: 0.62;
      }

      .app-select__value {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .app-select__caret {
        width: 0;
        height: 0;
        flex: 0 0 auto;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 5px solid currentColor;
      }

      .app-select__menu {
        display: none;
        position: fixed;
        z-index: 7000;
        top: var(--app-select-top, 0px);
        left: var(--app-select-left, 0px);
        width: var(--app-select-width, 220px);
        max-height: var(--app-select-max-height, min(320px, 56dvh));
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 6px;
        border: 1px solid rgba(31, 95, 143, 0.2);
        border-radius: 8px;
        background: #ffffff;
        box-shadow: 0 20px 50px rgba(23, 63, 100, 0.18);
      }

      .${wrapperClass}.is-open .app-select__menu {
        display: grid;
        gap: 4px;
      }

      .app-select__option {
        width: 100%;
        min-height: 38px;
        border: 0;
        border-radius: 8px;
        padding: 9px 10px;
        color: var(--ink, #172033);
        background: transparent;
        cursor: pointer;
        font: 800 13px "Inter", "Segoe UI", system-ui, sans-serif;
        line-height: 1.25;
        letter-spacing: 0;
        text-align: left;
        text-transform: none;
        box-shadow: none;
        transform: none;
      }

      .app-select__option:hover,
      .app-select__option:focus-visible {
        outline: none;
        color: var(--ink, #172033);
        background: #eaf5ff;
        transform: none;
        box-shadow: none;
      }

      .app-select__option.is-active {
        color: #172033;
        background: linear-gradient(135deg, #fff2bd, #fff1df);
      }

      .app-select__option:disabled {
        cursor: not-allowed;
        opacity: 0.48;
      }

      html[data-app-select-surface="operations"] .app-select__button {
        min-height: 38px;
        border-color: rgba(31, 95, 143, 0.18);
        border-radius: 8px;
        color: #172033;
        background: #ffffff;
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        padding: 10px 14px;
      }

      html[data-app-select-surface="operations"] .app-select__button:hover,
      html[data-app-select-surface="operations"] .${wrapperClass}.is-open .app-select__button,
      html[data-app-select-surface="operations"] .app-select__button:focus-visible {
        border-color: rgba(31, 95, 143, 0.42);
        box-shadow: 0 0 0 3px rgba(31, 95, 143, 0.1);
      }

      html[data-app-select-surface="operations"] .app-select__menu {
        border-color: rgba(31, 95, 143, 0.2);
        border-radius: 8px;
        background: #ffffff;
        box-shadow: 0 18px 44px rgba(23, 63, 100, 0.18);
      }

      html[data-app-select-surface="operations"] .app-select__option {
        border-radius: 8px;
        color: #31516b;
        font: inherit;
        font-size: 12px;
        font-weight: 700;
      }

      html[data-app-select-surface="operations"] .app-select__option:hover,
      html[data-app-select-surface="operations"] .app-select__option:focus-visible {
        color: #173f64;
        background: #eaf5ff;
      }

      html[data-app-select-surface="operations"] .app-select__option.is-active {
        color: #172033;
        background: linear-gradient(135deg, #fff2bd, #fff1df);
      }
    `;
    document.head.appendChild(style);
  }

  function setSurface() {
    if (document.querySelector(".ops-app-shell")) {
      document.documentElement.dataset.appSelectSurface = "operations";
    } else if (!document.documentElement.dataset.appSelectSurface) {
      document.documentElement.dataset.appSelectSurface = "portal";
    }
  }

  function isEnhanceable(select) {
    return select
      && select.tagName === "SELECT"
      && !select.multiple
      && Number(select.size || 0) <= 1
      && !select.closest("[data-app-select-ignore]");
  }

  function readableToken(value) {
    return String(value || "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function labelText(select) {
    const aria = select.getAttribute("aria-label") || select.getAttribute("title");
    if (aria) return aria;

    if (select.id) {
      const explicit = document.querySelector(`label[for="${window.CSS?.escape ? CSS.escape(select.id) : select.id}"]`);
      if (explicit) {
        const text = Array.from(explicit.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE || node.nodeName !== "SELECT")
          .map((node) => node.textContent || "")
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        if (text) return text;
      }
    }

    const wrappingLabel = select.closest("label");
    if (wrappingLabel) {
      const pieces = [];
      for (const node of wrappingLabel.childNodes) {
        if (node === select) break;
        if (node.nodeType === Node.TEXT_NODE) {
          pieces.push(node.textContent || "");
        } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList?.contains(wrapperClass)) {
          pieces.push(node.textContent || "");
        }
      }
      const text = pieces.join(" ").replace(/\s+/g, " ").trim();
      if (text) return text;
    }

    return readableToken(select.name || select.id) || "Choose option";
  }

  function optionText(option) {
    return (option.textContent || option.label || option.value || "Option")
      .replace(/\s+/g, " ")
      .trim();
  }

  function selectedOption(select) {
    return select.selectedOptions?.[0] || select.options[select.selectedIndex] || select.options[0] || null;
  }

  function optionSignature(select) {
    return [
      select.disabled ? "disabled" : "enabled",
      select.selectedIndex,
      Array.from(select.options)
        .map((option, index) => [
          index,
          option.value,
          optionText(option),
          option.disabled ? "disabled" : "enabled",
          option.selected ? "selected" : "",
        ].join("::"))
        .join("||"),
    ].join("##");
  }

  function createState(select) {
    const wrapper = document.createElement("div");
    wrapper.className = wrapperClass;
    wrapper.dataset.appSelect = String(nextSelectId++);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "app-select__button";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");

    const value = document.createElement("span");
    value.className = "app-select__value";

    const caret = document.createElement("span");
    caret.className = "app-select__caret";
    caret.setAttribute("aria-hidden", "true");

    const menu = document.createElement("div");
    menu.className = "app-select__menu";
    menu.setAttribute("role", "listbox");

    button.append(value, caret);
    wrapper.append(button, menu);
    select.insertAdjacentElement("afterend", wrapper);

    const state = {
      select,
      wrapper,
      button,
      value,
      menu,
      signature: "",
    };

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleState(state);
    });

    button.addEventListener("keydown", (event) => {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openState(state);
        focusMenuOption(state, event.key === "ArrowUp" ? "last" : "active");
      }
    });

    menu.addEventListener("click", (event) => {
      const optionButton = event.target.closest("[data-app-select-option]");
      if (!optionButton || optionButton.disabled) return;
      event.preventDefault();
      event.stopPropagation();
      chooseOption(state, Number(optionButton.dataset.appSelectOption));
    });

    menu.addEventListener("keydown", (event) => {
      handleMenuKeydown(event, state);
    });

    select.addEventListener("change", () => refreshState(state));
    select.addEventListener("input", () => refreshState(state));
    select.addEventListener("click", (event) => {
      if (!select.classList.contains(nativeClass)) return;
      event.preventDefault();
      event.stopPropagation();
      openState(state);
    });
    select.addEventListener("focus", () => state.button.focus());
    select.addEventListener("invalid", () => state.button.focus());

    stateBySelect.set(select, state);
    return state;
  }

  function refreshState(state) {
    if (!state?.select?.isConnected) {
      if (activeState === state) closeState(state);
      return;
    }

    state.select.classList.add(nativeClass);
    state.select.setAttribute("data-app-select-enhanced", "true");
    state.select.setAttribute("aria-hidden", "true");
    state.select.tabIndex = -1;

    const label = labelText(state.select);
    const selected = selectedOption(state.select);
    const selectedLabel = selected ? optionText(selected) : "Choose...";
    state.button.disabled = state.select.disabled;
    state.button.setAttribute("aria-label", label);
    state.menu.setAttribute("aria-label", label);
    state.value.textContent = selectedLabel;

    const signature = optionSignature(state.select);
    if (signature === state.signature) return;
    state.signature = signature;

    state.menu.textContent = "";
    Array.from(state.select.options).forEach((option, index) => {
      const optionButton = document.createElement("button");
      optionButton.type = "button";
      optionButton.className = "app-select__option";
      optionButton.dataset.appSelectOption = String(index);
      optionButton.setAttribute("role", "option");
      optionButton.setAttribute("aria-selected", option.selected ? "true" : "false");
      optionButton.disabled = option.disabled;
      if (option.selected) optionButton.classList.add("is-active");
      optionButton.textContent = optionText(option);
      state.menu.appendChild(optionButton);
    });
  }

  function enhanceSelect(select) {
    if (!isEnhanceable(select)) return;
    let state = stateBySelect.get(select);
    if (!state || !state.wrapper.isConnected) state = createState(select);
    refreshState(state);
  }

  function enhanceAllSelects() {
    setSurface();
    document.querySelectorAll("select").forEach(enhanceSelect);
  }

  function scheduleScan() {
    if (scanQueued) return;
    scanQueued = true;
    window.requestAnimationFrame(() => {
      scanQueued = false;
      enhanceAllSelects();
      if (activeState?.wrapper?.classList.contains("is-open")) positionState(activeState);
    });
  }

  function enabledOptions(state) {
    return Array.from(state.menu.querySelectorAll("[data-app-select-option]"))
      .filter((button) => !button.disabled);
  }

  function focusMenuOption(state, target = "active") {
    const options = enabledOptions(state);
    if (!options.length) return;
    const active = state.menu.querySelector(".app-select__option.is-active:not(:disabled)");
    if (target === "last") {
      options[options.length - 1].focus();
    } else if (target === "first") {
      options[0].focus();
    } else {
      (active || options[0]).focus();
    }
  }

  function moveMenuFocus(state, direction) {
    const options = enabledOptions(state);
    if (!options.length) return;
    const currentIndex = options.indexOf(document.activeElement);
    const nextIndex = currentIndex < 0
      ? 0
      : (currentIndex + direction + options.length) % options.length;
    options[nextIndex].focus();
  }

  function handleMenuKeydown(event, state) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeState(state);
      state.button.focus();
      return;
    }
    if (event.key === "Tab") {
      closeState(state);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveMenuFocus(state, 1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveMenuFocus(state, -1);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusMenuOption(state, "first");
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      focusMenuOption(state, "last");
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      const optionButton = event.target.closest("[data-app-select-option]");
      if (optionButton && !optionButton.disabled) {
        event.preventDefault();
        chooseOption(state, Number(optionButton.dataset.appSelectOption));
      }
    }
  }

  function chooseOption(state, index) {
    if (!Number.isInteger(index) || index < 0 || index >= state.select.options.length) return;
    state.select.selectedIndex = index;
    refreshState(state);
    closeState(state);
    state.button.focus();
    state.select.dispatchEvent(new Event("input", { bubbles: true }));
    state.select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function positionState(state) {
    if (!state?.button?.isConnected || !state.menu?.isConnected) return;
    const rect = state.button.getBoundingClientRect();
    const gap = 6;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1024;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 768;
    const width = Math.min(Math.max(rect.width, 190), Math.max(160, viewportWidth - 16));
    const left = Math.min(Math.max(8, rect.left), Math.max(8, viewportWidth - width - 8));
    const spaceBelow = viewportHeight - rect.bottom - gap - 8;
    const spaceAbove = rect.top - gap - 8;
    const openAbove = spaceBelow < 170 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(140, Math.min(320, openAbove ? spaceAbove : spaceBelow));
    const top = openAbove
      ? Math.max(8, rect.top - gap - maxHeight)
      : Math.min(rect.bottom + gap, viewportHeight - maxHeight - 8);

    state.menu.style.setProperty("--app-select-top", `${Math.round(top)}px`);
    state.menu.style.setProperty("--app-select-left", `${Math.round(left)}px`);
    state.menu.style.setProperty("--app-select-width", `${Math.round(width)}px`);
    state.menu.style.setProperty("--app-select-max-height", `${Math.round(maxHeight)}px`);
  }

  function openState(state) {
    if (!state || state.button.disabled) return;
    refreshState(state);
    if (activeState && activeState !== state) closeState(activeState);
    activeState = state;
    state.wrapper.classList.add("is-open");
    state.button.setAttribute("aria-expanded", "true");
    positionState(state);
  }

  function closeState(state) {
    if (!state) return;
    state.wrapper.classList.remove("is-open");
    state.button.setAttribute("aria-expanded", "false");
    state.menu.removeAttribute("style");
    if (activeState === state) activeState = null;
  }

  function toggleState(state) {
    if (state.wrapper.classList.contains("is-open")) closeState(state);
    else openState(state);
  }

  function closeFromDocument(event) {
    if (event.target.closest(`.${wrapperClass}`)) return;
    if (activeState) closeState(activeState);
  }

  function init() {
    injectStyles();
    enhanceAllSelects();

    const observer = new MutationObserver((mutations) => {
      if (!mutations.some((mutation) => mutation.type === "childList" || mutation.target?.tagName === "SELECT")) return;
      scheduleScan();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled", "aria-label", "title", "id", "name"],
    });

    document.addEventListener("click", closeFromDocument);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activeState) closeState(activeState);
    });
    window.addEventListener("resize", () => activeState && positionState(activeState));
    window.addEventListener("scroll", () => activeState && positionState(activeState), true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
