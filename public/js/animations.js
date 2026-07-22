// Helper for simple number animation using rAF
export function animateValue(element, start, end, duration) {
    if (!element) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Orchestrates the 1.2s - 1.8s sequence
export function playResultSequence(uiElements, data, chunksArray, lessonsArray, responseTimeMs, timelineModule, svgFlowModule) {
    const {
        loadingIndicator, answerContent, statsBar, statChunks, 
        statLessons, statTime, statConfidence, classificationBadge
    } = uiElements;

    // Sequence timing variables (total roughly 1.5s)
    const T_FLOW_SLOWDOWN = 300;
    const T_LLM_GLOW = 600;
    const T_BRANCHES = 900;
    const T_ANSWER = 1300;

    // 1. Instantly transition SVG flow to "slow/resolved" state
    setTimeout(() => {
        svgFlowModule.slowDownFlow();
        svgFlowModule.glowNode('retriever');
    }, T_FLOW_SLOWDOWN);

    setTimeout(() => {
        svgFlowModule.glowNode('llm');
    }, T_LLM_GLOW);

    // 2. Draw branches & render timeline cards one by one
    setTimeout(() => {
        // Redraw SVG with actual branches based on chunks
        svgFlowModule.drawBranches(chunksArray.length || lessonsArray.length || 1);
        
        // Render timeline
        timelineModule.renderKnowledgeTrail(chunksArray, lessonsArray, data.timestamps || []);
    }, T_BRANCHES);

    // 3. Fade in Answer & Stats
    setTimeout(() => {
        loadingIndicator.style.display = "none";
        
        // Setup stats logic (derive confidence etc)
        setupStats(uiElements, data, chunksArray, lessonsArray, responseTimeMs);
        
        // Reveal Answer Content
        answerContent.style.opacity = "0";
        answerContent.style.display = "block";
        statsBar.style.display = "flex";
        
        // Fade in via CSS
        requestAnimationFrame(() => {
            answerContent.style.transition = "opacity 0.4s ease";
            answerContent.style.opacity = "1";
        });
        
    }, T_ANSWER);
}

function setupStats(uiElements, data, chunksArray, lessonsArray, responseTimeMs) {
    let confidence = "Medium";
    let classification = "Broad Query";
    const isOutOfScope = data.answer.includes("The course does not discuss this topic");
    
    if (isOutOfScope) {
        confidence = "Low";
        classification = "Out of Scope";
    } else if (lessonsArray.length === 1) {
        confidence = "High";
        classification = "Exact Match";
    } else if (lessonsArray.length > 1) {
        confidence = "High";
        classification = "Cross Lesson";
    }

    uiElements.classificationBadge.style.display = "inline-block";
    uiElements.classificationBadge.textContent = classification;
    uiElements.statConfidence.textContent = confidence;
    uiElements.statConfidence.className = `stat-badge ${confidence.toLowerCase()}`;
    uiElements.statTime.textContent = `${responseTimeMs}ms`;

    animateValue(uiElements.statChunks, 0, chunksArray.length || (data.timestamps || []).length, 600);
    animateValue(uiElements.statLessons, 0, lessonsArray.length, 600);
}
