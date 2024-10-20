<script setup lang="ts">
interface IProps {
    modelValue: boolean
    action: 'delete' | 'confirm_form' | 'check_data'
}
defineProps<IProps>()
defineEmits(['update:modelValue', 'onAction'])
</script>

<template>
    <q-dialog
        :model-value="modelValue"
        @update:model-value="(value) => $emit('update:modelValue', value)"
        persistent
    >
        <q-card style="min-width: 400px">
            <q-card-section class="tw-p-10">
                <template v-if="action == 'delete'">
                    <section class="tw-flex tw-justify-center tw-my-5">
                        <base-icon
                            icon-name="Trash"
                            size="35"
                            class="tw-text-gray-300"
                        />
                    </section>

                    <div class="tw-text-center tw-space-y-3">
                        <h1 class="tw-font-semibold tw-text-2xl">
                            Confirmation!
                        </h1>
                        <p class="tw-text-gray-500">
                            Are you sure you want to delete this data
                            <br />
                            This Action cannot be undone
                        </p>
                    </div>
                </template>

                <template v-if="action == 'confirm_form'">
                    <section class="tw-flex tw-justify-center tw-my-5">
                        <base-icon
                            icon-name="Warning2"
                            size="35"
                            class="tw-text-yellow-400"
                        />
                    </section>

                    <div class="tw-text-center tw-space-y-3">
                        <h1 class="tw-font-semibold tw-text-2xl">
                            Confirmation!
                        </h1>
                        <p class="tw-text-gray-500">
                            Are you sure you want to submit this form? <br />
                            Please review all the details carefully before
                            proceeding.
                        </p>
                    </div>
                </template>

                <template v-if="action == 'check_data'">
                    <section class="tw-flex tw-justify-center tw-my-5">
                        <base-icon
                            icon-name="Warning2"
                            size="35"
                            class="tw-text-yellow-400"
                        />
                    </section>

                    <div class="tw-text-center tw-space-y-3">
                        <h1 class="tw-font-semibold tw-text-2xl">
                            Information!
                        </h1>
                        <p class="tw-text-gray-500">
                            We found data on your local device. Would you like
                            to sync it? <br />
                            Click "Yes" to proceed.
                        </p>
                    </div>
                </template>

                <div class="tw-space-x-5 tw-text-center tw-mt-10">
                    <q-btn
                        flat
                        label="Cancel"
                        color="negative"
                        @click="$emit('onAction', false)"
                    />
                    <q-btn
                        class="tw-px-8"
                        unelevated
                        label="Yes"
                        color="secondary"
                        @click="$emit('onAction', true)"
                    />
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
