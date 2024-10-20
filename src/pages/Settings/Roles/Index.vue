<script setup lang="ts">
import { Loading, QTableColumn } from 'quasar'
import { api } from 'src/boot/axios'
import { Notification } from 'src/boot/notify'
import { IBreadcrumbs } from 'src/components/common/BaseTitle.vue'
import { computed, onMounted, reactive, ref } from 'vue'

// data
const breadcrumbs = ref<IBreadcrumbs[]>([
    {
        title: 'Dashboard',
        href: 'dashboard-page',
        icon: 'Category2'
    },
    {
        title: 'Settings',
        href: '',
        icon: 'Headphones'
    },
    {
        title: 'Roles',
        href: '',
        icon: 'Lock'
    }
])
const tableColumns: QTableColumn[] = [
    {
        name: 'name',
        label: 'Name',
        align: 'left',
        field: (row: any) => row.name
    },
    {
        name: 'description',
        label: 'Description',
        align: 'left',
        field: (row: any) => row.description || '-'
    },
    {
        name: 'action',
        label: '',
        align: 'left',
        field: ''
    }
]
const tableRows = ref<any>([])
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
const tableLoading = ref(false)
const searchKeyword = ref<string>('')
const isEdit = ref(false)
const form = reactive<{
    name: string
    description: string
}>({
    name: '',
    description: ''
})
const roleData = ref<any>({})
const roleDialog = ref(false)
const menuDialog = ref(false)
const confirmDialog = ref(false)
const roleId = ref<number>(0)
const menus = ref<any>([])
const ticked = ref([])

// methods
const fetchRoles = async () => {
    try {
        tableLoading.value = true

        const { data: response } = await api.get('/roles')

        if (response.data) {
            tableRows.value = response.data
        }
    } catch (error) {
        console.log(error)
    } finally {
        tableLoading.value = false
    }
}

