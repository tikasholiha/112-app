<script setup lang="ts">
import * as XLSX from 'xlsx'
import moment from 'moment'
import { Loading, QTableColumn } from 'quasar'
import { api } from 'src/boot/axios'
import { Notification } from 'src/boot/notify'
import { IBreadcrumbs } from 'src/components/common/BaseTitle.vue'
import { computed, onMounted, reactive, ref } from 'vue'

// types
interface FormSchema {
    call_date: string
    location: string
    phone_number: number
    duration: number
    status: string
    notes: string
}

// data
const confirmDialog = ref(false)
const searchKeyword = ref<string>('')
const tableColumns: QTableColumn[] = [
    {
        name: 'call_date',
        label: 'Call Date',
        align: 'left',
        field: (row: any) => moment(row.call_date).format('LL')
    },
    {
        name: 'location',
        label: 'Location',
        align: 'left',
        field: (row: any) => row.location
    },
    {
        name: 'phone_number',
        label: 'Phone Number',
        align: 'left',
        field: (row: any) => row.phone_number
    },
    {
        name: 'duration',
        label: 'Duration',
        align: 'left',
        field: (row: any) => row.duration
    },
    {
        name: 'status',
        label: 'Status',
        align: 'left',
        field: (row: any) => row.status
    },
    {
        name: 'notes',
        label: 'Notes',
        align: 'left',
        field: (row: any) => row.notes || '-'
    },
    {
        name: 'action',
        label: 'Action',
        align: 'left',
        field: ''
    }
]
const tableRows = ref([])
const filteredTableRows = computed(() => {
    if (searchKeyword.value) {
        return tableRows.value.filter((item: any) => {
            const concatStr = `${item.month_period} ${item.year}`
            console.log(concatStr)
            if (
                concatStr
                    .toLowerCase()
                    .includes(searchKeyword.value.toLowerCase())
            ) {
                return item
            }
        })
    } else {
        return tableRows.value
    }
})
const breadcrumbs = ref<IBreadcrumbs[]>([
    {
        title: 'Dashboard',
        href: 'dashboard-page',
        icon: 'Category2'
    },
    {
        title: 'Test Calls',
        href: '',
        icon: 'CallReceived'
    }
])
const callID = ref<number>()
const tableLoading = ref<boolean>(false)
const createDialog = ref(false)
const datas = ref<any>({})
const form = reactive<FormSchema>({
    call_date: '',
    location: '',
    phone_number: 0,
    duration: 0,
    status: '',
    notes: ''
})

// methods
const fetchCallReport = async () => {
    try {
        tableLoading.value = true

        const { data: response } = await api.get('/test-calls')

        if (response.data) {
            tableRows.value = response.data
        }
    } catch (error) {
        console.log(error)
    } finally {
        tableLoading.value = false
    }
}

const openCreateDialog = (data: FormSchema | any) => {
    if (data) {
        form.call_date = data.call_date
        form.location = data.location
        form.phone_number = data.phone_number
        form.duration = data.duration
        form.status = data.status
        form.notes = data.notes

        datas.value = data
    } else {
        form.call_date = moment().format('YYYY-MM-DD')
    }

    createDialog.value = true
}

const closeDialog = () => {
    createDialog.value = false

    datas.value = {}
    form.call_date = ''
    form.location = ''
    form.phone_number = 0
    form.duration = 0
    form.status = ''
    form.notes = ''
}

const openDeleteDialog = (id: number) => {
    callID.value = id

    confirmDialog.value = true
}

const handleAction = (val: boolean) => {
    confirmDialog.value = false
    if (val) {
        onDeleteCallReport()
    } else {
        callID.value = 0
    }
}

