<script setup>
import { DesktopShell, FrappeUIProvider, Sidebar, SidebarHeader, SidebarItem } from 'frappe-ui'
import DeskDock from './DeskDock.vue'

const apps = [
  { label: 'Users', to: '/users', icon: 'lucide-users' },
  { label: 'Selling', to: '/dashboard', icon: 'lucide-store' },
]
const appMenu = [{ label: 'Apps', icon: 'lucide-layout-grid' }, { label: 'Website', icon: 'lucide-globe' }]
const groupIcons = { Profiles: 'lucide-id-card', Permissions: 'lucide-lock', Logs: 'lucide-scroll-text' }
</script>

<template>
  <FrappeUIProvider>
    <DesktopShell :scroll="false" class="h-screen">
      <template #rail>
        <DeskDock :items="apps" />
      </template>
      <template #sidebar>
        <!-- Desk: 224px, 48px collapsed. Frappe UI defaults to 15rem / 3rem. -->
        <Sidebar width="224px" collapsed-width="48px" class="desk-sidebar" aria-label="Users">
          <SidebarHeader title="Users" :show-logo="false" :menu-items="appMenu" class="desk-sidebar-header" />
          <div class="flex flex-col gap-0.5 px-2 pt-0.5">
            <SidebarItem label="Search" icon="lucide-search" />
            <SidebarItem label="Notification" icon="lucide-bell" />
          </div>
          <!-- Desk separates the utility rows from the module rows by 18px. -->
          <div class="mt-[18px] flex flex-col gap-0.5 px-2">
            <SidebarItem label="Home" icon="lucide-house" route="/dashboard" />
            <SidebarItem label="User" icon="lucide-user" route="/users" />
            <SidebarItem label="Role" icon="lucide-shield" />
            <!-- A Desk group is a row with a trailing chevron, not a CRM-style section label. -->
            <SidebarItem v-for="group in ['Profiles', 'Permissions', 'Logs']" :key="group" :label="group" :icon="groupIcons[group]">
              <template #suffix>
                <span class="lucide-chevron-right mr-2 size-4 text-ink-gray-5" aria-hidden="true" />
              </template>
            </SidebarItem>
          </div>
        </Sidebar>
      </template>
      <RouterView />
    </DesktopShell>
  </FrappeUIProvider>
</template>
