<template>
  <MainCard
    :selectedText="selectedText"
    :top="top"
    :left="left"
    :show="showMainCard"
    :selectedMode="selectedMode"
    @close="handleMainCardClose"
  />
  <ChatDialog />
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";
import { MainCard } from "../components";
import { ChatDialog } from "../components";
import { SystemVariableParser } from "../lib/system_variable_parser";
import { selectedModeEnum } from "../types";

const selectedText = ref("");
const mousedownSelectedText = ref(false);
const top = ref("");
const left = ref("");
const topMousedown = ref("");
const leftMousedown = ref("");
const showMainCard = ref(false);
const selectedMode: Ref<selectedModeEnum> = ref(
  selectedModeEnum.EDITABLE_NO_CONTENT
);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (!showMainCard.value) {
    const activeElement = document.activeElement as HTMLElement;
    if (
      activeElement &&
      ((activeElement as HTMLElement).isContentEditable ||
        activeElement.nodeName.toUpperCase() === "TEXTAREA" ||
        activeElement.nodeName.toUpperCase() === "INPUT")
    ) {
      selectedMode.value = selectedModeEnum.EDITABLE_NO_CONTENT;
      selectedText.value = "";
      top.value = topMousedown.value;
      left.value = leftMousedown.value;
      showMainCard.value = true;
    }
  }
});

document.addEventListener("mousedown", function (event: MouseEvent) {
  const selection = window.getSelection()?.toString().trim();
  if (selection) {
    mousedownSelectedText.value = true;
  } else {
    mousedownSelectedText.value = false;
  }
  topMousedown.value = `${event.clientY + window.scrollY}px`;
  leftMousedown.value = `${event.clientX + window.scrollX}px`;
});

document.addEventListener("mouseup", function (event: MouseEvent) {
  const selection = window.getSelection()?.toString().trim();
  const activeElement = document.activeElement as HTMLElement;
  if (selection && !mousedownSelectedText.value && !showMainCard.value) {
    selectedText.value = selection;
    SystemVariableParser.getInstance().setSelectedText(selection);
    top.value = `${event.clientY + window.scrollY}px`;
    left.value = `${event.clientX + window.scrollX}px`;
    if (
      activeElement &&
      (activeElement.isContentEditable ||
        activeElement.nodeName.toUpperCase() === "TEXTAREA" ||
        activeElement.nodeName.toUpperCase() === "INPUT")
    ) {
      selectedMode.value = selectedModeEnum.EDITABLE;
    } else {
      selectedMode.value = selectedModeEnum.READONLY;
    }

    showMainCard.value = true;
  }
});

function handleMainCardClose() {
  showMainCard.value = false;
}
</script>

<style scoped></style>
