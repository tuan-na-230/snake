function BFS(start, end, map) {
    if (map[start] === undefined || map[start] === "block" || map[end] === undefined || map[end] === "block") {
        return false;
    }
    let open = [];
    let close = [];
    let list = {};
    list[start] = {
        height: 0,
        parent: null
    };
    open.push(start);
    let dependent = function (e) {
        let result = map[e];
        for (let i = 0; i < result.length; i++) {
            if (list[result[i]] === undefined) {
                list[result[i]] = {
                    height: list[e].height + 1,
                    parent: e
                };
            }
        }
        return result;
    }
    let way = function (list) {
        let result = [];
        let edge = end;
        result.unshift(edge);
        while (list[edge].parent != null) {
            edge = list[edge].parent;
            result.unshift(edge);
        }
        return result;
    }
    function pushDependentToEndOfOpen(dpd, openList) {
        for (let i = 0; i < dpd.length; i++) {
            openList.push(dpd[i]);
        }
    }
    function deleteUnreadList(list) {
        let check = false;
        for (let key in list) {
            if (check === true) {
                delete list[key];
            }
            if (key === end) {
                check = true;
            }
        }
    }
    while (open.length > 0) {
        let edge = open[0];
        open.shift();
        if (edge === end) {
            deleteUnreadList(list);
            return {
                way: way(list),
                list: list
            }
        }
        pushDependentToEndOfOpen(dependent(edge), open);
        close.push(edge);
    }
}

const findNearBy = (x, y, size) => {
    const listNearBy = [
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 },
    ]
    return listNearBy.filter(o => o.x > 0 && o.x <= size && o.y > 0 && o.y <= size)
        .map(o => JSON.stringify(o))
}
const findMap = (size, snakeBody = []) => {
    const map = [];
    for (let i = 1; i <= size; i++) {
        for (let j = 1; j <= size; j++) {
            const list = findNearBy(i, j, size, snakeBody)
            const key = JSON.stringify({ x: i, y: j })
            map[key] = list
            if (snakeBody.map(o => JSON.stringify(o)).includes(key)) {
                map[key] = 'block'
            }
        }
    }
    return map
}

function debounce(fn, delay) {
    return args => {
        clearTimeout(fn.id)

        fn.id = setTimeout(() => {
            fn.call(this, args)
        }, delay)
    }
}

export { BFS, findMap, debounce }