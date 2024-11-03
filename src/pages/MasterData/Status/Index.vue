<script setup lang="ts">
import moment from 'moment'
import { Loading, QTableColumn } from 'quasar'
import { api } from 'src/boot/axios'
import { Notification } from 'src/boot/notify'
import { IBreadcrumbs } from 'src/components/common/BaseTitle.vue'
import { computed, onMounted, reactive, ref } from 'vue'

// Data
const searchKeyword = ref<string>('')
const tableColumns: QTableColumn[] = [
    {
        name: 'name',
        label: 'Name',
        align: 'left',
        field: (row: any) => row.name
    },
    {
        name: 'action',
        label: 'Action',
        align: 'right',
        field: ''
    }
]
const tableRows = ref([])
const filteredTableRows = computed(() => {
    if (searchKeyword.value) {
        return tableRows.value.filter((item: any) => {
            if (
                item.name
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
        title: 'Status',
        href: '',
        icon: 'Book1'
    }
])
const dialog = ref<boolean>(false)
const isEdit = ref<boolean>(false)
const maritalStatusID = ref<number>()
const form = reactive<{ name: string }>({
    name: ''
})
const confirmDialog = ref(false)

// methods
const fetchMaritalStatus = async () => {
    try {
        const { data: response } = await api.get('/marital-status')

        if (response.data) {
            tableRows.value = response.data
        }
    } catch (error) {
        console.log(error)
    }
}

const openDialog = (data?: any) => {
    if (data) {
        isEdit.value = true

        form.name = data.name
        maritalStatusID.value = data.id
    }

    dialog.value = true
}

const closeDialog = () => {
    dialog.value = false
    isEdit.value = false

    form.name = ''
    maritalStatusID.value = 0
}

const onSubmitMaritalStatus = () => {
    if (!isEdit.value) {
        onCreateMaritalStatus()
    } else {
        onUpdateMaritalStatus()
    }
}

const onCreateMaritalStatus = async () => {
    try {
        Loading.show({
            message: 'Please wait...'
        })

        const { data: response } = await api.post('/marital-status', {
            name: form.name
        })

        if (response.data) {
            Notification(response.message, 'positive')

            fetchMaritalStatus()
            closeDialog()
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const onUpdateMaritalStatus = async () => {
    try {
        Loading.show({
            message: 'Please wait...'
        })

        const { data: response } = await api.put(
            `/marital-status/${maritalStatusID.value}`,
            {
                name: form.name
            }
        )

        if (response.data) {
            Notification(response.message, 'positive')

            fetchMaritalStatus()
            closeDialog()
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const openDeleteDialog = (id: number) => {
    maritalStatusID.value = id

    confirmDialog.value = true
}

const handleAction = (val: boolean) => {
    confirmDialog.value = false
    if (val) {
        onDeleteMaritalStatus()
    } else {
        maritalStatusID.value = 0
    }
}

const onDeleteMaritalStatus = async () => {
    Loading.show({
        message: 'Please wait...'
    })

    try {
        const { data: response } = await api.delete(
            `/marital-status/${maritalStatusID.value}`
        )

        if (response.data) {
            Notification(response.message, 'positive')
            fetchMaritalStatus()
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

// hooks
onMounted(() => {
    fetchMaritalStatus()
})
</script>

<template>
    <base-title title="Status" :crumbs="breadcrumbs" />

    <base-card title="List of Status">
        <template #action>
            <div class="tw-space-x-4">
                <q-btn
                    outline
                    no-caps
                    unelevated
                    color="info"
                    @click="dialog = true"
                >
                    <base-icon
                        icon-name="AddSquare"
                        size="16"
                        class="tw-mr-3"
                    />
                    Create New
                </q-btn>
            </div>

            <q-input
                filled
                v-model="searchKeyword"
                type="text"
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
                row-key="name"
            >
                <template #name="props">
                    <q-td>
                        <div
                            class="tw-underline tw-cursor-pointer tw-text-teal-600"
                        >
                            {{ props.row.name }}
                        </div>
                    </q-td>
                </template>

                <template #address="props">
                    <q-td>
                        <div class="tw-w-48 tw-text-wrap !tw-truncate">
                            {{ props.row.address }}

                            <q-tooltip
                                v-if="props.row.address.length >= 40"
                                class="!tw-w-56"
                            >
                                {{ props.row.address }}
                            </q-tooltip>
                        </div>
                    </q-td>
                </template>

                <template #action="props">
                    <q-td class="tw-flex tw-justify-end">
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
                                        @click="openDialog(props.row)"
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

    <q-dialog v-model="dialog" persistent>
        <q-card style="min-width: 500px">
            <q-form @submit="onSubmitMaritalStatus">
                <q-card-section>
                    <h1 class="tw-font-semibold tw-text-lg tw-mb-5">
                        {{ isEdit ? 'Edit' : 'Create' }} Marital Status
                    </h1>

                    <base-text
                        label="Name"
                        v-model="form.name"
                        align="top"
                        required
                    />
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn
                        flat
                        label="Cancel"
                        color="negative"
                        v-close-popup
                        @click="closeDialog"
                    />
                    <q-btn flat type="submit" label="Submit" color="info" />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>

    <base-confirmation-dialog
        v-model="confirmDialog"
        action="delete"
        @onAction="handleAction"
    />
</template>
