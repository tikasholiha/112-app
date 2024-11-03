<script setup lang="ts">
import { VsxIcon } from 'vue-iconsax'
interface BaseIconProps {
    iconName: string
    color?: string
    size?: number | any
}

withDefaults(defineProps<BaseIconProps>(), {
    size: 14
})
</script>

<template>
    <VsxIcon :iconName="iconName" :color="color" :size="size" type="linear" />
</template>
