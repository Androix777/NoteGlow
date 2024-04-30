export function createSearchObjectsTable(tableData, divID)
{
    var table = new Tabulator(divID,
        {
            layout: "fitColumns",
            data: tableData,
            height: 500,
            movableRows: true,
            rowContextMenu: [
                {
                    label: "Add item",
                    action: function (e, row)
                    {
                        row.getTable().addData([{ aliases: ["New"], color: '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'), description: "New description" }], false);
                    }
                },
                {
                    label: "Delete item",
                    action: function (e, row)
                    {
                        row.delete();
                    }
                }
            ],
            columns:
                [
                    {
                        rowHandle: true,
                        formatter: "handle",
                        headerSort: false,
                        frozen: true,
                        width: 30,
                        minWidth: 30,
                        resizable: false
                    },
                    {
                        title: "Aliases",
                        field: "aliases",
                        editor: aliasesEditor,
                        formatter: function (cell)
                        {
                            var element = cell.getElement();
                            element.style.fontFamily = "CJKOverride";
                            element.style.fontSize = "20px";
                            return cell.getValue().join(', ');
                        },
                        resizable: false
                    },
                    {
                        title: "Description",
                        field: "description",
                        editor: "input",
                        resizable: false
                    },
                    {
                        title: "Color",
                        field: "color",
                        formatter: 'color',
                        editor: function (cell, onRendered, success, cancel)
                        {
                            var cellValue = cell.getValue();
                            var input = document.createElement("input");

                            input.setAttribute("type", "color");
                            input.setAttribute("value", cellValue);

                            input.style.height = "100%";
                            input.style.width = "100%";

                            onRendered(() =>
                            {
                                input.focus();
                            });

                            function onChange()
                            {
                                if (input.value != cellValue)
                                {
                                    success(input.value);
                                }
                                else
                                {
                                    cancel();
                                }
                            }
                            input.addEventListener("change", onChange);
                            input.addEventListener("keydown", (e) =>
                            {
                                if (e.keyCode == 13)
                                {
                                    onChange();
                                }

                                if (e.keyCode == 27)
                                {
                                    cancel();
                                }
                            });
                            return input;
                        },
                        resizable: false
                    },
                    {
                        formatter: "tickCross",
                        width: 50,
                        hozAlign: "center",
                        vertAlign: "middle",
                        cellClick: (event, cell) => 
                        {
                            cell.getRow().delete();
                        },
                        resizable: false
                    },
                ],
        });

    return table;
}

function aliasesEditor(cell, onRendered, success, cancel)
{
    var cellValue = cell.getValue();

    var container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.zIndex = "9998";

    var blocker = document.createElement("div");
    blocker.style.width = "100%";
    blocker.style.height = "100%";
    blocker.style.backgroundColor = "rgba(0,0,0,0.5)";
    container.appendChild(blocker);

    var modal = document.createElement("div");
    modal.style.position = "absolute";
    modal.style.left = "50%";
    modal.style.top = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.backgroundColor = "white";
    modal.style.padding = "10px";
    modal.style.width = "400px";
    modal.style.height = "300px";
    modal.style.overflow = "auto";
    container.appendChild(modal);

    var aliasTable = new Tabulator(modal, {
        data: cellValue.map(alias => ({ alias: alias })),
        layout: "fitColumns",
        rowContextMenu: [
            {
                label: "Add alias",
                action: function (e, row)
                {
                    row.getTable().addData([{ alias: "New" }], false);
                }
            },
            {
                label: "Delete alias",
                action: function (e, row)
                {
                    row.delete();
                }
            }
        ],
        columns: [
            {
                title: "Alias",
                field: "alias",
                editor: function (cell, onRendered, success, cancel, editorParams)
                {
                    var cellValue = cell.getValue(),
                        input = document.createElement("input");

                    input.setAttribute("type", editorParams.search ? "search" : "text");

                    input.style.padding = "4px";
                    input.style.width = "100%";
                    input.style.boxSizing = "border-box";
                    input.style.fontFamily = "CJKOverride";
                    input.style.fontSize = "20px";

                    if (editorParams.elementAttributes && typeof editorParams.elementAttributes == "object")
                    {
                        for (let key in editorParams.elementAttributes)
                        {
                            if (key.charAt(0) == "+")
                            {
                                key = key.slice(1);
                                input.setAttribute(key, input.getAttribute(key) + editorParams.elementAttributes["+" + key]);
                            } else
                            {
                                input.setAttribute(key, editorParams.elementAttributes[key]);
                            }
                        }
                    }

                    input.value = typeof cellValue !== "undefined" ? cellValue : "";

                    onRendered(function ()
                    {
                        if (cell.getType() === "cell")
                        {
                            input.focus({ preventScroll: true });
                            input.style.height = "100%";

                            if (editorParams.selectContents)
                            {
                                input.select();
                            }
                        }
                    });

                    function onChange(e)
                    {
                        if (((cellValue === null || typeof cellValue === "undefined") && input.value !== "") || input.value !== cellValue)
                        {
                            if (success(input.value))
                            {
                                cellValue = input.value;
                            }
                        } else
                        {
                            cancel();
                        }
                    }

                    input.addEventListener("change", onChange);
                    input.addEventListener("blur", onChange);

                    input.addEventListener("keydown", function (e)
                    {
                        switch (e.keyCode)
                        {
                            case 13:
                                onChange(e);
                                break;

                            case 27:
                                cancel();
                                break;

                            case 35:
                            case 36:
                                e.stopPropagation();
                                break;
                        }
                    });

                    if (editorParams.mask)
                    {
                        maskInput(input, editorParams);
                    }

                    return input;
                },
                formatter: function (cell)
                {
                    var element = cell.getElement();
                    element.style.fontFamily = "CJKOverride";
                    element.style.fontSize = "20px";
                    return cell.getValue();
                }
            }
        ]
    });

    function closeModal()
    {
        document.body.removeChild(container);
        document.getElementById("page-content").style.filter = "";
        var data = aliasTable.getData();
        success(data.map(item => item.alias));
    }

    blocker.addEventListener("click", closeModal);
    document.getElementById("page-content").style.filter = "blur(5px)";
    document.body.appendChild(container);
    onRendered(() =>
    {
        modal.focus();
    });
}