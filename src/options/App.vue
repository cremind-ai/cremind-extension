<template>
  <ElContainer class="layout-container">
    <ElHeader class="toolbar" :style="{ backgroundColor: backgroundColor }">
      <h1>CreMind GPT Extension</h1>
    </ElHeader>
    <ElContainer>
      <ElAside width="200px">
        <ElScrollbar>
          <ElMenu
            default-active="0"
            class="menu-settings"
            @select="handleSelectMenu"
            @open="handleOpen"
          >
            <ElMenuItem
              v-for="(menu, index) in menuList"
              :key="index"
              :index="`${index}`"
            >
              {{ menu.name }}
            </ElMenuItem>
          </ElMenu>
        </ElScrollbar>
      </ElAside>
      <ElMain><RouterView /></ElMain>
    </ElContainer>
  </ElContainer>
</template>

<script setup lang="ts">
import { watch, computed, onMounted, ref, Ref } from "vue";
import { ElContainer } from "element-plus";
import { ElHeader } from "element-plus";
import { ElMain } from "element-plus";
import { ElFooter } from "element-plus";
import { ElAside } from "element-plus";
import { ElMenu } from "element-plus";
import { ElMenuItem } from "element-plus";
import { ElScrollbar } from "element-plus";
import { ElFormItem } from "element-plus";
import { ElSwitch } from "element-plus";
import { Icon } from "@iconify/vue";
import { ChromeStorage } from "@/hooks/chrome_storage";
import { consoleLog, LogLevelEnum } from "@/utils";
import { useUserSettingsStore } from "@/store/user_settings";
import router from "./router";
import { useRouter, useRoute } from "vue-router";
import { LOGO_COLOR, LOGO_COLOR_DARK } from "@/constants";

const { push } = useRouter();

const userSettings = useUserSettingsStore();

const isDark = computed(() => userSettings.getIsDark);

const backgroundColor = computed(() => {
  return isDark.value ? LOGO_COLOR_DARK : LOGO_COLOR;
});

const menuList = router.options.routes[0].children;

const handleSelectMenu = (key: string, keyPath: string[]) => {
  const index = parseInt(key);
  push(menuList![index].path);
};

const handleOpen = (key: string, keyPath: string[]) => {
  const index = parseInt(key);
  push(menuList![index].path);
};

onMounted(async () => {
  await userSettings.initialize();
});
</script>

<style scoped>
.layout-container {
  width: 80%;
  max-width: 1400px;
  margin: 0 auto;
}
.layout-container .el-header {
  position: relative;
  color: azure;
}
.layout-container .el-aside {
  color: var(--el-text-color-regular);
}
.layout-container .el-menu {
  border-right: none;
}
.layout-container .ElMain {
  padding: 0;
}
.layout-container .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
