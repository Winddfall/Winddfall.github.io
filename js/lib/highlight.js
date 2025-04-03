mixins.highlight = {
    data() {
        return { copying: false };
    },
    created() {
        hljs.configure({ 
            ignoreUnescapedHTML: false,
            languages: ['javascript', 'python', 'html', 'css', 'json','c','cpp'] 
        });
        this.renderers.push(this.highlight);
    },
    methods: {
        sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        },
        async highlight() {
            await this.$nextTick(); // Wait for DOM update if using Vue
            let codes = document.querySelectorAll("pre");
            
            for (let i of codes) {
                let code = i.textContent;
                let language = [...i.classList, ...(i.firstChild?.classList || [])]
                    .find(c => c.startsWith('language-'))?.replace('language-', '') || 'plaintext';
                
                let highlighted;
                try {
                    highlighted = hljs.highlight(code, { language }).value;
                } catch (e) {
                    console.warn(`Failed to highlight as ${language}:`, e);
                    highlighted = hljs.highlightAuto(code).value;
                }
                
                i.innerHTML = `
                <div class="code-content hljs">${highlighted}</div>
                <div class="language">${language}</div>
                <div class="copycode">
                    <i class="fa-solid fa-copy fa-fw"></i>
                    <i class="fa-solid fa-check fa-fw"></i>
                </div>
                `;
                
                let content = i.querySelector(".code-content");
                if (hljs.lineNumbersBlock) {
                    hljs.lineNumbersBlock(content, { singleLine: true });
                }
                
                let copycode = i.querySelector(".copycode");
                copycode.addEventListener("click", async () => {
                    if (this.copying) return;
                    this.copying = true;
                    copycode.classList.add("copied");
                    await navigator.clipboard.writeText(code);
                    await this.sleep(1000);
                    copycode.classList.remove("copied");
                    this.copying = false;
                });
            }
        },
    },
};