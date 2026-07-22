export class Timeline {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    clear() {
        this.container.innerHTML = "";
    }

    renderKnowledgeTrail(chunks, fallbackLessons, fallbackTimestamps) {
        this.clear();
        let delay = 0;

        if (chunks.length > 0) {
            chunks.forEach((chunk) => {
                const title = this.formatLessonName(chunk.lesson);
                const meta = `${chunk.start} - ${chunk.end}`;
                this.appendRichTrailNode(title, meta, chunk.text, delay);
                delay += 100;
            });
        } else if (fallbackLessons.length > 0) {
            fallbackLessons.forEach((lesson, index) => {
                const ts = fallbackTimestamps[index] || "Various timestamps";
                this.appendRichTrailNode(this.formatLessonName(lesson), ts, "No chunk text available.", delay);
                delay += 100;
            });
        }
    }

    appendRichTrailNode(title, meta, text, delay = 0) {
        const node = document.createElement("div");
        node.className = "trail-node rich-node";
        node.style.animationDelay = `${delay}ms`;
        
        const words = text.split(" ");
        const truncatedText = words.length > 60 ? words.slice(0, 60).join(" ") + "..." : text;

        const contentHTML = `
            <div class="trail-icon">
                <div class="trail-dot"></div>
                <div class="trail-line"></div>
            </div>
            <div class="trail-content rich-content">
                <div class="rich-card-header">
                    <div class="rich-thumbnail">
                        <img src="assets/thumbnail.jpg" alt="Thumbnail" class="thumbnail-img" onerror="this.src='assets/course-placeholder.svg'">
                        <div class="play-overlay">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                    </div>
                    <div class="rich-header-text">
                        <div class="trail-title">${title}</div>
                        <div class="trail-meta">Expo Mobile Dev Module</div>
                        <div class="trail-timestamp">${meta} <svg class="expand-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></div>
                    </div>
                </div>
                <div class="trail-details">
                    <p class="chunk-text">${truncatedText}</p>
                </div>
            </div>
        `;
        node.innerHTML = contentHTML;

        const contentDiv = node.querySelector('.trail-content');
        contentDiv.addEventListener('click', () => {
            const isExpanded = contentDiv.classList.toggle('expanded');
            node.classList.toggle('active', isExpanded);
        });

        this.container.appendChild(node);
    }

    formatLessonName(filename) {
        return filename.replace(/_epm\.srt$/, "").replace(/_/g, " ").replace(/-/g, " ").replace(/^\d+\s*/, "");
    }
}
