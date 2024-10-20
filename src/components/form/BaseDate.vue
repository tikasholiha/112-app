<script setup lang="ts">
import { ValidationRule } from 'quasar'
import { onMounted, ref } from 'vue'

interface IProps {
    label: string
    range?: boolean
    modelValue: string
    placeholder?: string
    disabled?: boolean
    required?: boolean
    align?: string
    view?: 'Calendar' | 'Months' | 'Years' | undefined
    dense?: boolean
}

defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const props = defineProps<IProps>()

const rules = ref<ValidationRule[]>([])

onMounted(() => {
    if (props.required) {
        rules.value.push((val: string) =>
            val ? true : `${props.label} is required`
        )
    }
})
</script>

<template>
    <div
        :class="[
            align != 'top' ? 'md:tw-flex' : null,
            'tw-items-baseline tw-gap-x-3'
        ]"
    >
        <label v-if="label" class="tw-w-52"
            >{{ label }} <span v-if="required" class="text-red">*</span></label
        >
        <div class="tw-w-full">
            <q-input
                filled
                readonly
                :hint="''"
                :disable="disabled"
                :placeholder="placeholder"
                :rules="rules"
                :model-value="required ? modelValue : null"
                :dense="dense"
            >
                <template v-slot:append>
                    <q-btn flat size="xs">
                        <base-icon icon-name="Calendar" size="18" />

                        <q-popup-proxy
                            cover
                            transition-show="scale"
                            transition-hide="scale"
                        >
                            <q-date
                                :model-value="modelValue"
                                @update:model-value="
                                    (value) => $emit('update:modelValue', value)
                                "
                                :range="range"
                                :default-view="view"
                                mask="YYYY-MM-DD"
                                color="secondary"
                            >
                                <div class="row items-center justify-end">
                                    <q-btn
                                        v-close-popup
                                        label="Close"
                                        color="secondary"
                                        flat
                                        no-caps
                                    />
                                </div>
                            </q-date>
                        </q-popup-proxy>
                    </q-btn>
                </template>
            </q-input>
        </div>
    </div>
</template>
