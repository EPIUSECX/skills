<script setup>
import { Breadcrumbs, Button } from 'frappe-ui'

const cards = [
  { label: 'Annual Sales', value: 'R 1 240 500.00', stat: '+12.4%', up: true },
  { label: 'Sales Orders to Deliver', value: '18' },
  { label: 'Sales Orders to Bill', value: '7', stat: '-3.1%', up: false },
]
const bars = [42, 58, 35, 71, 64, 80, 52, 90, 76, 61, 68, 84]
</script>

<template>
  <div class="desk-main">
    <header class="desk-page-head">
      <Breadcrumbs :items="[{ label: 'Dashboard' }, { label: 'Selling' }]" />
      <Button icon="lucide-ellipsis" label="Menu" tooltip="Menu" />
    </header>
    <main class="flex-1">
      <div class="desk-dashboard">
        <div class="desk-number-row">
          <a v-for="c in cards" :key="c.label" href="#" class="desk-number-card">
            <span class="desk-number-title">{{ c.label }}</span>
            <span class="desk-number">{{ c.value }}</span>
            <span v-if="c.stat" class="desk-number-stat" :class="c.up ? 'text-ink-green-7' : 'text-ink-red-7'">
              <span :class="c.up ? 'lucide-arrow-up' : 'lucide-arrow-down'" class="size-3" aria-hidden="true" />{{ c.stat }}
            </span>
          </a>
        </div>
        <section class="desk-chart-card" aria-label="Sales Order Trends">
          <div class="desk-chart-head">
            <h2 class="text-base-medium text-ink-gray-8">Sales Order Trends</h2>
            <Button size="sm" label="Last Year" icon-right="lucide-chevron-down" />
          </div>
          <div class="flex h-[220px] items-end gap-3 px-2 pb-2 pt-4" role="img" aria-label="Monthly sales orders">
            <div v-for="(b, i) in bars" :key="i" class="flex-1 rounded-t-2 bg-surface-blue-2" :style="{ height: b + '%' }" />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
