export function initTheme() {
    const themeBtn = document.getElementById("theme-toggle");
    
    // Initial check from localStorage or OS preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-theme');
        document.documentElement.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
        document.documentElement.classList.remove('dark-theme');
    }

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const isDark = document.body.classList.toggle("dark-theme");
            document.documentElement.classList.toggle("dark-theme", isDark);
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
    }
}
