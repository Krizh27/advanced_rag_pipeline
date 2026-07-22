import { playResultSequence } from './animations.js';

export class UI {
    constructor(timelineModule, svgFlowModule) {
        this.timeline = timelineModule;
        this.svgFlow = svgFlowModule;
        
        this.elements = {
            form: document.getElementById("ask-form"),
            input: document.getElementById("question-input"),
            emptyState: document.getElementById("empty-state"),
            searchContainer: document.getElementById("search-container"),
            resultsArea: document.getElementById("results-area"),
            answerContent: document.getElementById("answer-content"),
            loadingIndicator: document.getElementById("loading-indicator"),
            classificationBadge: document.getElementById("classification-badge"),
            statsBar: document.getElementById("stats-bar"),
            statChunks: document.getElementById("stat-chunks"),
            statLessons: document.getElementById("stat-lessons"),
            statTime: document.getElementById("stat-time"),
            statConfidence: document.getElementById("stat-confidence"),
            recentQuestionsContainer: document.getElementById("recent-questions")
        };
        
        this.recentQuestions = [];
        this.bindEvents();
    }

    bindEvents() {
        // Form submission
        this.elements.form.addEventListener("submit", (e) => this.handleSubmit(e));
        
        // Examples
        document.querySelectorAll(".example-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                this.elements.input.value = btn.textContent.trim();
                this.elements.form.dispatchEvent(new Event("submit"));
            });
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        const question = this.elements.input.value.trim();
        if (!question) return;

        this.prepareLoadingUI(question);

        const startTime = performance.now();

        try {
            const token = await window.Clerk.session?.getToken();
            
            const response = await fetch("/ask", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ question })
            });

            if (!response.ok) throw new Error("Failed to fetch response");

            const data = await response.json();
            const responseTimeMs = (performance.now() - startTime).toFixed(0);
            
            this.handleSuccess(question, data, responseTimeMs);

        } catch (error) {
            this.handleError(error);
        }
    }

    prepareLoadingUI(question) {
        this.elements.emptyState.style.display = "none";
        this.elements.searchContainer.classList.add("results-active");
        this.elements.resultsArea.style.display = "grid";
        
        // Hide previous
        this.elements.answerContent.style.display = "none";
        this.elements.statsBar.style.display = "none";
        this.elements.classificationBadge.style.display = "none";
        this.timeline.clear();
        
        // Show loaders
        this.elements.loadingIndicator.style.display = "block";
        this.svgFlow.initWaitingState();
        this.svgFlow.glowNode('question');
        
        this.addRecentQuestion(question);
        this.elements.input.blur();
    }

    handleSuccess(question, data, responseTimeMs) {
        // Format timestamps in text to YouTube style with chips
        let formattedAnswer = data.answer.replace(/(\d{2}):(\d{2}):(\d{2}),\d{3}/g, (match, h, m, s) => {
            let time = h === "00" ? `${parseInt(m, 10)}:${s}` : `${parseInt(h, 10)}:${m}:${s}`;
            return `<span class="timestamp-chip"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px; margin-top: -2px;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>${time}</span>`;
        });

        // Parse Answer
        this.elements.answerContent.innerHTML = "";
        const sections = this.parseLLMResponse(formattedAnswer);
        if (sections.length === 0) {
            this.elements.answerContent.innerHTML = `<p>${formattedAnswer}</p>`;
        } else {
            sections.forEach(sec => {
                const div = document.createElement("div");
                div.className = "answer-section";
                if (sec.header) div.innerHTML += `<h3>${sec.header}</h3>`;
                let contentHTML = sec.content.replace(/```([\s\S]*?)```/g, "<code>$1</code>");
                div.innerHTML += `<p>${contentHTML}</p>`;
                this.elements.answerContent.appendChild(div);
            });
        }

        const chunksArray = data.chunks || [];
        const lessonsArray = (data.lesson && data.lesson !== "None") ? data.lesson.split(",").map(s => s.trim()) : [];
        
        // Play the animation sequence
        playResultSequence(this.elements, data, chunksArray, lessonsArray, responseTimeMs, this.timeline, this.svgFlow);
    }

    handleError(error) {
        this.elements.loadingIndicator.style.display = "none";
        this.elements.answerContent.style.display = "block";
        this.elements.answerContent.innerHTML = `<div class="error-message" style="color: var(--error-text); padding: 1rem; background: var(--error-bg); border-radius: var(--radius-sm);">Error: ${error.message}</div>`;
    }

    addRecentQuestion(q) {
        if (!this.recentQuestions.includes(q)) {
            this.recentQuestions.unshift(q);
            if (this.recentQuestions.length > 5) this.recentQuestions.pop();
        }
        this.elements.recentQuestionsContainer.innerHTML = "";
        this.recentQuestions.forEach(rq => {
            const pill = document.createElement("button");
            pill.className = "recent-pill";
            pill.textContent = rq;
            pill.addEventListener("click", () => {
                this.elements.input.value = rq;
                this.elements.form.dispatchEvent(new Event("submit"));
            });
            this.elements.recentQuestionsContainer.appendChild(pill);
        });
    }

    parseLLMResponse(text) {
        const headers = ["General Explanation", "According to the Course", "Lesson", "Relevant Timestamp(s)"];
        const sections = [];
        let currentHeader = null;
        let currentContent = [];

        const lines = text.split("\\n");
        for (let line of lines) {
            const cleanLine = line.trim();
            if (headers.includes(cleanLine)) {
                if (currentHeader !== null || currentContent.length > 0) {
                    sections.push({ header: currentHeader, content: currentContent.join("\\n").trim() });
                }
                currentHeader = cleanLine;
                currentContent = [];
            } else {
                if (cleanLine || currentContent.length > 0) {
                    currentContent.push(line);
                }
            }
        }

        if (currentHeader !== null || currentContent.length > 0) {
            sections.push({ header: currentHeader, content: currentContent.join("\\n").trim() });
        }
        return sections;
    }
}
