<script setup lang="ts">
import { ref } from 'vue';

type Item = {
  id: number,
  label: string
}

type Socket = {
  label: string,
  item: Item | undefined
}

type Sockets = {
  [key: number]: Socket
}

const genNSockets = (n: number): Sockets => {
  const res: Sockets = {}
  for (let i = 1; i <= n; i++) {
    res[i] = {
      label: `Socket ${i}`,
      item: undefined
    }
  }
  return res
}

const genNItems = (n: number): Item[] => {
  const res: Item[] = []
  for (let i = 1; i <= n; i++) {
    res.push({
      id: i,
      label: `Item ${i}`
    })
  }
  return res
}

const items = ref(genNItems(10))
const sockets = ref(genNSockets(3))

const draggingItem = ref<{ item: Item, index: number }>();
const draggingFrom = ref<"list" | "socket">();

const onItemDrag = (item: Item, index: number) => {
  draggingItem.value = { item, index }
}

const onDragEnd = () => {
  draggingItem.value = undefined;
  draggingFrom.value = undefined;
};

const onSocketDrop = (socketId: number) => {
  if (draggingItem.value && !sockets.value[socketId].item) {
    sockets.value[socketId].item = draggingItem.value.item
    items.value.splice(draggingItem.value.index, 1)
  }
  draggingItem.value = undefined
}

const onUnsocket = (socketId: number) => {
  items.value.push(sockets.value[socketId].item!)
  items.value.sort((a, b) => a.id - b.id)
  sockets.value[socketId].item = undefined
}

</script>

<template>
  <div class="p-6 space-y-6">
    <div id="memoryList" class="p-4 border-2 rounded-lg flex space-x-3">
      <div v-for="(item, index) in items" :key="item.id" class="p-2 border-2 bg-gray-200 select-none cursor-move"
        draggable="true" @dragstart="onItemDrag(item, index)" @dragend="onDragEnd">
        {{ item.label }}
      </div>
    </div>

    <div v-for="(socket, id, _) in sockets" :key="id" @drop="onSocketDrop(id)" class="border-2 rounded-lg"
      @dragover.prevent="" @dragleave="">
      <div v-if="socket.item" @click="onUnsocket(id)" class="cursor-pointer">
        {{ socket.item.label }}
      </div>
      <div v-else>Empty</div>
    </div>
  </div>
</template>
<style scoped>
.transition-colors {
  transition: background-color 0.2s, border-color 0.2s;
}
</style>