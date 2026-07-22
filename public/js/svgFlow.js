export class SvgFlow {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.svgNS = "http://www.w3.org/2000/svg";
        this.nodes = {};
        this.paths = [];
        this.isFlowing = false;
    }

    initWaitingState() {
        this.container.innerHTML = "";
        const svg = document.createElementNS(this.svgNS, "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "120px");
        svg.setAttribute("viewBox", "0 0 400 120");
        this.svg = svg;
        
        // Base waiting path (Question -> Retriever -> LLM)
        const path = document.createElementNS(this.svgNS, "path");
        path.setAttribute("d", "M 20 60 L 120 60 L 220 60 L 320 60");
        path.classList.add("flow-path");
        svg.appendChild(path);

        const pulse = document.createElementNS(this.svgNS, "path");
        pulse.setAttribute("d", "M 20 60 L 120 60 L 220 60 L 320 60");
        pulse.classList.add("flow-pulse", "waiting-pulse");
        svg.appendChild(pulse);

        // Draw nodes
        this.nodes.question = this.createNode(20, 60, "Question");
        this.nodes.retriever = this.createNode(120, 60, "Retriever");
        this.nodes.llm = this.createNode(220, 60, "LLM");
        this.nodes.answer = this.createNode(320, 60, "Answer");

        svg.appendChild(this.nodes.question.group);
        svg.appendChild(this.nodes.retriever.group);
        svg.appendChild(this.nodes.llm.group);
        svg.appendChild(this.nodes.answer.group);

        this.container.appendChild(svg);
        this.isFlowing = true;
    }

    createNode(x, y, labelText) {
        const group = document.createElementNS(this.svgNS, "g");
        group.classList.add("flow-node");

        const circle = document.createElementNS(this.svgNS, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", 6);
        
        const label = document.createElementNS(this.svgNS, "text");
        label.setAttribute("x", x);
        label.setAttribute("y", y + 20);
        label.setAttribute("text-anchor", "middle");
        label.textContent = labelText;

        group.appendChild(circle);
        group.appendChild(label);
        return { group, circle, label, x, y };
    }

    glowNode(nodeName) {
        if (this.nodes[nodeName]) {
            this.nodes[nodeName].circle.classList.add("glow");
        }
    }

    slowDownFlow() {
        const pulse = this.svg.querySelector(".waiting-pulse");
        if (pulse) {
            pulse.style.animationDuration = "3s";
            pulse.style.opacity = "0.3";
        }
    }

    drawBranches(numBranches) {
        // Redraw SVG with branches from Retriever to LLM based on chunks
        this.svg.innerHTML = "";
        
        // Define X coordinates
        const xQ = 20;
        const xR = 100;
        const xChunks = 200;
        const xL = 300;
        const xA = 380;
        const centerY = 60;

        // Draw Main trunk paths
        this.drawPath(xQ, centerY, xR, centerY);
        this.drawPath(xL, centerY, xA, centerY);

        // Draw dynamic branches
        const branchSpacing = 20;
        const totalHeight = (numBranches - 1) * branchSpacing;
        const startY = centerY - totalHeight / 2;

        for (let i = 0; i < numBranches; i++) {
            const currentY = startY + (i * branchSpacing);
            // Bezier from Retriever to Chunk
            this.drawBezier(xR, centerY, xChunks, currentY);
            // Bezier from Chunk to LLM
            this.drawBezier(xChunks, currentY, xL, centerY);
            
            // Draw chunk node
            const chunkGroup = this.createNode(xChunks, currentY, "");
            chunkGroup.circle.setAttribute("r", 4);
            chunkGroup.circle.classList.add("glow");
            this.svg.appendChild(chunkGroup.group);
        }

        // Re-append main nodes
        this.nodes.question = this.createNode(xQ, centerY, "Question");
        this.nodes.retriever = this.createNode(xR, centerY, "Retriever");
        this.nodes.llm = this.createNode(xL, centerY, "LLM");
        this.nodes.answer = this.createNode(xA, centerY, "Answer");

        this.svg.appendChild(this.nodes.question.group);
        this.svg.appendChild(this.nodes.retriever.group);
        this.svg.appendChild(this.nodes.llm.group);
        this.svg.appendChild(this.nodes.answer.group);

        this.glowNode('retriever');
        this.glowNode('llm');
        this.glowNode('answer');
    }

    drawPath(x1, y1, x2, y2) {
        const path = document.createElementNS(this.svgNS, "path");
        path.setAttribute("d", `M ${x1} ${y1} L ${x2} ${y2}`);
        path.classList.add("flow-path");
        this.svg.appendChild(path);
    }

    drawBezier(x1, y1, x2, y2) {
        const path = document.createElementNS(this.svgNS, "path");
        // Simple horizontal bezier
        const cp1x = x1 + (x2 - x1) / 2;
        path.setAttribute("d", `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp1x} ${y2}, ${x2} ${y2}`);
        path.classList.add("flow-path");
        this.svg.appendChild(path);
        
        // Add a pulse particle
        const pulse = document.createElementNS(this.svgNS, "path");
        pulse.setAttribute("d", `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp1x} ${y2}, ${x2} ${y2}`);
        pulse.classList.add("flow-pulse", "branch-pulse");
        pulse.style.animationDelay = `${Math.random() * 0.5}s`;
        this.svg.appendChild(pulse);
    }
}
