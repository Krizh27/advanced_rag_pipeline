document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("ask-form");
    const input = document.getElementById("question-input");
    const resultsContainer = document.getElementById("results-container");
    const submitBtn = document.getElementById("submit-btn");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const question = input.value.trim();
        if (!question) return;

        // Clear placeholder if it's the first question
        const placeholder = document.querySelector(".placeholder-text");
        if (placeholder) placeholder.remove();

        // Add user question bubble
        appendQuestion(question);
        input.value = "";
        
        // Show loading state
        const loadingEl = appendLoading();
        submitBtn.disabled = true;

        try {
            const response = await fetch("/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question })
            });

            if (!response.ok) {
                throw new Error("Failed to fetch response");
            }

            const data = await response.json();
            
            // Remove loading
            loadingEl.remove();

            // Render answer card
            appendAnswer(data);
        } catch (error) {
            loadingEl.remove();
            appendError(error.message);
        } finally {
            submitBtn.disabled = false;
            // Scroll to bottom
            resultsContainer.scrollTop = resultsContainer.scrollHeight;
        }
    });

    function appendQuestion(text) {
        const div = document.createElement("div");
        div.className = "question-bubble";
        div.textContent = text;
        resultsContainer.appendChild(div);
    }

    function appendLoading() {
        const div = document.createElement("div");
        div.className = "loading";
        div.innerHTML = `<div class="spinner"></div> Generating answer...`;
        resultsContainer.appendChild(div);
        return div;
    }

    function appendError(msg) {
        const div = document.createElement("div");
        div.className = "error-message";
        div.textContent = `Error: ${msg}`;
        resultsContainer.appendChild(div);
    }

    function appendAnswer(data) {
        const card = document.createElement("div");
        card.className = "answer-card";

        // The LLM output is formatted with headers like "General Explanation", "According to the Course", etc.
        // Let's parse them out to style them nicely, or just render the text if parsing fails.
        const sections = parseLLMResponse(data.answer);

        if (sections.length === 0) {
            // Fallback if parsing fails
            const p = document.createElement("p");
            p.textContent = data.answer;
            card.appendChild(p);
        } else {
            sections.forEach(sec => {
                const secDiv = document.createElement("div");
                secDiv.className = "answer-section";
                
                if (sec.header) {
                    const h3 = document.createElement("h3");
                    h3.textContent = sec.header;
                    secDiv.appendChild(h3);
                }

                const p = document.createElement("p");
                p.textContent = sec.content;
                secDiv.appendChild(p);
                
                card.appendChild(secDiv);
            });
        }

        // Add metadata pills if available from backend
        if ((data.lesson && data.lesson !== "None") || (data.timestamps && data.timestamps.length > 0)) {
            const pillsDiv = document.createElement("div");
            pillsDiv.className = "metadata-pills";

            if (data.lesson && data.lesson !== "None") {
                const lessonPill = document.createElement("span");
                lessonPill.className = "pill";
                lessonPill.textContent = `Lesson: ${data.lesson}`;
                pillsDiv.appendChild(lessonPill);
            }

            if (data.timestamps && data.timestamps.length > 0) {
                data.timestamps.forEach(ts => {
                    const tsPill = document.createElement("span");
                    tsPill.className = "pill";
                    tsPill.textContent = `Time: ${ts}`;
                    pillsDiv.appendChild(tsPill);
                });
            }
            card.appendChild(pillsDiv);
        }

        resultsContainer.appendChild(card);
    }

    function parseLLMResponse(text) {
        const headers = ["General Explanation", "According to the Course", "Lesson", "Relevant Timestamp(s)"];
        const sections = [];
        let currentHeader = null;
        let currentContent = [];

        const lines = text.split("\n");
        for (let line of lines) {
            const cleanLine = line.trim();
            if (headers.includes(cleanLine)) {
                if (currentHeader !== null || currentContent.length > 0) {
                    sections.push({
                        header: currentHeader,
                        content: currentContent.join("\n").trim()
                    });
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
            sections.push({
                header: currentHeader,
                content: currentContent.join("\n").trim()
            });
        }

        // If it couldn't find headers, it will just return one section with null header
        return sections;
    }
});
