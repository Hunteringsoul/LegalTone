// --- DOM Elements ---
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const textInput = document.getElementById('textInput');
const resultsSection = document.getElementById('resultsSection');
const loading = document.getElementById('loading');
const analyzeButton = document.querySelector('.analyze-button');

// --- Scroll Reveal Animation ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

// --- Enhanced Parallax Scroll ---
let ticking = false;
function updateScrollEffects() {
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = window.pageYOffset * -0.3;
        hero.style.transform = `translateY(${rate}px)`;
    }
    ticking = false;
}
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
    }
});

// --- Drag and Drop File Upload ---
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
    }
});

uploadArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        textInput.value = e.target.result;
        uploadArea.innerHTML = `
            <div class="upload-icon" style="animation: bounceIn 0.8s ease;">✅</div>
            <div class="upload-text" style="color: #4CAF50;">File uploaded: ${file.name}</div>
        `;
        uploadArea.style.borderColor = '#4CAF50';
        uploadArea.style.background = 'linear-gradient(135deg, #1a2e1a, #2a4a2a)';
        textInput.style.animation = 'pulse 1s ease';
        setTimeout(() => (textInput.style.animation = ''), 1000);
    };
    reader.readAsText(file);
}

// --- Analyze Document ---
async function analyzeDocument() {
    const inputText = textInput.value.trim();
    if (!inputText) {
        textInput.style.animation = 'shake 0.5s ease';
        textInput.style.borderColor = '#ff4444';
        setTimeout(() => {
            textInput.style.animation = '';
            textInput.style.borderColor = '#555555';
        }, 500);
        showAnimatedAlert('Please provide text to analyze');
        return;
    }

    analyzeButton.style.transform = 'scale(0.95)';
    analyzeButton.style.opacity = '0.7';
    loading.classList.add('show');
    resultsSection.classList.remove('show');

    try {
        const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: inputText })
        });
        const data = await res.json();
        loading.classList.remove('show');

        if (data.error) {
            alert('Error: ' + data.error);
            return;
        }

        displayResults(data);
        resultsSection.classList.add('show');
        setTimeout(() => resultsSection.scrollIntoView({ behavior: 'smooth' }), 300);
        analyzeButton.style.transform = '';
        analyzeButton.style.opacity = '';
    } catch (err) {
        loading.classList.remove('show');
        alert('Failed to analyze document.');
    }
}

// --- Display Results ---
function displayResults(data) {
    const elements = {
        toneBadge: document.getElementById('toneBadge'),
        confidenceScore: document.getElementById('confidenceScore'),
        primaryTone: document.getElementById('primaryTone'),
        toneDistribution: document.getElementById('toneDistribution'),
        keyIndicators: document.getElementById('keyIndicators'),
        recommendations: document.getElementById('recommendations')
    };

    const analysis = generateMockAnalysis(data.sentiment);  // You can replace this with real metrics if available

    elements.toneBadge.textContent = analysis.tone.name;
    elements.toneBadge.className = `tone-badge ${analysis.tone.class}`;
    elements.confidenceScore.textContent = `${analysis.tone.confidence}%`;
    elements.primaryTone.textContent = analysis.primaryTone;
    elements.toneDistribution.textContent = analysis.toneDistribution;
    elements.keyIndicators.textContent = analysis.keyIndicators;
    elements.recommendations.textContent = analysis.recommendations;

    typewriterEffect(elements.primaryTone, analysis.primaryTone);
}

// --- Generate Mock Analysis (for now) ---
function generateMockAnalysis(toneText) {
    const tones = {
        Positive: { name: 'Positive', class: 'tone-positive', confidence: 92 },
        Negative: { name: 'Negative', class: 'tone-negative', confidence: 85 },
        Neutral: { name: 'Neutral', class: 'tone-neutral', confidence: 88 }
    };
    const fallback = { name: toneText, class: 'tone-unknown', confidence: 50 };
    const selected = tones[toneText] || fallback;

    return {
        tone: selected,
        primaryTone: `The document exhibits a "${toneText}" tone.`,
        toneDistribution: `${toneText}: ${selected.confidence}% | Neutral: ${100 - selected.confidence}%`,
        keyIndicators: 'Legal terminology, sentence structure, formality level.',
        recommendations: 'Ensure consistency in tone across sections of the document.'
    };
}

// --- Typewriter Effect ---
function typewriterEffect(element, text) {
    element.textContent = '';
    let i = 0;
    const timer = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i++);
        } else {
            clearInterval(timer);
        }
    }, 20);
}

// --- Animated Alert ---
function showAnimatedAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.textContent = message;
    alertDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: linear-gradient(135deg, #ff4444, #cc0000);
        color: white; padding: 1rem 2rem; border-radius: 10px;
        font-family: 'Playfair Display', serif; font-weight: 600;
        box-shadow: 0 10px 30px rgba(255, 68, 68, 0.3);
        transform: translateX(400px); z-index: 10000;
        transition: all 0.5s ease;
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        alertDiv.style.transform = 'translateX(400px)';
        setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
}

// --- Smooth Scroll for Nav Links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// --- Cursor Trail Effect ---
document.addEventListener('mousemove', (e) => {
    let cursor = document.querySelector('.cursor');
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.className = 'cursor';
        cursor.style.cssText = `
            position: fixed; width: 20px; height: 20px;
            background: radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%);
            border-radius: 50%; pointer-events: none;
            z-index: 9999; mix-blend-mode: difference;
        `;
        document.body.appendChild(cursor);
    }
    cursor.style.left = `${e.clientX - 10}px`;
    cursor.style.top = `${e.clientY - 10}px`;
});

// --- Hover Cursor Pointer for Clickables ---
document.querySelectorAll('button, .upload-area, .feature-card, .detail-card').forEach(el => {
    el.addEventListener('mouseenter', () => el.style.cursor = 'pointer');
});

// --- Add Shake Animation Keyframe Dynamically ---
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);
