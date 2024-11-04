<template>
  <div class="cremend-container-getting-started">
    <iframe
      ref="myIframe"
      src="https://extensions.cremind.io/getting-started/"
      title="Getting Started"
      @load="resizeIframe"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";

const myIframe: Ref<HTMLIFrameElement> = ref(null as any);

const resizeIframe = () => {
  if (myIframe.value) {
    myIframe.value!.style.height =
      myIframe.value.contentWindow!.document.body.scrollHeight + "px";
  }
};
</script>

<style scoped>
.cremend-container-getting-started {
  flex: 1;
}
</style>
