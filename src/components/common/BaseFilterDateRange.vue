<script setup>
import moment from 'moment'
import { onMounted, ref, reactive, watch } from 'vue'

const props = defineProps({
    modelValue: String
})

const emit = defineEmits(['update:model-value'])

const poupDateRange = ref(false)
const dateRange = ref({
    from: moment().startOf('year').format('YYYY-MM-DD'),
    to: moment().endOf('year').format('YYYY-MM-DD')
})

const Days = ref([
    // {
    //     label: 'All',
    //     value: 'all'
    // },
    // {
    //     label: 'Today',
    //     value: 'today'
    // },
    // {
    //     label: 'This Week',
    //     value: 'this_week'
    // },
    // {
    //     label: 'Last Week',
    //     value: 'last_week'
    // },
    {
        label: 'Bulan Ini',
        value: 'this_month'
    },
    {
        label: 'Tahun Ini',
        value: 'this_year'
    },
    {
        label: 'By Month',
        value: 'custom'
    }
])
const Day = ref('Tahun Ini')
const yearPicker = ref()
const yearProxy = ref(false)

const setSelectedDay = (val) => {
    dateRange.value = {
        from: '',
        to: ''
    }
    switch (val.value) {
        case 'today':
            dateRange.value.from = moment().format('YYYY-MM-DD')
            dateRange.value.to = moment().format('YYYY-MM-DD')
            poupDateRange.value = false
            Day.value = val.label
            onUpdate(dateRange.value)
            break
        case 'this_week':
            dateRange.value.from = moment().startOf('week').format('YYYY-MM-DD')
            dateRange.value.to = moment().endOf('week').format('YYYY-MM-DD')
            poupDateRange.value = false
            Day.value = val.label
            onUpdate(dateRange.value)
            break
        case 'last_week':
            dateRange.value.from = moment()
                .subtract(1, 'weeks')
                .startOf('week')
                .format('YYYY-MM-DD')
            dateRange.value.to = moment()
                .subtract(1, 'weeks')
                .endOf('week')
                .format('YYYY-MM-DD')
            poupDateRange.value = false
            Day.value = val.label
            onUpdate(dateRange.value)
            break
        case 'this_month':
            dateRange.value.from = moment()
                .startOf('month')
                .format('YYYY-MM-DD')
            dateRange.value.to = moment().endOf('month').format('YYYY-MM-DD')
            poupDateRange.value = false
            Day.value = val.label
            onUpdate(dateRange.value)
            break
        case 'last_month':
            dateRange.value.from = moment()
                .subtract(1, 'months')
                .startOf('month')
                .format('YYYY-MM-DD')
            dateRange.value.to = moment()
                .subtract(1, 'months')
                .endOf('month')
                .format('YYYY-MM-DD')
            poupDateRange.value = false
            Day.value = val.label
            onUpdate(dateRange.value)
            break

        case 'this_year':
            dateRange.value.from = moment()
                .subtract(1, 'months')
                .startOf('year')
                .format('YYYY-MM-DD')
            dateRange.value.to = moment()
                .subtract(1, 'months')
                .endOf('year')
                .format('YYYY-MM-DD')
            poupDateRange.value = false
            Day.value = val.label
            onUpdate(dateRange.value)
            break

        case 'all':
            dateRange.value.from = null
            dateRange.value.to = null
            Day.value = val.label
            onUpdate(dateRange.value)
            break
    }
}

const onCustomRange = (value, reason, detail) => {
    console.log({ value, reason })
    switch (reason) {
        case 'add-range':
            Day.value =
                moment(value.from).format('YYYY-MM-DD') +
                '  -  ' +
                moment(value.to).format('YYYY-MM-DD')
            dateRange.value.from = moment(value.from).format('YYYY-MM-DD')
            dateRange.value.to = moment(value.to).format('YYYY-MM-DD')
            onUpdate(dateRange.value)
            break
        case 'add-day':
            Day.value = moment(value).format('MMMM YYYY')

            dateRange.value.from = moment(value).format('YYYY-MM-DD')
            dateRange.value.to = moment(value).format('YYYY-MM-DD')
            onUpdate(dateRange.value)
            break
        case 'month':
            Day.value = moment(value).format('MMMM YYYY')

            dateRange.value.from = moment(value).format('YYYY-MM-DD')
            dateRange.value.to = moment(value).format('YYYY-MM-DD')
            onUpdate(dateRange.value)
            break
    }
}

const onUpdate = (val) => {
    emit('update:model-value', val)
}
defineExpose({ Day })
onMounted(() => {
    onUpdate(dateRange.value)
})
</script>

<template>
    <q-btn
        unelevated
        color="secondary"
        class="tw-capitalize tw-rounded tw-px-4 tw-py-2"
    >
        {{ Day }}

        <q-icon name="eva-chevron-down-outline" size="xs" class="tw-ml-3" />

        <q-menu
            fit
            class="tw-shadow-sm"
            anchor="bottom right"
            self="top end"
            v-model="poupDateRange"
        >
            <q-list style="min-width: 100px">
                <template v-for="day in Days" :key="day.label">
                    <q-item clickable @click="setSelectedDay(day)">
                        <q-item-section>{{ day.label }}</q-item-section>

                        <q-popup-proxy
                            ref="yearPicker"
                            v-model="yearProxy"
                            v-if="day.value == 'custom'"
                        >
                            <q-date
                                @click="
                                    ;(yearProxy = false),
                                        (poupDateRange = false)
                                "
                                @update:model-value="onCustomRange"
                                emit-immediately
                                v-model="dateRange"
                                default-view="Months"
                            >
                                <div class="row items-center justify-end">
                                    <q-btn
                                        v-close-popup
                                        label="Apply"
                                        color="primary"
                                        class="tw-capitalize"
                                        flat
                                    />
                                </div>
                            </q-date>
                        </q-popup-proxy>
                    </q-item>
                </template>
            </q-list>
        </q-menu>
    </q-btn>
</template>

<style></style>
