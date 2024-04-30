//import "./node_modules/tabulator-tables/dist/js/tabulator.js";
//import { createSearchObjectsTable } from "./scripts/search-objects-table.js"

var settingsJSON = undefined;
var styleElement = document.createElement('style');
document.head.appendChild(styleElement);

const defaultSettings = JSON.parse(`{
    "highlightType": "underline",
    "lineWidth": "2",
    "opacity": "0.5"
}`);


async function saveOptions()
{
    chrome.storage.local.set(
        { settingsJSON: settingsJSON },
        () =>
        {
            const status = document.getElementById('status');
        }
    );
}

function saveTextOptions()
{
    settingsJSON = JSON.parse(document.getElementById("settingsJSON").value);
    saveOptions().then(() => { reloadOptions(); });
}

function reloadOptions()
{
    fillOptions();
    fillTextarea();

    function fillOptions()
    {
        document.getElementById('line-width-input').value = settingsJSON.lineWidth;
        document.getElementById('opacity-percent-input').value = Math.round(settingsJSON.opacity * 100);

        document.getElementById('highlight-type-select').replaceChildren();
        ['background', 'underline'].forEach((highlightType) =>
        {
            var option = document.createElement("sl-option");
            option.value = highlightType;
            option.innerText = highlightType;
            document.getElementById('highlight-type-select').appendChild(option);
        });
        document.getElementById('highlight-type-select').value = settingsJSON.highlightType;

    }

    function fillTextarea()
    {
        document.getElementById('settingsJSON').value = JSON.stringify(settingsJSON, null, 2);
    }
}

function restoreOptions()
{
    chrome.storage.local.get("settingsJSON").then((result) =>
    {
        settingsJSON = result.settingsJSON;
        reloadOptions();
    });
}

function resetStorage()
{
    chrome.storage.local.clear();
    chrome.storage.local.set({ settingsJSON: defaultSettings });
    window.location.reload();
}

function selectHighlightType()
{
    settingsJSON.highlightType = document.getElementById('highlight-type-select').value;
    saveOptions().then(() => { reloadOptions(); });
}

function trackLineWidth()
{
    settingsJSON.lineWidth = document.getElementById('line-width-input').value;
    saveOptions().then(() => { reloadOptions(); });
}

function trackOpacity()
{
    settingsJSON.opacity = document.getElementById('opacity-percent-input').value / 100;
    saveOptions().then(() => { reloadOptions(); });
}

document.addEventListener('DOMContentLoaded', restoreOptions);

document.getElementById('line-width-input').addEventListener('input', trackLineWidth);
document.getElementById('opacity-percent-input').addEventListener('input', trackOpacity);
document.getElementById('highlight-type-select').addEventListener('sl-change', selectHighlightType);

document.getElementById('save-text-button').addEventListener('click', saveTextOptions);
document.getElementById('reset-button').addEventListener('click', resetStorage);
