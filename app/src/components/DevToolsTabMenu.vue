<template>
  <div class="tab-menu"><slot></slot></div>
</template>

<style scoped>
.tab-menu {
  display: flex;
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  gap: 0.25rem;
  transition: opacity 100ms;

  .dev-tools:not(:hover) & {
    opacity: 0;
    pointer-events: none;
  }
}

.tab-menu :deep(button) {
  padding: 0.25rem;
  border-radius: 0.3rem;
  background-color: var(--color-log-gray);
  cursor: pointer;

  &:hover {
    filter: brightness(1.5);
  }
}

.tab-menu :deep(button:hover) {
  filter: brightness(1.5);
}

.tab-menu :deep(svg) {
  display: block;
}
</style>
