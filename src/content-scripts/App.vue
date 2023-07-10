<template>
  <MainCard
    :selectedText="selectedText"
    :top="top"
    :left="left"
    :show="showMainCard"
    :isContentEditable="isContentEditable"
    @close="handleMainCardClose"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { MainCard } from "../components";

const selectedText = ref("");
const top = ref("");
const left = ref("");
const showMainCard = ref(false);
const isContentEditable = ref(false);

document.addEventListener("mouseup", function (event: MouseEvent) {
  const selection = window.getSelection()?.toString().trim();
  if (selection && !showMainCard.value) {
    selectedText.value = selection;
    top.value = `${event.clientY}px`;
    left.value = `${event.clientX}px`;

    if (
      document.activeElement &&
      ((document.activeElement as HTMLElement).isContentEditable ||
        document.activeElement.nodeName.toUpperCase() === "TEXTAREA" ||
        document.activeElement.nodeName.toUpperCase() === "INPUT")
    ) {
      isContentEditable.value = true;
      console.log("Content editable");
    } else {
      isContentEditable.value = false;
      console.log("Not content editable");
    }

    showMainCard.value = true;
  }
});

function handleMainCardClose() {
  showMainCard.value = false;
}
</script>

<style scoped></style>
