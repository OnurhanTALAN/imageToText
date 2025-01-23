chrome.commands.onCommand.addListener((command) => {
    if(command === "capture-region"){
        chrome.tabs.query({ active : true, currentWindow : true}, (tabs) => {
            const activeTab = tabs[0];
            chrome.tabs.captureVisibleTab(activeTab.windowId, { format : 'png' }, (imgURL) => {
                chrome.tabs.sendMessage(activeTab.id, { action : 'initiateAction', imgURL : imgURL });
            })
        })
    }
});

