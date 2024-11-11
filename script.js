const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
let currentImage = null;
let texts = [];
let selectedText = null;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let history = [];
let historyIndex = -1;
const maxHistory = 20;

canvas.width = 3840;
canvas.height = 2160;

function resizeCanvas() {
    const previewArea = document.querySelector('.preview-area');
    const containerWidth = previewArea.clientWidth;
    const containerHeight = previewArea.clientHeight;

    if (currentImage) {
        const imgAspectRatio = currentImage.width / currentImage.height;
        const containerAspectRatio = containerWidth / containerHeight;

        let newWidth, newHeight;

        if (imgAspectRatio > containerAspectRatio) {
            newWidth = containerWidth;
            newHeight = containerWidth / imgAspectRatio;
        } else {
            newHeight = containerHeight;
            newWidth = containerHeight * imgAspectRatio;
        }

        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
    }

    drawCanvas();
}

window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    handleDragStart(x, y);
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    handleDragMove(x, y);
});

canvas.addEventListener('mouseup', handleDragEnd);
canvas.addEventListener('mouseleave', handleDragEnd);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    handleDragStart(x, y);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    handleDragMove(x, y);
});

canvas.addEventListener('touchend', handleDragEnd);

function handleDragStart(x, y) {
    texts.forEach(text => {
        const lines = text.content.split('\n');
        const lineHeight = text.fontSize * text.lineHeight;
        const totalHeight = lines.length * lineHeight;

        ctx.font = `${text.fontSize}px ${text.fontFamily}`;
        ctx.textAlign = text.textAlign;
        const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width));

        if (Math.abs(x - text.x) < maxWidth / 2 && Math.abs(y - text.y) < totalHeight / 2) {
            selectedText = text;
            isDragging = true;
            dragStartX = x - text.x;
            dragStartY = y - text.y;
            updateControlsFromText(text);
        }
    });
}

function handleDragMove(x, y) {
    if (isDragging && selectedText) {
        selectedText.x = x - dragStartX;
        selectedText.y = y - dragStartY;
        drawCanvas();
    }
}

function handleDragEnd() {
    if (isDragging) {
        isDragging = false;
        saveState();
    }
}

function switchTab(tab) {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const activeButton = document.querySelector(`.tab-button[onclick="switchTab('${tab}')"]`);
    const activeContent = document.getElementById(`${tab}Tab`);

    activeButton.classList.add('active');
    activeContent.classList.add('active');
}

function updateTextImmediately() {
    if (selectedText) {
        selectedText.content = document.getElementById('textInput').value;
        drawCanvas();
        saveState();
    }
}

function updateText() {
    if (selectedText) {
        selectedText.fontSize = parseInt(document.getElementById('fontSize').value);
        selectedText.lineHeight = parseFloat(document.getElementById('lineHeight').value);
        selectedText.fontFamily = document.getElementById('fontFamily').value;
        selectedText.color = document.getElementById('textColor').value;
        selectedText.outlineColor = document.getElementById('outlineColor').value;
        selectedText.outlineWidth = parseInt(document.getElementById('outlineWidth').value);
        selectedText.shadowBlur = parseInt(document.getElementById('shadowBlur').value);
        selectedText.shadowColor = document.getElementById('shadowColor').value;
        selectedText.shadowOffset = parseInt(document.getElementById('shadowOffset').value);

        document.getElementById('fontSizeValue').textContent = `${selectedText.fontSize}px`;
        document.getElementById('lineHeightValue').textContent = selectedText.lineHeight;
        document.getElementById('outlineWidthValue').textContent = `${selectedText.outlineWidth}px`;
        document.getElementById('shadowBlurValue').textContent = `${selectedText.shadowBlur}px`;
        document.getElementById('shadowOffsetValue').textContent = `${selectedText.shadowOffset}px`;

        drawCanvas();
        saveState();
    }
}

function updateTextRotation() {
    if (selectedText) {
        selectedText.rotation = parseInt(document.getElementById('rotation').value);
        document.getElementById('rotationValue').textContent = `${selectedText.rotation}°`;
        drawCanvas();
        saveState();
    }
}

function rotateText(degrees) {
    if (selectedText) {
        const currentRotation = parseInt(document.getElementById('rotation').value);
        const newRotation = currentRotation + degrees;
        const normalizedRotation = ((newRotation + 180) % 360) - 180;

        document.getElementById('rotation').value = normalizedRotation;
        updateTextRotation();
    }
}

