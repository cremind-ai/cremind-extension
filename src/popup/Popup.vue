<template>
  <div class="popupview">Hello World!</div>
</template>

<script setup lang="ts"></script>

<style scoped>
.popupview {
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
