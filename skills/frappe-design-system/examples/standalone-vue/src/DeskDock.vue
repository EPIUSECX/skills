<script setup>
import { Avatar, Tooltip } from 'frappe-ui'
import { useRoute } from 'vue-router'

// Pinned Desk dock. Frappe UI's SidebarRail is 50px with 28px items, so it is not used here.
// Geometry lives in style.css and follows the dock profile (v16.52 by default, v16.50 behind data-dock).
defineProps({ items: { type: Array, required: true } })
const route = useRoute()
</script>

<template>
  <aside class="desk-dock" aria-label="Apps">
    <div class="desk-dock-logo">
      <button type="button" class="desk-dock-tile" aria-label="App menu">
        <span class="grid size-8 place-items-center rounded-4 bg-surface-gray-10 text-sm font-semibold text-ink-base">C</span>
      </button>
    </div>
    <div class="desk-dock-rule" aria-hidden="true" />
    <div class="desk-dock-items">
      <Tooltip v-for="item in items" :key="item.to" :text="item.label" side="right">
        <RouterLink
          :to="item.to"
          class="desk-dock-tile"
          :class="{ active: route.path.startsWith(item.to) }"
          :aria-label="item.label"
          :aria-current="route.path.startsWith(item.to) ? 'page' : undefined"
        >
          <span :class="item.icon" class="size-5" aria-hidden="true" />
        </RouterLink>
      </Tooltip>
    </div>
    <div class="desk-dock-user">
      <button type="button" class="desk-dock-tile" aria-label="Account">
        <Avatar label="Alex Cohen" size="lg" />
      </button>
    </div>
  </aside>
</template>
