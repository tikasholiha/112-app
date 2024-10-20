<template>
    <div
        :class="[
            align != 'top' ? 'md:tw-flex' : null,
            'tw-items-baseline tw-gap-x-3'
        ]"
    >
        <label v-if="label" class="tw-w-52"
            >{{ label }}
            <span v-if="required && !mark" class="text-red">*</span></label
        >
        <div class="tw-w-full">
            <q-select
                filled
                :use-input="search"
                :dense="dense"
                color="secondary"
                emit-value
                :model-value="modelValue"
                map-options
                input-debounce="0"
                :disable="disabled"
                :options="valOptions"
                :class="!required ?? 'tw-mb-6'"
                :rules="
                    required ? [(val) => !!val || `${label} is required`] : null
                "
                @update:model-value="
                    (value) => $emit('update:modelValue', value)
                "
                @filter="filterFn"
                :clearable="clearable"
                :multiple="multiple"
                :use-chips="useChips"
            >
                <template v-if="search" v-slot:no-option>
                    <q-item>
                        <q-item-section class="text-grey">
                            No results
                        </q-item-section>
                    </q-item>
                </template>
            </q-select>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue'

export default {
    data() {
        const valOptions = ref(this.options)
        return {
            valOptions
        }
    },
    props: [
        'label',
        'search',
        'options',
        'modelValue',
        'disabled',
        'required',
        'align',
        'dense',
        'mark',
        'id',
        'clearable',
        'multiple',
        'useChips'
    ],
    emits: ['update:modelValue'],
    watch: {
        options: {
            handler: function (val) {
                this.valOptions = val
            },
            deep: true
        }
    },
    methods: {
        filterFn(val, update) {
            if (val === '') {
                update(() => {
                    this.valOptions = this.options
                })
                return
            }

            update(() => {
                const needle = val.toLowerCase()
                this.valOptions = this.options.filter(
                    (v) => v.label.toLowerCase().indexOf(needle) > -1
                )
            })
        }
    }
}
</script>
