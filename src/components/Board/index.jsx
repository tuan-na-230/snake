import React, { useEffect, useRef, useState, useMemo } from "react";
import Block from "../Block";
import KeyboardEventHandler from "react-keyboard-event-handler";
import { BFS, findMap } from "../../helps";
import { LEFT, RIGHT, UP, DOWN, CONTROL, DEFAULT_MOVE, DEFAULT_SPEED } from "../../constants";

const defaultSnake = (size) => {
    const halfSize = Math.floor(size / 2);
    return [
        { x: halfSize + 3, y: halfSize },
        { x: halfSize + 2, y: halfSize },
        { x: halfSize + 1, y: halfSize },
    ]
}
const defaultNextStep = (size) => {
    const defaultBodySnake = defaultSnake(size);
    const head = defaultBodySnake[defaultBodySnake.length - 1];
    return { move: DEFAULT_MOVE, oldHead: head }
}
const Board = ({ size }) => {
    const [snakeBody, setSnakeBody] = useState(defaultSnake(size));
    const [nextStep, setNextStep] = useState(defaultNextStep(size));
    const [food, setFood] = useState({ x: Math.floor(Math.random() * (size - 1) + 1), y: Math.floor(Math.random() * (size - 1) + 1) });
    const [speed, setSpeed] = useState(DEFAULT_SPEED)
    const [isPause, setIsPause] = useState(false)
    const [isAuto, setAuto] = useState(false)
    const [way, setWay] = useState([])

    const findHead = () => {
        const snakeBodyTemp = [...snakeBody]
        return snakeBodyTemp[snakeBodyTemp.length - 1]
    }
    const followWay = async () => {
        if (way.length) {
            console.log(way[0])
            const snakeBodyTemp = defaultSnake(size);
            const node = JSON.parse(way[0]);
            await setWay(prev => { prev.shift(); return prev })
            const headSnake = findHead()
            let move;
            if (headSnake.y === node.y) {
                if (headSnake.x > node.x) {
                    move = LEFT
                }
                if (headSnake.x < node.x) {
                    move = RIGHT
                }
            }
            if (headSnake.x === node.x) {
                if (headSnake.y < node.y) {
                    move = DOWN
                }
                if (headSnake.y > node.y) {
                    move = UP
                }
            }
            switch (move) {
                case LEFT:
                    await setSnakeBody([
                        ...snakeBodyTemp,
                        {
                            x: headSnake.x - 1 <= 0 ? size : headSnake.x - 1,
                            y: headSnake.y
                        }
                    ]);
                    break;
                case RIGHT:
                    await setSnakeBody([
                        ...snakeBodyTemp,
                        {
                            x: headSnake.x + 1 > size ? 1 : headSnake.x + 1,
                            y: headSnake.y
                        }
                    ]);
                    break;
                case UP:
                    await setSnakeBody([
                        ...snakeBodyTemp,
                        {
                            x: headSnake.x,
                            y: headSnake.y - 1 <= 0 ? size : headSnake.y - 1
                        }
                    ]);
                    break;
                case DOWN:
                    await setSnakeBody([
                        ...snakeBodyTemp,
                        {
                            x: headSnake.x,
                            y: headSnake.y + 1 > size ? 1 : headSnake.y + 1
                        }
                    ]);
                    break;
                default:
            }
        }
    }

    const findWay = async () => {
        const snakeBodyTemp = [...snakeBody];
        const headSnake = snakeBodyTemp[snakeBodyTemp.length - 1];
        snakeBodyTemp.shift()
        const map = findMap(size, snakeBodyTemp);
        console.log(map)
        const result = await BFS(JSON.stringify(headSnake), JSON.stringify(food), map);
        console.log(result)
        result.way?.shift();
        if (!result) {
            alert(`game over! score: ${snakeBodyTemp.length}`);
            return restart();
        } else {
            await setWay(result.way);
        }
    }

    useEffect(() => {
        if (isAuto) {
            findWay()
        }
    }, [food])
    useEffect(() => {
        setSpeed(prev => prev - 1)
    }, [food])

    const checkEnd = (snakeBody, headBody) => {
        const snakeBodyTemp = [...snakeBody];
        snakeBodyTemp.pop();
        let isEnd = false;
        if (snakeBodyTemp.some(o => o.x === headBody.x && o.y === headBody.y)) {
            isEnd = true;
        }
        return isEnd
    }

    const handleMove = async () => {
        const snakeBodyTemp = [...snakeBody];
        const headSnake = snakeBodyTemp[snakeBodyTemp.length - 1];
        const result = checkEnd(snakeBodyTemp, headSnake)
        if (result) {
            alert(`game over! score: ${snakeBodyTemp.length}`);
            return restart();
        }
        if (!(headSnake.x === food.x && headSnake.y === food.y)) {
            snakeBodyTemp.shift()
        } else {
            // create food
            let x, y;
            do {
                x = Math.floor(Math.random() * (size - 1) + 1);
                y = Math.floor(Math.random() * (size - 1) + 1);
            } while (snakeBodyTemp.some(o => o.x === x && o.y === y));
            setFood({ x, y })
        }
        switch (nextStep.move) {
            case LEFT:
                await setSnakeBody([
                    ...snakeBodyTemp,
                    {
                        x: headSnake.x - 1 <= 0 ? size : headSnake.x - 1,
                        y: headSnake.y
                    }
                ]);
                break;
            case RIGHT:
                await setSnakeBody([
                    ...snakeBodyTemp,
                    {
                        x: headSnake.x + 1 > size ? 1 : headSnake.x + 1,
                        y: headSnake.y
                    }
                ]);
                break;
            case UP:
                await setSnakeBody([
                    ...snakeBodyTemp,
                    {
                        x: headSnake.x,
                        y: headSnake.y - 1 <= 0 ? size : headSnake.y - 1
                    }
                ]);
                break;
            case DOWN:
                await setSnakeBody([
                    ...snakeBodyTemp,
                    {
                        x: headSnake.x,
                        y: headSnake.y + 1 > size ? 1 : headSnake.y + 1
                    }
                ]);
                break;
            default:
        }
    };

    function useInterval(callback, delay) {
        delay = isPause ? null : delay
        const savedCallback = useRef();
        // Remember the latest callback.
        useEffect(() => {
            savedCallback.current = callback;
        }, [callback]);
        // Set up the interval.
        useEffect(() => {
            function tick() {
                savedCallback.current();
            }
            if (delay !== null) {
                let id = setInterval(tick, delay);
                return () => clearInterval(id);
            }
        }, [delay]);
    }
    useInterval(isAuto ? followWay : handleMove, speed);

    const restart = () => {
        setIsPause(true)
        setSnakeBody(defaultSnake(size))
        setFood({ x: Math.floor(Math.random() * (size - 1) + 1), y: Math.floor(Math.random() * (size - 1) + 1) })
    }
    const pause = () => {
        setIsPause(prev => !prev)
    }
    const auto = () => {
        setAuto(prev => !prev)
        restart()
    }

    const validateChangeMove = (currentMove, key) => {
        if ((key === LEFT && currentMove === RIGHT) || (key === RIGHT && currentMove === LEFT)) {
            return currentMove
        }
        if ((key === UP && currentMove === DOWN) || (key === DOWN && currentMove === UP)) {
            return currentMove
        }
        return key
    }
    const handleChangeMove = (key) => {
        if (!isAuto) {
            setNextStep(prev => {
                const { move, oldHead } = prev
                const bodySnakeTemp = [...snakeBody]
                const headSnake = bodySnakeTemp[bodySnakeTemp.length - 1]
                if (JSON.stringify(headSnake) !== JSON.stringify(oldHead)) {
                    let newMove = validateChangeMove(move, key)
                    return { move: newMove, oldHead: headSnake }
                } else {
                    return prev
                }
            });
        }
    };
    const renderBoard = () => {
        return Array(size)
            .fill("")
            .map((_, i) => (
                <div style={{ display: "flex" }}>
                    <span>{i + 1}</span>
                    {Array(size)
                        .fill("")
                        .map((_, j) => (
                            <div>
                                {i === 0 && <span>{j + 1}</span>}
                                <Block
                                    key={`${i}${j}`}
                                    x={j + 1}
                                    y={i + 1}
                                    active={snakeBody.find((o) => o.x === j + 1 && o.y === i + 1)}
                                    isHead={
                                        snakeBody[snakeBody.length - 1].x === j + 1 &&
                                        snakeBody[snakeBody.length - 1].y === i + 1
                                    }
                                    isFood={
                                        j + 1 === food.x &&
                                        i + 1 === food.y
                                    }
                                />
                            </div>
                        ))}
                </div>
            ));
    };
    return (
        <div>
            <KeyboardEventHandler
                handleKeys={CONTROL}
                onKeyEvent={handleChangeMove}
            />
            {renderBoard()}
            <button onClick={restart}>restart</button>
            <button onClick={pause}>{isPause ? 'continuous' : 'pause'}</button>
            <button onClick={auto}>{isAuto ? 'auto play' : 'normal'}</button>
            <p>{snakeBody?.length - 3}</p>
        </div>
    );
};

export default Board;
