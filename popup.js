document.getElementById('saveBtn').addEventListener('click', () => {
    const interval = parseInt(document.getElementById('interval').value);
    if (interval && interval > 0) {
        chrome.storage.sync.set({ breakInterval: interval }, () => {
            alert('Settings saved!');
        });
    }
});

// Load saved settings
chrome.storage.sync.get('breakInterval', (data) => {
    if (data.breakInterval) {
        document.getElementById('interval').value = data.breakInterval;
    }
});