function addText() {
    const text = {
        content: document.getElementById('textInput').value,
        x: canvas.width / 2,
        y: canvas.height / 2,
        fontSize: 24,
        lineHeight: 1.5,
        color: '#000000',
        outlineColor: '#ffffff',
        outlineWidth: 2,
        rotation: 0,
        fontFamily: "'Noto Nastaliq Urdu', serif",
        textAlign: 'center',
        shadowBlur: 4,
        shadowColor: '#000000',
        shadowOffset: 2
    };
    texts.push(text);
    selectedText = text;
    updateControlsFromText(text);
    drawCanvas();
    saveState();
}

function updateControlsFromText(text) {
    document.getElementById('textInput').value = text.content;
    document.getElementById('fontSize').value = text.fontSize;
    document.getElementById('fontSizeValue').textContent = `${text.fontSize}px`;
    document.getElementById('lineHeight').value = text.lineHeight;
    document.getElementById('lineHeightValue').textContent = text.lineHeight;
    document.getElementById('rotation').value = text.rotation;
    document.getElementById('rotationValue').textContent = `${text.rotation}°`;
    document.getElementById('fontFamily').value = text.fontFamily;
    document.getElementById('textColor').value = text.color;
    document.getElementById('outlineColor').value = text.outlineColor;
    document.getElementById('outlineWidth').value = text.outlineWidth;
    document.getElementById('outlineWidthValue').textContent = `${text.outlineWidth}px`;
    document.getElementById('shadowBlur').value = text.shadowBlur;
    document.getElementById('shadowBlurValue').textContent = `${text.shadowBlur}px`;
    document.getElementById('shadowColor').value = text.shadowColor;
    document.getElementById('shadowOffset').value = text.shadowOffset;
    document.getElementById('shadowOffsetValue').textContent = `${text.shadowOffset}px`;
}

function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentImage) {
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    }

    texts.forEach(text => {
        ctx.save();
        ctx.translate(text.x, text.y);
        ctx.rotate(text.rotation * Math.PI / 180);

        ctx.font = `${text.fontSize}px ${text.fontFamily}`;
        ctx.textAlign = text.textAlign;
        ctx.textBaseline = 'middle';

        if (text.shadowBlur > 0) {
            ctx.shadowBlur = text.shadowBlur;
            ctx.shadowColor = text.shadowColor;
            ctx.shadowOffsetX = text.shadowOffset;
            ctx.shadowOffsetY = text.shadowOffset;
        }

        const lines = text.content.split('\n');
        const lineHeight = text.fontSize * text.lineHeight;
        const totalHeight = (lines.length - 1) * lineHeight;

        lines.forEach((line, index) => {
            const y = index * lineHeight - totalHeight / 2;

            if (text.outlineWidth > 0) {
                ctx.strokeStyle = text.outlineColor;
                ctx.lineWidth = text.outlineWidth * 2;
                ctx.lineJoin = 'round';
                ctx.strokeText(line, 0, y);
            }

            ctx.fillStyle = text.color;
            ctx.fillText(line, 0, y);
        });

        ctx.restore();
    });

    const watermarkFontSize = Math.max(16, canvas.width / 50);
    ctx.save();
    ctx.font = `${watermarkFontSize}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Created with: urduonpictures.blogspot.com/', canvas.width / 2, canvas.height - 15);
    ctx.restore();
}

function loadImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                currentImage = img;
                resizeCanvas();
                saveState();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function saveImage() {
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
}

function saveState() {
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    history.push(JSON.stringify({ texts: texts }));
    if (history.length > maxHistory) {
        history.shift();
    }
    historyIndex = history.length - 1;
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        const state = JSON.parse(history[historyIndex]);
        texts = state.texts;
        if (selectedText) {
            selectedText = texts.find(t => t.content === selectedText.content) || texts[texts.length - 1];
            if (selectedText) {
                updateControlsFromText(selectedText);
            }
        }
        drawCanvas();
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        const state = JSON.parse(history[historyIndex]);
        texts = state.texts;
        if (selectedText) {
            selectedText = texts.find(t => t.content === selectedText.content) || texts[texts.length - 1];
            if (selectedText) {
                updateControlsFromText(selectedText);
            }
        }
        drawCanvas();
    }
}

function deleteText() {
    if (selectedText) {
        texts = texts.filter(text => text !== selectedText);
        selectedText = null;
        drawCanvas();
        saveState();
    }
}

saveState();