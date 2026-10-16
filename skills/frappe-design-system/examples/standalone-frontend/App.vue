<script setup>
import { Button, Sidebar, SidebarItem } from 'frappe-ui'

// Mode B shell. Sidebar must be 224px. Frappe UI's default is 15rem (240px).
// Dock tiles stay 40px while the product target is Frappe v16.50.
// On a v16.52 bench, set data-dock="v16.52" on the root instead of drawing this dock inside Desk.
defineProps({
  title: { type: String, default: 'Leave' },
})
</script>

<template>
  <div class="flex h-screen bg-surface-base text-ink-gray-8">
    <nav class="dock" aria-label="Main" />
    <Sidebar width="224px" collapsed-width="48px" aria-label="Leave">
      <SidebarItem label="Balances" />
      <SidebarItem label="Applications" />
    </Sidebar>
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-12 items-center justify-between border-b border-outline-gray-1 px-[15px]">
        <h1 class="text-base-medium">{{ title }}</h1>
        <Button variant="solid" label="Apply for leave" />
      </header>
      <slot />
    </div>
  </div>
</template>
