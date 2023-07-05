<template>
  <ElPopover
    class="transparent-popover"
    placement="bottom"
    :visible="visible"
    :width="width"
    popper-style="background-image: linear-gradient(140deg, #eadedb 0%, #bc70a4 50%, #bfd641 75%);"
  >
    <template #reference>
      <LoadImg
        class="grammar-card"
        :filename="'check64.png'"
        :style="{ top, left }"
        v-show="show"
        @click="visible = true"
      />
    </template>
    <div style="margin-right: 25px">cWord grammar correction</div>
    <div ref="contentRef">{{ selectedText }}</div>
    <ElButton
      class="card-close-icon"
      type="danger"
      plain
      :icon="Close"
      @click="handleClose"
      size="small"
      circle
    ></ElButton>
  </ElPopover>
</template>

<script setup lang="ts">
import {
  ref,
  defineProps,
  watch,
  onMounted,
  onUnmounted,
  provide,
  inject,
  Ref,
} from "vue";
import { ElCard, ElButton, ElPopover } from "element-plus";
import { Close } from "@element-plus/icons-vue";
import { LoadImg } from "../components";

const props = defineProps({
  selectedText: {
    type: String,
    required: true,
  },
  top: {
    type: String,
    required: true,
  },
  left: {
    type: String,
    required: true,
  },
  show: {
    type: Boolean,
    required: true,
  },
});

const emits = defineEmits(["close"]);

const show = ref(props.show);
const visible = ref(false);
const cardRef: Ref<HTMLDivElement> = ref(null as any);
const popoverRef: Ref<HTMLDivElement> = ref(null as any);
const contentRef: Ref<HTMLDivElement> = ref(null as any);
const width = ref(300);

watch(
  () => props.show,
  (newValue) => {
    show.value = newValue;
  }
);

watch(
  () => props.selectedText,
  (newValue) => {
    const _width = contentRef.value.offsetWidth;
    width.value = _width;
  }
);

function handleClose() {
  visible.value = false;
  setTimeout(() => {
    show.value = false;
    emits("close");
  }, 10);
}

const handleClickOutside = (event: MouseEvent) => {
  if (
    cardRef.value &&
    !cardRef.value.contains(event.target as Node) &&
    popoverRef.value &&
    !popoverRef.value.contains(event.target as Node) &&
    show.value
  ) {
    handleClose();
  }
};

onMounted(() => {
  cardRef.value = document.querySelector(".grammar-card") as HTMLDivElement;
  popoverRef.value = document.querySelector(".el-popover") as HTMLDivElement;
  document.addEventListener("mousedown", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});
</script>

<style scoped>
.grammar-card {
  position: fixed;
  z-index: 9999;
}

.card-close-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
}
</style>
