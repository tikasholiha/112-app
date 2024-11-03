<script setup lang="ts">
export interface NavigationProps {
    name: string
    icon: string
    url: string
    childrens: NavigationProps[]
}

defineProps<NavigationProps>()
</script>

<template>
    <q-item clickable v-ripple v-if="!childrens.length" :to="url">
        <q-item-section avatar>
            <base-icon :icon-name="icon" size="18" />
        </q-item-section>
        <q-item-section>{{ name }}</q-item-section>
    </q-item>

    <q-expansion-item v-else :label="name" :content-inset-level="0.6">
        <template v-slot:header>
            <q-item-section avatar>
                <base-icon :icon-name="icon" size="18" />
            </q-item-section>

            <q-item-section> {{ name }} </q-item-section>
        </template>
        <template v-if="childrens.length">
            <navigation
                v-for="menu in childrens"
                :key="menu.name"
                v-bind="menu"
            />
        </template>
    </q-expansion-item>
</template>
