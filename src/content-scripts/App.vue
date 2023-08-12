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
import { SystemVariableParser } from "../lib";
import { selectedModeEnum } from "../types";
import { consoleLog, LogLevelEnum } from "../utils";

const selectedText = ref("");
const mousedownSelectedText = ref(false);
const top = ref("");
const left = ref("");
const topMousedown = ref("");
const leftMousedown = ref("");
const showMainCard = ref(false);
const selectedMode: Ref<selectedModeEnum> = ref(
  selectedModeEnum.EDITABLE_CONTEXT_MENU
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
      selectedText.value = window.getSelection()!.toString().trim();
      selectedMode.value = selectedModeEnum.EDITABLE_CONTEXT_MENU;
    } else {
      selectedText.value = "";
      selectedMode.value = selectedModeEnum.READONLY_CONTEXT_MENU;
    }
    top.value = topMousedown.value;
    left.value = leftMousedown.value;
    showMainCard.value = true;
  }
});

document.addEventListener("mousedown", function (event: MouseEvent) {
  consoleLog(LogLevelEnum.DEBUG, "mousedown");
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
  consoleLog(LogLevelEnum.DEBUG, "mouseup");
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

document.addEventListener("keyup", function (event: KeyboardEvent) {
  const pressedKey = event.key;
  const selection = window.getSelection()?.toString().trim();
  if (pressedKey === "Shift" || pressedKey === "Meta") {
    if (selection && !showMainCard.value) {
      selectedText.value = selection;
      SystemVariableParser.getInstance().setSelectedText(selection);
      top.value = topMousedown.value;
      left.value = leftMousedown.value;
      const activeElement = document.activeElement as HTMLElement;
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
  } else {
    showMainCard.value = false;
  }
});

function handleMainCardClose() {
  showMainCard.value = false;
}
</script>

<style scoped></style>
