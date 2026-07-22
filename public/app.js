import { initTheme } from './js/theme.js';
import { Timeline } from './js/timeline.js';
import { SvgFlow } from './js/svgFlow.js';
import { UI } from './js/ui.js';

window.addEventListener("load", async () => {
    // 1. Initialize Theme (also handled inline in HTML to prevent flash)
    initTheme();

    // 2. Initialize Clerk and Auth UI
    await window.Clerk.load();

    const authSection = document.getElementById("auth-section");
    const mainContent = document.getElementById("main-content");

    if (window.Clerk.user) {
        authSection.style.display = "none";
        mainContent.style.display = "flex";
        window.Clerk.mountUserButton(document.getElementById("user-button"));
    } else {
        authSection.style.display = "flex";
        mainContent.style.display = "none";
        window.Clerk.mountSignIn(document.getElementById("auth-container"));
        return;
    }

    // 3. Initialize Modules
    const timeline = new Timeline("knowledge-trail-content");
    const svgFlow = new SvgFlow("svg-flow-container");
    const ui = new UI(timeline, svgFlow);
});
