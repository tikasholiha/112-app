<script setup lang="ts">
export interface IBreadcrumbs {
    title: string
    href: string
    icon: string
}

interface IProps {
    title: string
    crumbs: IBreadcrumbs[]
}

defineProps<IProps>()
</script>

<template>
    <header class="tw-flex tw-justify-between tw-items-center">
        <h1 class="tw-text-2xl tw-font-medium tw-text-gray-800">
            {{ title }}
        </h1>

        <slot></slot>
        <q-breadcrumbs class="tw-text-xs">
            <q-breadcrumbs-el
                v-for="bc in crumbs"
                :key="bc.title"
                :to="{
                    name: bc.href
                }"
            >
                <section class="tw-flex tw-items-center tw-gap-2">
                    <base-icon
                        v-if="bc.icon"
                        :icon-name="bc.icon"
                        size="14"
                        stroke-width="2"
                    />
                    {{ bc.title }}
                </section>
            </q-breadcrumbs-el>
        </q-breadcrumbs>
    </header>
</template>