const fetchMenus = async () => {
    try {
        const { data: response } = await api.get('/menus')

        if (response.data) {
            menus.value = response.data.map((item: any) => {
                return {
                    id: item.id,
                    label: item.name,
                    parent_id: item.parent_id,
                    children: mappingChildMenus(item.childrens)
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
}

const mappingChildMenus = (childrens: any): any => {
    if (childrens) {
        return childrens.map((item: any) => {
            return {
                id: item.id,
                label: item.name,
                parent_id: item.parent_id,
                children: mappingChildMenus(item.childrens)
            }
        })
    } else {
        return childrens
    }
}

const openDialog = (data: any) => {
    if (data) {
        isEdit.value = true

        form.description = data.description
        form.name = data.name
        roleId.value = data.id
    }

    roleDialog.value = true
}

const openMenuDialog = (data: any) => {
    if (data) {
        roleData.value = data
        ticked.value = data.menus.map((x: any) => x.menu_id)
    }

    roleId.value = data.id
    menuDialog.value = true
    console.log(data)
}

const closeDialog = () => {
    roleDialog.value = false
    menuDialog.value = false

    isEdit.value = false
    roleId.value = 0

    form.name = ''
    form.description = ''

    ticked.value = []
}

const onSubmitRole = async () =>
    !isEdit.value ? onCreateRole() : onUpdateRole()

const onCreateRole = async () => {
    try {
        Loading.show({
            message: 'Please wait...'
        })

        const { data: response } = await api.post('/roles', {
            ...form
        })

        if (response.data) {
            Notification(response.message, 'positive')
            fetchRoles()
            closeDialog()
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const onUpdateRole = async () => {
    try {
        Loading.show({
            message: 'Please wait...'
        })

        const { data: response } = await api.put(`/roles/${roleId.value}`, {
            ...form
        })

        if (response.data) {
            Notification(response.message, 'positive')
            fetchRoles()
            closeDialog()
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const openDeleteDialog = (id: number) => {
    roleId.value = id

    confirmDialog.value = true
}

const handleAction = (val: boolean) => {
    confirmDialog.value = false
    if (val) {
        onDeleteRole()
    }
}

const onDeleteRole = async () => {
    Loading.show({
        message: 'Please wait...'
    })

    try {
        const { data: response } = await api.delete(`/roles/${roleId.value}`)

        if (response.data) {
            Notification(response.message, 'positive')
            fetchRoles()
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const onAssignMenus = async () => {
    if (ticked.value.length) {
        try {
            Loading.show({
                message: 'Please wait...'
            })

            const { data: response } = await api.post('/roles/assign-menus', {
                role_id: roleId.value,
                menu_ids: ticked.value
            })

            if (response.data) {
                Notification(response.message, 'positive')
                fetchRoles()
                closeDialog()
            }
        } catch (error) {
            console.log(error)
        } finally {
            Loading.hide()
        }
    }
}

// hooks
onMounted(() => {
    fetchRoles()
    fetchMenus()
})
</script>

<template>
    <base-title title="Roles" :crumbs="breadcrumbs" />

    <base-card title="Lists Roles">
        <template #action>
            <div class="tw-space-x-4">
                <q-btn
                    outline
                    no-caps
                    unelevated
                    color="info"
                    @click="openDialog(null)"
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
                :loading="tableLoading"
                row-key="name"
            >
                <template #period="props">
                    <q-td>
                        <router-link
                            :to="{
                                name: 'call-report-edit-page',
                                params: {
                                    id: props.row.id || 0
                                }
                            }"
                        >
                            <div
                                class="tw-underline tw-cursor-pointer tw-text-teal-600"
                            >
                                {{ props.row.month_period }}
                                {{ props.row.year }}
                            </div>
                        </router-link>
                    </q-td>
                </template>

                <template #action="props">
                    <q-td>
                        <q-btn flat no-caps unelevated color="secondary">
                            <base-icon icon-name="More" size="16" />

                            <q-menu
                                anchor="bottom end"
                                self="top end"
                                class="tw-shadow-lg tw-shadow-gray-50 !tw-border"
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

                                    <q-item
                                        clickable
                                        @click="openMenuDialog(props.row)"
                                    >
                                        <q-item-section
                                            class="tw-flex-row tw-gap-3 tw-items-center tw-justify-start"
                                        >
                                            <base-icon
                                                icon-name="Menu"
                                                class="text-accent"
                                            />
                                            <span>Menu</span>
                                        </q-item-section>
                                    </q-item>

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

    <q-dialog v-model="roleDialog" persistent position="right">
        <q-card style="min-width: 900px">
            <q-card-section class="tw-space-y-5">
                <h1 class="tw-font-semibold tw-text-lg tw-mb-5">
                    {{ isEdit ? 'Edit' : 'Create' }} Roles
                </h1>

                <q-form @submit="onSubmitRole" class="q-gutter-md">
                    <section class="tw-space-y-5">
                        <base-text
                            label="Name"
                            v-model="form.name"
                            align="top"
                            required
                            dense
                        />

                        <base-text
                            label="Description"
                            v-model="form.description"
                            type="textarea"
                            align="top"
                            dense
                        />
                    </section>

                    <div class="tw-mt-5 tw-flex tw-gap-5 tw-justify-center">
                        <q-btn
                            flat
                            label="Cancel"
                            color="negative"
                            v-close-popup
                            @click="closeDialog"
                        />
                        <q-btn
                            unelevated
                            type="submit"
                            label="Submit"
                            color="secondary"
                        />
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>

    <q-dialog v-model="menuDialog" persistent position="right">
        <q-card style="min-width: 900px">
            <q-card-section class="tw-space-y-5">
                <h1 class="tw-font-semibold tw-text-lg tw-mb-5">
                    Assign Menus : {{ roleData?.name }}
                </h1>

                <q-tree
                    ref="tree"
                    node-key="id"
                    class="tw-w-full"
                    color="secondary"
                    v-model:ticked="ticked"
                    :nodes="menus"
                    tick-strategy="strict"
                    :default-expand-all="true"
                />

                <div class="tw-mt-5 tw-flex tw-gap-5 tw-justify-center">
                    <q-btn
                        flat
                        label="Cancel"
                        color="negative"
                        v-close-popup
                        @click="closeDialog"
                    />
                    <q-btn
                        unelevated
                        @click="onAssignMenus"
                        label="Submit"
                        color="secondary"
                    />
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>

    <base-confirmation-dialog
        v-model="confirmDialog"
        action="delete"
        @onAction="handleAction"
    />
</template>
