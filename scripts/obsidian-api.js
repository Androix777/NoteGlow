var obsidianData = [];
var searchString = "asd";

async function refreshObsidianData()
{
    /*
    obsidianData = [
        {
            "aliases": ['123', '345', 'ようこそ'],
            "description": "123-345"
        }
    ]
    */
    const apiUrl = 'https://127.0.0.1:27124/search';
    const requestBody = 'TABLE  \
        FROM "Characters"'; 
    const contentType = 'application/vnd.olrapi.dataview.dql+txt';
    const authToken = '8cc9ac713504199eaa8bbce87c1403192de3e8dc9f6d53b37f456ac9f3b58e01';
    
    var objectList = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': contentType,
            'Authorization': `Bearer ${authToken}`
        },
        body: requestBody
    })
    .then(response => response.json())
    .then(data => {
    return data;
    })
    .catch(error => {
    console.error('Error:', error);
    });

    for (let i = 0; i < objectList.length; i++)
    {
        var fileContent = await getFileContent(objectList[i].filename);
        obsidianData.push({"aliases": fileContent.frontmatter.aliases, 
            "description": fileContent.content.startsWith('---') ? fileContent.content.slice(fileContent.content.indexOf('---', 3) + 4) : fileContent.content});
    }

    console.log(obsidianData.length);
}

async function getFileContent(filename)
{
    const apiUrl = 'https://127.0.0.1:27124/vault';
    const acceptHeader = 'application/vnd.olrapi.note+json';
    const authToken = '8cc9ac713504199eaa8bbce87c1403192de3e8dc9f6d53b37f456ac9f3b58e01';

    const url = new URL(`${apiUrl}/${filename}`);

    var data = await fetch(url, {
    method: 'GET',
    headers: {
        'Accept': acceptHeader,
        'Authorization': `Bearer ${authToken}`
    }
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.error('Error:', error);
    });
    return data;
}