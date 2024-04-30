document.getElementById('highlight-button').addEventListener('click', () => 
{
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {highlightAll()},
        });
    })
})

document.getElementById('show-button').addEventListener('click', () => 
{
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {showAll()},
        });
    })
})

document.getElementById('hide-button').addEventListener('click', () => 
{
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {clearAll()},
        });
    })
})