const onDeleteCallReport = async () => {
    Loading.show({
        message: 'Please wait...'
    })

    try {
        const { data: response } = await api.delete(
            `/test-calls/${callID.value}`
        )

        if (response.data) {
            Notification(response.message, 'positive')
            fetchCallReport()
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const onSubmitTestCall = async () => {
    Loading.show({
        message: 'Please wait...'
    })

    try {
        const payload = {
            call_date: form.call_date,
            location: form.location,
            phone_number: form.phone_number,
            duration: form.duration,
            status: form.status,
            notes: form.notes
        }

        if (datas.value?.id) {
            // Update Condition
            const { data: response } = await api.put(
                `/test-calls/${datas.value.id}`,
                payload
            )

            if (response.data) {
                Notification(response.message, 'positive')

                fetchCallReport()
                closeDialog()
            }
        } else {
            // Create Condition
            const { data: response } = await api.post('/test-calls', payload)

            if (response.data) {
                Notification(response.message, 'positive')

                fetchCallReport()
                closeDialog()
            }
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const onExportData = async () => {
    Loading.show({
        message: 'Please wait....'
    })

    try {
        const { data: response } = await api.get('/test-calls/export')

        if (response.data) {
            generateXLSX(response.data)
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const generateXLSX = (data: any) => {
    const headers = tableColumns
        .filter((item) => {
            if (item.name != 'action') {
                return item.label
            }
        })
        .map((item) => item.label)

    const rows = data.map((item: any) => {
        return [
            item.call_date,
            item.location,
            item.phone_number,
            item.duration,
            item.status,
            item.notes || '-'
        ]
    })

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])

    worksheet['!cols'] = [
        { wch: 20 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 }
    ]

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    XLSX.writeFile(workbook, `Test Call Reports.xlsx`)
}

// hooks
onMounted(() => {
    fetchCallReport()
})
</script>

<template>
    <base-title title="Test Calls" :crumbs="breadcrumbs" />

    <base-card title="Lists Test Calls">
        <template #action>
            <div class="tw-space-x-4">
                <q-btn
                    outline
                    no-caps
                    unelevated
                    color="info"
                    @click="openCreateDialog('')"
                >
                    <base-icon
                        icon-name="AddSquare"
                        size="16"
                        class="tw-mr-3"
                    />
                    Create New
                </q-btn>

                <q-btn
                    outline
                    no-caps
                    unelevated
                    color="negative"
                    @click="onExportData"
                >
                    <base-icon
                        icon-name="DocumentDownload"
                        size="16"
                        class="tw-mr-3"
                    />
                    Export Data
                </q-btn>
            </div>

            <q-input
                filled
                v-model="searchKeyword"
                type="text"
                color="secondary"
                label="Search"
                dense
            >
                <template #prepend>
                    <base-icon icon-name="SearchStatus" class="tw-mr-2" />
                </template>
            </q-input>
        </template>

        <template #content>
            <base-table
                :columns="tableColumns"
                :rows="filteredTableRows"
                :loading="tableLoading"
                row-key="name"
            >
                <template #notes="props">
                    <div class="tw-truncate tw-max-w-xs">
                        {{ props.row.notes || '-' }}
                    </div>
                </template>

                <template #action="props">
                    <q-td>
                        <q-btn flat no-caps unelevated color="secondary">
                            <base-icon icon-name="More" size="16" />

                            <q-menu
                                anchor="bottom end"
                                self="top end"
                                class="tw-shadow-lg tw-shadow-gray-50"
                            >
                                <q-list style="min-width: 100px">
                                    <q-item
                                        clickable
                                        @click="openCreateDialog(props.row)"
                                    >
                                        <q-item-section
                                            class="tw-flex-row tw-gap-3 tw-items-center tw-justify-start"
                                        >
                                            <base-icon
                                                icon-name="Edit"
                                                class="text-warning"
                                            />
                                            <span>Edit</span>
                                        </q-item-section>
                                    </q-item>
                                    <q-separator />
                                    <q-item
                                        clickable
                                        @click="openDeleteDialog(props.row.id)"
                                    >
                                        <q-item-section
                                            class="tw-flex-row tw-gap-3 tw-items-center tw-justify-start"
                                        >
                                            <base-icon
                                                icon-name="Trash"
                                                class="text-negative"
                                            />

                                            <span>Delete</span>
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                            </q-menu>
                        </q-btn>
                    </q-td>
                </template>
            </base-table>
        </template>
    </base-card>

    <base-confirmation-dialog
        v-model="confirmDialog"
        action="delete"
        @onAction="handleAction"
    />

    <q-dialog v-model="createDialog" persistent>
        <q-card style="min-width: 750px">
            <q-card-section class="tw-p-8">
                <h1 class="tw-text-xl tw-font-semibold">
                    {{ !datas.id ? 'Create' : 'Edit' }} Test Calls
                </h1>

                <q-form @submit="onSubmitTestCall" class="q-gutter-md tw-mt-10">
                    <section class="tw-space-y-3">
                        <base-date
                            label="Call Date"
                            v-model="form.call_date"
                            dense
                            required
                        />
                        <base-text
                            label="Location"
                            v-model="form.location"
                            type="textarea"
                            required
                        />
                        <base-text
                            label="Phone Number"
                            v-model="form.phone_number"
                            mask="#############"
                            dense
                            required
                        />
                        <base-text
                            label="Duration"
                            v-model.number="form.duration"
                            type="number"
                            dense
                            required
                            hint="In Minutes"
                        />
                        <base-select
                            label="Status"
                            v-model="form.status"
                            :options="[
                                {
                                    label: 'Terhubung',
                                    value: 'Terhubung'
                                },
                                {
                                    label: 'Tidak Terhubung',
                                    value: 'Tidak Terhubung'
                                },
                                {
                                    label: 'Terputus',
                                    value: 'Terputus'
                                },
                                {
                                    label: 'Note Service',
                                    value: 'Note Service'
                                },
                                {
                                    label: 'Sibuk',
                                    value: 'Sibuk'
                                }
                            ]"
                            emit-value
                            map-options
                            dense
                            :required="true"
                        />
                        <base-text
                            label="Notes"
                            v-model="form.notes"
                            type="textarea"
                        />
                    </section>

                    <div class="tw-flex tw-justify-center tw-gap-3">
                        <q-btn
                            unelevated
                            label="Submit"
                            type="submit"
                            color="secondary"
                        />
                        <q-btn
                            @click="closeDialog"
                            label="Cancel"
                            color="negative"
                            flat
                            class="q-ml-sm"
                        />
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
