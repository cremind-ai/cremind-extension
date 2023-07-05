<template>
  <GrammarCard
    :selectedText="selectedText"
    :top="top"
    :left="left"
    :show="showGrammarCard"
    @close="handleGrammarCardClose"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { GrammarCard } from "../components";

const selectedText = ref("");
const top = ref("");
const left = ref("");
const showGrammarCard = ref(false);

document.addEventListener("mouseup", function (event: MouseEvent) {
  const selection = window.getSelection()?.toString().trim();
  if (selection && !showGrammarCard.value) {
    selectedText.value = selection;
    top.value = `${event.clientY}px`;
    left.value = `${event.clientX}px`;
    showGrammarCard.value = true;
  }
});

function handleGrammarCardClose() {
  showGrammarCard.value = false;
}
</script>

<style scoped></style>
