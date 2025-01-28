let totalTime = 0;
let breakInterval = 60; // Default to 60 if not set

chrome.storage.sync.get('breakInterval', (data) => {
    if (data.breakInterval) {
        breakInterval = data.breakInterval;
    }
});

chrome.alarms.create('activityAlarm', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'activityAlarm') {
        totalTime += 1;
        if (totalTime >= breakInterval) {
            totalTime = 0;
            sendBreakNotification();
        }
    }
});

function sendBreakNotification() {
    getRandomSuggestion().then(suggestion => {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Time for a Break',
            message: suggestion,
            buttons: [{ title: 'Snooze for 10 minutes' }]
        }, (notificationId) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            } else {
                console.log('Notification created with ID:', notificationId);
            }
        });
    }).catch(error => {
        console.error('Error fetching suggestion:', error);
    });
}

function getRandomSuggestion() {
    return fetch(chrome.runtime.getURL('activities.json'))
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const suggestions = data.activities;
            if (!suggestions || suggestions.length === 0) {
                throw new Error('No suggestions found');
            }
            return suggestions[Math.floor(Math.random() * suggestions.length)];
        })
        .catch(error => {
            console.error('Error fetching activities:', error);
            throw error;
        });
}

chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
    if (btnIdx === 0) {
        // Snooze for 10 minutes
        totalTime = breakInterval - 10;
        chrome.alarms.create('snoozeAlarm', { delayInMinutes: 10 });
    }
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'snoozeAlarm') {
        sendBreakNotification();
    } else if (alarm.name === 'activityAlarm') {
        totalTime += 1;
        if (totalTime >= breakInterval) {
            totalTime = 0;
            sendBreakNotification();
        }
    }
});