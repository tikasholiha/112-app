<script setup lang="ts">
interface IProps {
    title: string
    subtitle: string
}

defineProps<IProps>()
</script>

<template>
    <q-card flat class="tw-mt-5 tw-p-3">
        <q-card-section class="!tw-h-full">
            <header class="tw-flex tw-justify-between tw-items-center">
                <div>
                    <h1 class="tw-text-sm tw-font-semibold tw-text-gray-800">
                        {{ title }}
                    </h1>
                    <p v-if="subtitle" class="tw-text-gray-400 tw-text-xs">
                        {{ subtitle }}
                    </p>
                </div>

                <div class="tw-space-x-4 tw-flex">
                    <slot name="action"></slot>
                </div>
            </header>

            <section class="tw-mt-8 tw-h-full">
                <slot name="content"></slot>
            </section>
        </q-card-section>
    </q-card>
</template>
