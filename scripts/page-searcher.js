function search(parent, searchObjects)
{
    function depthFirstTraversal(node)
    {
        let charsNum = 0;
        let result = [];

        function addResult(text, node)
        {
            result.push({
                text: text,
                node: node,
                start: charsNum,
                end: charsNum + text.length,
            });
            charsNum += text.length;
        }

        function traverse(node)
        {
            if (!node) return;

            if (
                node.nodeType === Node.TEXT_NODE &&
                node.textContent.trim() !== "" &&
                node.parentElement.tagName.toLowerCase() !== "rt"
            )
            {
                addResult(node.textContent, node);
            } else if (
                node.tagName &&
                (node.tagName.toLowerCase() === "br" ||
                    node.tagName.toLowerCase() === "p")
            )
            {
                addResult("\n", node);
            }

            const children = node.childNodes;
            children.forEach(traverse);

            if (node.tagName && node.tagName.toLowerCase() === "p")
            {
                addResult("\n", node);
            }
        }

        traverse(node);

        return result;
    }

    function getSubstringNodes(array, startIndex, endIndex)
    {
        function isNodeOverlapping(node, startIndex, endIndex)
        {
            const nodeStart = node.start;
            const nodeEnd = node.end;

            return (
                Math.max(startIndex, nodeStart) < Math.min(endIndex, nodeEnd)
            );
        }

        function getSubstringNode(node, startIndex, endIndex)
        {
            const nodeStart = node.start;

            const nodeSubaliasestart = Math.max(startIndex - nodeStart, 0);
            const nodeSubstringEnd = Math.min(
                endIndex - nodeStart,
                node.text.length
            );

            return {
                node: node.node,
                start: nodeSubaliasestart,
                end: nodeSubstringEnd,
            };
        }

        return array
            .filter((node) => isNodeOverlapping(node, startIndex, endIndex))
            .map((node) => getSubstringNode(node, startIndex, endIndex));
    }

    let array = depthFirstTraversal(parent);
    const concatenatedString = array.map((item) => item.text).join("");
    let allSubstringNodes = [];

    for (let i = 0; i < searchObjects.length; i++)
    {
        for (let j = 0; j < searchObjects[i].length; j++)
        {
            let substring = searchObjects[i][j];
            let startIndex = 0;
            let endIndex = 0;

            while (startIndex !== -1)
            {
                startIndex = concatenatedString.indexOf(substring, endIndex);
                endIndex = startIndex + substring.length;

                if (startIndex === -1)
                {
                    break;
                }

                const substringNodes = getSubstringNodes(
                    array,
                    startIndex,
                    endIndex
                );
                substringNodes.forEach((node) =>
                {
                    allSubstringNodes.push({
                        node: node.node,
                        searchObjectID: i,
                        startIndex: node.start,
                        endIndex: node.end,
                    });
                });
            }
        }
    }

    return allSubstringNodes;
}