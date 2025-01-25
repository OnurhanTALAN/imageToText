chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.action === 'initiateAction' && !isSelecting){
        imgURL = message.imgURL;
        initAction();
    }
});

let imgURL = null;
let startX, startY;
let selectionCoordinates = null;
let isSelecting = false, isOpen = false;

let overlay = null, selection = null;

const initAction = () => {
    overlay = document.createElement('div');
    overlay.id = 'screenshot-overlay'
    overlay.textContent = 'Select the area to extract the text'
    document.body.appendChild(overlay);

    selection = document.createElement('div');
    selection.id = 'screenshot-selection';
    document.body.appendChild(selection);

    overlay.addEventListener('mousedown', startSelection);
    overlay.addEventListener('mouseup', endSelection);
}

const startSelection = (event) => {
    startX = event.clientX;
    startY = event.clientY;
    isSelecting = true;

    overlay.textContent = '';
    selection.style.display = 'block';
    selection.style.left = startX + 'px';
    selection.style.top = startY + 'px';

    overlay.addEventListener('mousemove', updateSelection);
}

const updateSelection = (event) => {
    const currentX = event.clientX;
    const currentY = event.clientY;

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    selection.style.width = width + 'px';
    selection.style.height = height + 'px';
    selection.style.left = Math.min(currentX, startX) + 'px';
    selection.style.top = Math.min(currentY, startY) + 'px';
}

const endSelection = () => {
    selectionCoordinates = selection.getBoundingClientRect();
    isSelecting = false;
    overlay.removeEventListener('mousedown', startSelection);
    overlay.removeEventListener('mousemove', updateSelection);
    overlay.removeEventListener('mouseup', endSelection);
    document.body.removeChild(overlay);
    document.body.removeChild(selection);
    cropImg(imgURL, selectionCoordinates, (croppedImg) => {
        renderInlinePopup(croppedImg);
    });
}

const renderInlinePopup = (croppedImg) => {
    if(isOpen) { document.body.removeChild(document.getElementById("extension-popup")); }
    
    const clipboardSvg = chrome.runtime.getURL("icons/clipboard-text.svg");
    const closeSvg = chrome.runtime.getURL("icons/close.svg");

    const popupHTML = `
        <div id="extension-popup">
            <div class="popup-header">
                <button class="close-btn">
                    <img src="${closeSvg}" alt="close">
                </button>
            </div>
            <div class="popup-body">
                <div class="image-container">
                    <img src="${croppedImg}" alt="selected region">
                </div>
                <div class="text-container">
                    <div id="dot-spinner">
                        <div class="dot-spinner__dot"></div>
                        <div class="dot-spinner__dot"></div>
                        <div class="dot-spinner__dot"></div>
                        <div class="dot-spinner__dot"></div>
                        <div class="dot-spinner__dot"></div>
                        <div class="dot-spinner__dot"></div>
                        <div class="dot-spinner__dot"></div>
                        <div class="dot-spinner__dot"></div>
                    </div>
                </div>
            </div>
            <div class="popup-footer">
                <button class="copy-btn" disabled=true>
                    <img src="${clipboardSvg}" alt="copy text">
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    isOpen = true;
    const popup = document.getElementById("extension-popup");
    const closeBtn = popup.querySelector(".close-btn");
    const copyBtn = popup.querySelector(".copy-btn");
    const textContainer = popup.querySelector(".text-container");

    //TODO : using Tesseract.js extract the text from the image.
    //       update the text-container
    //       enable copyBtn


    closeBtn.addEventListener('click', () => {
        isOpen = false;
        document.body.removeChild(popup);
    });
}

const cropImg = (imgURL, crop, callback) => {
    const image = new Image();
    image.src = imgURL;

    image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = crop.width;
        canvas.height = crop.height;

        const widthRatio = image.width / window.innerWidth;
        const heightRatio = image.height / window.innerHeight;

        ctx.drawImage(
            image,
            crop.x * widthRatio,
            crop.y * heightRatio,
            crop.width * widthRatio,
            crop.height * heightRatio,
            0, 0, crop.width, crop.height
        );
        callback(canvas.toDataURL());
    }
}