<script setup lang="ts">
import { Loading, Notify, QTableColumn } from 'quasar'
import { api } from 'src/boot/axios'
import { Notification } from 'src/boot/notify'
import { IBreadcrumbs } from 'src/components/common/BaseTitle.vue'
import { useAuthStore } from 'src/stores/auth'
import { computed, onMounted, reactive, ref } from 'vue'

// store
const authStore = useAuthStore()

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
        title: 'Users',
        href: '',
        icon: 'People'
    }
])
const tableColumns: QTableColumn[] = [
    {
        name: 'username',
        label: 'Username',
        align: 'left',
        field: (row: any) => row.username
    },
    {
        name: 'employee',
        label: 'Fullname',
        align: 'left',
        field: (row: any) => row.employee.name
    },
    {
        name: 'jasnita_number',
        label: 'Jasnita Number',
        align: 'left',
        field: (row: any) => row.employee.jasnita_number
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
            if (
                item.employee?.name
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
const tableLoading = ref<boolean>(false)
const searchKeyword = ref<string>('')
const isEdit = ref<boolean>(false)
const userDetail = ref<any>({})
const userDialog = ref<boolean>(false)
const roleDialog = ref<boolean>(false)
const optEmployees = ref([])
const form = reactive({
    employee_id: '',
    username: '',
    password: ''
})
const passwordStrength = computed(() => {
    const strength = {
        min: false,
        capital: false,
        num: false,
        symbol: false,
        total: 0
    }

    if (form.password.length >= 8) {
        strength.min = true
        strength.total += 1
    }

    if (/^(?=.*[a-z])(?=.*[A-Z]).+$/.test(form.password)) {
        strength.capital = true
        strength.total += 1
    }

    if (/[0-9]/.test(form.password)) {
        strength.num = true
        strength.total += 1
    }

    if (/[!@#$%^&*_-]/.test(form.password)) {
        strength.symbol = true
        strength.total += 1
    }

    return strength
})
const confirmDialog = ref(false)
const roles = ref<any>([])
const ticked = ref<any>([])

// methods
const fetchUsers = async () => {
    Loading.show({
        message: 'Please wait...'
    })

    try {
        tableLoading.value = true

        const { data: response } = await api.get('/users')

        if (response.data) {
            tableRows.value = response.data
        }
    } catch (error) {
        console.log(error)
    } finally {
        tableLoading.value = false
        Loading.hide()
    }
}

const fetchRoles = async () => {
    try {
        const { data: response } = await api.get('/roles')

        if (response.data) {
            roles.value = response.data.map((item: any) => {
                return {
                    id: item.id,
                    label: item.name,
                    children: []
                }
            })
        }
    } catch (error) {}
}

const fetchEmployees = async () => {
    try {
        const { data: response } = await api.get('/employees')

        if (response.data) {
            optEmployees.value = response.data.map((item: any) => {
                return {
                    label: item.name,
                    value: item.id
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
}

const openDialog = (data: any) => {
    if (data) {
        isEdit.value = true
        userDetail.value = data

        form.username = userDetail.value?.username
        form.employee_id = userDetail.value?.employee_id
    }

    userDialog.value = true
}

const openRoleDialog = (data: any) => {
    if (data) {
        userDetail.value = data

        ticked.value = data.roles.map((item: any) => item.role_id)
    }

    roleDialog.value = true
}

const closeDialog = () => {
    userDialog.value = false
    isEdit.value = false

    form.username = ''
    form.password = ''
    form.employee_id = ''

    roleDialog.value = false
    ticked.value = []
}

const getIconName = (cond: any) => {
    return cond ? 'TickCircle' : 'Slash'
}

const onSubmitUser = async () => {
    if (!isEdit.value) {
        onCreateUser()
    } else {
        onUpdateUser()
    }
}

const onCreateUser = async () => {
    Loading.show({
        message: 'Please wait...'
    })

    try {
        const { data: response } = await api.post('/users', {
            username: form.username,
            password: form.password,
            employee_id: form.employee_id
        })

        if (response) {
            Notification(response.message, 'positive')

            fetchUsers()
            closeDialog()
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const onUpdateUser = async () => {
    Loading.show({
        message: 'Please wait...'
    })

    try {
        const payload: any = {
            username: form.username,
            employee_id: form.employee_id
        }

        if (form.password) {
            payload.password = form.password
        }

        const { data: response } = await api.put(
            `/users/${userDetail.value?.id}`,
            payload
        )

        if (response) {
            Notification(response.message, 'positive')

            fetchUsers()
            closeDialog()
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const openDeleteDialog = (id: number) => {
    userDetail.value = { id }

    confirmDialog.value = true
}

const handleAction = (val: boolean) => {
    confirmDialog.value = false
    if (val) {
        onDeleteUser()
    } else {
        userDetail.value = {}
    }
}

const onDeleteUser = async () => {
    Loading.show({
        message: 'Please wait...'
    })

    try {
        const { data: response } = await api.delete(
            `/users/${userDetail.value?.id}`
        )

        if (response.data) {
            Notification(response.message, 'positive')
            fetchUsers()
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const onAssignRoles = async () => {
    if (ticked.value.length) {
        try {
            Loading.show({
                message: 'Please wait...'
            })

            const { data: response } = await api.post('/users/assign-roles', {
                user_id: userDetail.value?.id,
                role_ids: ticked.value
            })

            if (response.data) {
                Notification(response.message, 'positive')
                fetchUsers()
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
    fetchUsers()
    fetchEmployees()
    fetchRoles()
})
</script>

<template>
    <base-title title="Users" :crumbs="breadcrumbs" />

    <base-card title="Lists Users">
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

                <q-btn outline no-caps unelevated color="negative" class="tw-hidden">
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
                                        @click="openRoleDialog(props.row)"
                                    >
                                        <q-item-section
                                            class="tw-flex-row tw-gap-3 tw-items-center tw-justify-start"
                                        >
                                            <base-icon
                                                icon-name="Lock"
                                                class="text-accent"
                                            />
                                            <span>Role</span>
                                        </q-item-section>
                                    </q-item>

                                    <q-item
                                        v-if="
                                            authStore.user?.id != props.row.id
                                        "
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

    <q-dialog v-model="userDialog" persistent position="right">
        <q-card style="min-width: 500px">
            <q-form @submit="onSubmitUser">
                <q-card-section>
                    <h1 class="tw-font-semibold tw-text-lg tw-mb-5">
                        {{ isEdit ? 'Edit' : 'Create' }} Users
                    </h1>

                    <section class="tw-space-y-5">
                        <base-select
                            align="top"
                            label="Employee"
                            :options="optEmployees"
                            v-model="form.employee_id"
                            emit-value
                            map-options
                            dense
                            :required="true"
                        />

                        <base-text
                            label="Username"
                            v-model="form.username"
                            align="top"
                            required
                            dense
                        />

                        <base-password
                            label="Password"
                            v-model="form.password"
                            align="top"
                            :required="!isEdit"
                            dense
                        />

                        <section
                            class="tw-space-y-2 -tw-pt-10"
                            v-if="form.password"
                        >
                            <h1 class="tw-text-xs tw-font-semibold">
                                Create a password that:
                            </h1>

                            <div class="tw-text-xs tw-space-y-2">
                                <p
                                    class="tw-flex tw-items-center tw-gap-2"
                                    :class="{
                                        'tw-text-red': !passwordStrength.capital
                                    }"
                                >
                                    <BaseIcon
                                        :icon-name="
                                            getIconName(
                                                passwordStrength.capital
                                            )
                                        "
                                        :size="12"
                                    />
                                    contains both lower (a-z) and upper case
                                    letters (A-Z )
                                </p>
                                <p
                                    class="tw-flex tw-items-center tw-gap-2"
                                    :class="{
                                        'tw-text-red': !passwordStrength.symbol
                                    }"
                                >
                                    <BaseIcon
                                        :icon-name="
                                            getIconName(passwordStrength.symbol)
                                        "
                                        :size="12"
                                    />
                                    contains at least one special symbol.
                                </p>
                                <p
                                    class="tw-flex tw-items-center tw-gap-2"
                                    :class="{
                                        'tw-text-red': !passwordStrength.num
                                    }"
                                >
                                    <BaseIcon
                                        :icon-name="
                                            getIconName(passwordStrength.num)
                                        "
                                        :size="12"
                                    />
                                    contains at least one number (0-9).
                                </p>
                                <p
                                    class="tw-flex tw-items-center tw-gap-2"
                                    :class="{
                                        'tw-text-red': !passwordStrength.min
                                    }"
                                >
                                    <BaseIcon
                                        :icon-name="
                                            getIconName(passwordStrength.min)
                                        "
                                        :size="12"
                                    />
                                    contains at least 8 characters
                                </p>
                            </div>
                        </section>
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
                            :disable="passwordStrength.total < 4 && !isEdit"
                        />
                    </div>
                </q-card-section>
            </q-form>
        </q-card>
    </q-dialog>

    <q-dialog v-model="roleDialog" persistent position="right">
        <q-card style="min-width: 900px">
            <q-card-section class="tw-space-y-5">
                <h1 class="tw-font-semibold tw-text-lg tw-mb-5">
                    Assign Roles : {{ userDetail?.name }}
                </h1>

                <q-tree
                    ref="tree"
                    node-key="id"
                    class="tw-w-full"
                    color="secondary"
                    v-model:ticked="ticked"
                    :nodes="roles"
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
                        @click="onAssignRoles"
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
