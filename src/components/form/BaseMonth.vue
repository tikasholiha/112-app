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
                :mask="mask"
                :disable="disabled"
                :placeholder="placeholder"
                :dense="dense"
            >
                <template v-slot:append>
                    <q-btn flat size="xs">
                        <base-icon icon-name="Calendar" size="18" />

                        <q-popup-proxy
                            ref="yearPicker"
                            cover
                            transition-show="scale"
                            transition-hide="scale"
                        >
                            <q-date
                                emit-immediately
                                :model-value="modelValue"
                                @update:model-value="checkValue"
                                :range="range"
                                default-view="Months"
                            >
                                <div class="row items-center justify-end">
                                    <q-btn
                                        v-close-popup
                                        label="Close"
                                        color="primary"
                                        flat
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

<script>
export default {
    props: [
        'label',
        'range',
        'modelValue',
        'placeholder',
        'disabled',
        'required',
        'align',
        'view',
        'mask',
        'dense'
    ],
    emits: ['update:modelValue'],

    methods: {
        checkValue(val, reason) {
            if (reason === 'month') {
                const month = val.split('/')[1]
                const monthOptions = [
                    { label: 'January', value: '01' },
                    { label: 'February', value: '02' },
                    { label: 'March', value: '03' },
                    { label: 'April', value: '04' },
                    { label: 'May', value: '05' },
                    { label: 'June', value: '06' },
                    { label: 'July', value: '07' },
                    { label: 'August', value: '08' },
                    { label: 'September', value: '09' },
                    { label: 'October', value: '10' },
                    { label: 'November', value: '11' },
                    { label: 'December', value: '12' }
                ]

                this.$refs.yearPicker.hide()
                this.$emit('update:modelValue', {
                    label: monthOptions.find((m) => m.value == month).label,
                    value: month
                })
            }
        }
    }
}
</script>
