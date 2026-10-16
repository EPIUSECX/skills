<script setup>
import { Badge, Breadcrumbs, Button, Checkbox, TextInput } from 'frappe-ui'
import { computed, ref } from 'vue'

const users = [
  { name: 'Guest', type: 'Website User', status: 'Active', email: 'guest@example.com' },
  { name: 'Alex Cohen', type: 'System User', status: 'Active', email: 'alex@cohenix.com' },
  { name: 'Administrator', type: 'System User', status: 'Active', email: 'admin@example.com' },
  { name: 'Dana Moyo', type: 'System User', status: 'Disabled', email: 'dana@cohenix.com' },
]
const query = ref('')
const userType = ref('')
const selected = ref(null)
const checked = ref([])
const rows = computed(() =>
  users.filter((u) => u.name.toLowerCase().includes(query.value.toLowerCase()) && (!userType.value || u.type.includes(userType.value))),
)
</script>

<template>
  <div class="desk-main">
    <header class="desk-page-head">
      <Breadcrumbs :items="[{ label: 'User' }]" />
      <div class="flex items-center gap-2">
        <Button icon="lucide-refresh-cw" label="Reload" tooltip="Reload" />
        <Button variant="solid" icon-left="lucide-plus" label="Add User" />
      </div>
    </header>
    <div class="flex flex-1">
      <main class="min-w-0 flex-1">
        <div class="desk-list-toolbar">
          <div class="flex gap-2">
            <TextInput v-model="query" placeholder="Full Name" class="w-[107px]" aria-label="Full Name" />
            <TextInput v-model="userType" placeholder="User Type" class="w-[107px]" aria-label="User Type" />
          </div>
          <div class="flex items-center gap-2">
            <Button icon-left="lucide-funnel" label="Filters" />
            <Button icon="lucide-arrow-down-wide-narrow" label="Sort" tooltip="Sort" />
          </div>
        </div>
        <div class="desk-list" role="table" aria-label="Users">
          <div class="desk-list-head" role="row">
            <Checkbox :model-value="checked.length === rows.length && rows.length > 0" aria-label="Select all" @update:model-value="(v) => (checked = v ? rows.map((r) => r.name) : [])" />
            <span class="desk-col-subject" role="columnheader">Full Name</span>
            <span class="desk-col" role="columnheader">Status</span>
            <span class="desk-col" role="columnheader">User Type</span>
            <span class="ml-auto" role="columnheader">{{ rows.length }} of {{ users.length }}</span>
          </div>
          <div
            v-for="u in rows"
            :key="u.name"
            class="desk-list-row"
            role="row"
            tabindex="0"
            :aria-selected="selected?.name === u.name"
            @click="selected = u"
            @keydown.enter="selected = u"
          >
            <Checkbox :model-value="checked.includes(u.name)" :aria-label="`Select ${u.name}`" @click.stop @update:model-value="(v) => (checked = v ? [...checked, u.name] : checked.filter((n) => n !== u.name))" />
            <span class="desk-col-subject desk-subject" role="cell">{{ u.name }}</span>
            <span class="desk-col" role="cell"><Badge :label="u.status" :theme="u.status === 'Active' ? 'green' : 'gray'" /></span>
            <span class="desk-col" role="cell">{{ u.type }}</span>
          </div>
        </div>
      </main>
      <aside v-if="selected" class="desk-record-panel" aria-label="User details">
        <div class="flex h-12 items-center justify-between border-b border-outline-gray-1 px-[15px]">
          <span class="text-base-medium text-ink-gray-8">{{ selected.name }}</span>
          <Button variant="ghost" icon="lucide-x" label="Close" tooltip="Close" @click="selected = null" />
        </div>
        <dl class="desk-panel-fields">
          <dt>Email</dt><dd>{{ selected.email }}</dd>
          <dt>Status</dt><dd><Badge :label="selected.status" :theme="selected.status === 'Active' ? 'green' : 'gray'" /></dd>
          <dt>User Type</dt><dd>{{ selected.type }}</dd>
        </dl>
      </aside>
    </div>
  </div>
</template>
