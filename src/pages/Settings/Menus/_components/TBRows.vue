<template>
    <q-tr>
        <q-td class="tw-font-medium">
            <div
                class="tw-flex tw-gap-3 tw-items-center"
                :style="{
                    marginLeft: `${indent}px`
                }"
            >
                <q-btn
                    v-if="row.childrens?.length"
                    dense
                    flat
                    size="sm"
                    @click="toggleExpand(row.id)"
                >
                    <base-icon
                        :icon-name="
                            expandTable.includes(row.id)
                                ? 'ArrowRight3'
                                : 'ArrowDown3'
                        "
                        size="16"
                    />
                </q-btn>
                {{ row.name }}
            </div>
        </q-td>
        <q-td>
            {{ row.url }}
        </q-td>
        <q-td>
            {{ row.ord }}
        </q-td>
        <q-td class="tw-cursor-pointer">
            <BaseIcon :iconName="row.icon" :size="18" />

            <q-tooltip>
                {{ row.icon }}
            </q-tooltip>
        </q-td>
    </q-tr>

    <template v-if="!expandTable.includes(row.id)">
        <TBRows
            v-for="child in row.childrens"
            :row="child"
            :indent="indent + 25"
            @onEdit="handleClickEdit"
            @onDelete="handleClickDelete"
        />
    </template>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'

defineProps(['props', 'row', 'indent'])
const emit = defineEmits([''])

const expandTable = ref([])

const toggleExpand = (id) => {
    expandTable.value.includes(id)
        ? expandTable.value.splice(expandTable.value.indexOf(id), 1)
        : expandTable.value.push(id)
}

const handleClickEdit = (row) => {
    emit('onEdit', row)
}

const handleClickDelete = (id) => {
    emit('onDelete', id)
}

onMounted(() => {})
</script>
