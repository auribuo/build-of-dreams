import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { i18n } from "./i18n/plugin";

window.alert("This is very work in progress so expect stuff to be broken and ugly. It should be usable at least");
createApp(App).use(i18n).mount("#app");
