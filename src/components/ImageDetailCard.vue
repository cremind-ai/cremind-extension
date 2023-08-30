<template>
  <div>
    <template v-if="position === 'top' || position === 'bottom'">
      <ElCard
        class="image-detail-card"
        :style="{ width: width, height: height }"
      >
        <template v-if="position === 'top'">
          <div>
            <div class="text-content">
              <h1 class="title">{{ title }}</h1>
              <p class="content">{{ content }}</p>
              <slot name="extra"></slot>
            </div>
            <ElDivider />
            <div class="image-content">
              <ElImage
                :src="imgUrl"
                :style="{ width: imageWidth, height: imageHeight }"
                fit="contain"
              />
            </div>
          </div>
        </template>
        <template v-else-if="position === 'bottom'">
          <div>
            <div class="image-content">
              <ElImage
                :src="imgUrl"
                :style="{ width: imageWidth, height: imageHeight }"
                fit="contain"
              />
            </div>
            <ElDivider />
            <div class="text-content">
              <h1 class="title">{{ title }}</h1>
              <p class="content">{{ content }}</p>
              <slot name="extra"></slot>
            </div>
          </div>
        </template>
      </ElCard>
    </template>
    <template v-if="position === 'left' || position === 'right'">
      <ElCard
        :style="{
          width: width,
          height: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }"
      >
        <template v-if="position === 'left'">
          <div style="display: flex; align-items: center; width: 100%">
            <div class="text-content">
              <h1 class="title">{{ title }}</h1>
              <p class="content">{{ content }}</p>
              <slot name="extra"></slot>
            </div>
            <ElDivider direction="vertical" style="min-height: 100px" />
            <div class="image-content">
              <ElImage
                :src="imgUrl"
                :style="{ width: imageWidth, height: imageHeight }"
                fit="contain"
              />
            </div>
          </div>
        </template>
        <template v-else-if="position === 'right'">
          <div style="display: flex; align-items: center; width: 100%">
            <div class="image-content">
              <ElImage
                :src="imgUrl"
                :style="{ width: imageWidth, height: imageHeight }"
                fit="contain"
              />
            </div>
            <ElDivider direction="vertical" style="min-height: 100px" />
            <div class="text-content">
              <h1 class="title">{{ title }}</h1>
              <p class="content">{{ content }}</p>
              <slot name="extra"></slot>
            </div>
          </div>
        </template>
      </ElCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { ElDivider } from "element-plus";
import { ElCard } from "element-plus";
import { ElImage } from "element-plus";

const props = defineProps({
  filename: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: false,
    default: "",
  },
  content: {
    type: String,
    required: false,
    default: "",
  },
  width: {
    type: String,
    required: false,
    default: "auto",
  },
  height: {
    type: String,
    required: false,
    default: "auto",
  },
  position: {
    type: String as PropType<"top" | "bottom" | "left" | "right">,
    default: "top",
    validator: (value: string) =>
      ["top", "bottom", "left", "right"].includes(value),
  },
  imageWidth: {
    type: String,
    default: "100%",
  },
  imageHeight: {
    type: String,
    default: "auto",
  },
});
const imgUrl = computed(() => chrome.runtime.getURL(`/img/${props.filename}`));
</script>

<style scoped>
.image-detail-card .text-content {
  flex: 1;
  padding: 10px;
}

.image-detail-card .text-content .title {
  font-size: 16px;
}

.image-detail-card .text-content .content {
  font-size: 14px;
}

.image-detail-card .image-content {
  padding: 10px;
}

.image-detail-card .el-divider {
  margin: 0px;
}
</style>
