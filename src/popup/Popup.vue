<template>
  <div class="popupview">
    <ElInput
      v-model="textarea"
      :rows="10"
      type=""
      placeholder="Please import JSON"
    />
  </div>
</template>

<script setup lang="ts">
import { ElInput } from "element-plus";
import { ChromeStorage } from "../hooks/chrome_storage";

import { onMounted, ref, watch } from "vue";
const textarea = ref("");

watch(
  () => textarea.value,
  (newValue) => {
    try {
      const jsonValue = JSON.parse(newValue);
      ChromeStorage.getInstance().set(
        "FEATURE_JSON",
        JSON.stringify(jsonValue)
      );
    } catch (e) {
      console.log("error", e);
      return;
    }
  }
);

onMounted(async () => {
  await ChromeStorage.getInstance()
    .get("FEATURE_JSON")
    .then((result) => {
      if (result) {
        textarea.value = result;
      } else {
        textarea.value = "No data";
      }
    });
});
</script>

<style scoped>
.popupview {
  width: 100%;
  height: 100%;
  padding: 5px;
  background-color: white;
  font-size: 16px;
  color: black;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.popupview__user-icon img {
  width: 40px;
  border-radius: 20px;
}

.popupview__user {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.popupview__user-logout {
  padding: 3px 12px;
  border-radius: 10px;
  background-color: white;
  border: 1px solid gray;
  color: black;
}

.popupview__user-logout:hover {
  background-color: lightgray;
}
</style>
