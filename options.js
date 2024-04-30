import "./node_modules/tabulator-tables/dist/js/tabulator.js";
import { createSearchObjectsTable } from "./scripts/search-objects-table.js"

var searchObjectsTable = undefined;
var settingsJSON = undefined;
var styleElement = document.createElement('style');
document.head.appendChild(styleElement);

const defaultSettings = JSON.parse(`{
    "currentObjectGroup": "0",
    "highlightType": "underline",
    "lineWidth": "2",
    "opacity": "0.5",
    "cjkFont": "Yu_Gothic_Light",
    "searchObjectGroups": 
    [
        {
            "name": "first",
            "objects":
            [
                {
                "aliases": ["綾小路清隆", "綾小路", "清隆"],
                "color": "#AFE1AF",
                "description": "character 0"
                },
                {
                "aliases": ["堀北鈴音", "堀北", "鈴音"],
                "color": "#FF5733",
                "description": "character 1"
                },
                {
                "aliases": ["櫛田桔梗", "櫛田", "桔梗"],
                "color": "#00FFFF",
                "description": "character 2"
                }
            ]
        },
        {
            "name": "second",
            "objects": 
            [
                {
                "aliases": ["須藤健", "須藤", "健"],
                "color": "#DFFF00",
                "description": "character 3"
                },
                {
                "aliases": ["軽井沢恵", "軽井沢", "恵"],
                "color": "#DF00FF",
                "description": "character 4"
                }
            ]
        }
    ]
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

function saveTableOptions()
{
    settingsJSON.searchObjectGroups[settingsJSON.currentObjectGroup].objects = searchObjectsTable.getData();
    saveOptions().then(() => { reloadOptions(); });
}

function selectObjectGroup()
{
    settingsJSON.currentObjectGroup = document.getElementById('search-object-groups-select').value;
    saveOptions().then(() => { reloadOptions(); });
}

function newObjectGroup()
{
    settingsJSON.currentObjectGroup = (settingsJSON.searchObjectGroups.push({ "name": "newGroup", "objects": [] }) - 1).toString();
    saveOptions().then(() => { reloadOptions(); });
}

function deleteObjectGroup()
{
    settingsJSON.searchObjectGroups.splice(settingsJSON.currentObjectGroup, 1);
    settingsJSON.currentObjectGroup = "0";
    saveOptions().then(() => { reloadOptions(); });
}

function reloadOptions()
{
    fillObjectGroups();
    fillOptions();
    loadTable();
    setCJKFont();
    fillTextarea();

    function fillObjectGroups()
    {
        document.getElementById('search-object-groups-select').replaceChildren();
        for (let i = 0; i < settingsJSON.searchObjectGroups.length; i++) 
        {
            var option = document.createElement("sl-option");
            option.value = i.toString();
            option.innerText = settingsJSON.searchObjectGroups[i].name;
            document.getElementById('search-object-groups-select').appendChild(option);
        }
        console.log(settingsJSON.currentObjectGroup);
        document.getElementById('search-object-groups-select').value = settingsJSON.currentObjectGroup;
    }

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

        document.getElementById("object-group-name-input").value = settingsJSON.searchObjectGroups[settingsJSON.currentObjectGroup].name;

        document.getElementById('cjk-font-select').replaceChildren();
        ['Yu_Gothic_Light', 'Yu_Gothic_Medium'].forEach((font) =>
        {
            var option = document.createElement("sl-option");
            option.value = font;
            option.innerText = font;
            document.getElementById('cjk-font-select').appendChild(option);
        });
        document.getElementById('cjk-font-select').value = settingsJSON.cjkFont;
    }

    function loadTable()
    {
        searchObjectsTable = createSearchObjectsTable(settingsJSON.searchObjectGroups[settingsJSON.currentObjectGroup].objects, "#search-objects-table");
    }

    function fillTextarea()
    {
        document.getElementById('settingsJSON').value = JSON.stringify(settingsJSON, null, 2);
    }

    function setCJKFont()
    {
        styleElement.innerHTML = "\
        @font-face {\
            font-family: \"CJKOverride\";\
            src: local(\"" + settingsJSON.cjkFont.replaceAll("_", " ") + "\");\
            unicode-range: U+3000-303F, U+3040-309F, U+30A0-30FF, U+FF00-FFEF, U+4E00-9FAF;\
        }\
        ";
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

function trackObjectGroupName()
{
    settingsJSON.searchObjectGroups[settingsJSON.currentObjectGroup].name = document.getElementById('object-group-name-input').value;
    saveOptions().then(() => { reloadOptions(); });
}

function addRow()
{
    searchObjectsTable.addData([{ aliases: ["New"], color: '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'), description: "New description" }], false);
}

function selectHighlightType()
{
    settingsJSON.highlightType = document.getElementById('highlight-type-select').value;
    saveOptions().then(() => { reloadOptions(); });
}

function selectCJKFont()
{
    settingsJSON.cjkFont = document.getElementById('cjk-font-select').value;
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

function saveFile(name, content, type)
{
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], { type: type }));
    link.download = name;
    link.click();
    link.remove();
}

function exportOptions()
{
    saveFile('highlighterSettings.json', JSON.stringify(settingsJSON, null, 2), 'text/json');
}

function importOptions()
{
    const reader = new FileReader();
    reader.onload = (event) => 
    {
        settingsJSON = JSON.parse(event.target.result);
        saveOptions().then(() => { reloadOptions(); });
        document.getElementById('import-input').value = null;
    };
    reader.readAsText(document.getElementById('import-input').files[0]);
}

document.addEventListener('DOMContentLoaded', restoreOptions);


document.getElementById('add-row-button').addEventListener('click', addRow);
document.getElementById('save-table-button').addEventListener('click', saveTableOptions);

document.getElementById('line-width-input').addEventListener('input', trackLineWidth);
document.getElementById('opacity-percent-input').addEventListener('input', trackOpacity);
document.getElementById('highlight-type-select').addEventListener('sl-change', selectHighlightType);
document.getElementById('search-object-groups-select').addEventListener('sl-change', selectObjectGroup);
document.getElementById('new-object-group-button').addEventListener('click', newObjectGroup);
document.getElementById('delete-object-group-button').addEventListener('click', deleteObjectGroup);
document.getElementById('object-group-name-input').addEventListener('input', trackObjectGroupName);
document.getElementById('cjk-font-select').addEventListener('sl-change', selectCJKFont);

document.getElementById('save-text-button').addEventListener('click', saveTextOptions);
document.getElementById('reset-button').addEventListener('click', resetStorage);
document.getElementById('import-button').addEventListener('click', () => { document.getElementById('import-input').click(); });
document.getElementById('import-input').addEventListener('change', importOptions);
document.getElementById('export-button').addEventListener('click', exportOptions);
