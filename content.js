chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.action === 'initiateAction' && !isSelecting){
        imgURL = message.imgURL;
        console.log(imgURL);
        initAction();
    }
});

let imgURL = null;
let startX, startY;
let selectionCoordinates = null;
let isSelecting = false

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

const endSelection = (event) => {
    selectionCoordinates = selection.getBoundingClientRect();
    overlay.removeEventListener('mousedown', startSelection);
    overlay.removeEventListener('mousemove', updateSelection);
    overlay.removeEventListener('mouseup', endSelection);
    document.body.removeChild(overlay);
    document.body.removeChild(selection);
}