import React, { useEffect, useRef, useState } from "react";
import Block from "../Block";
import KeyboardEventHandler from "react-keyboard-event-handler";

const LEFT = "left";
const RIGHT = "right";
const UP = "up";
const DOWN = "down";
const CONTROL = [LEFT, RIGHT, UP, DOWN];
const DEFAULT_MOVE = LEFT;
const DEFAULT_SPEED = 150;

const defaultSnake = (size) => {
    const halfSize = Math.floor(size / 2);
    return [
        { x: halfSize + 3, y: halfSize },
        { x: halfSize + 2, y: halfSize },
        { x: halfSize + 1, y: halfSize },
    ]
}

const Board = ({ size }) => {
    const [snakeBody, setSnakeBody] = useState(defaultSnake(size));
    const [move, setMove] = useState(DEFAULT_MOVE);
    const [food, setFood] = useState({ x: Math.floor(Math.random() * (size - 1) + 1), y: Math.floor(Math.random() * (size - 1) + 1) });
    const [speed, setSpeed] = useState(DEFAULT_SPEED)
    const [isPause, setIsPause] = useState(false)

    const checkEnd = (snakeBody, headBody) => {
        const snakeBodyTemp = [...snakeBody];
        snakeBodyTemp.pop();
        let isEnd = false;
        if (snakeBodyTemp.some(o => o.x === headBody.x && o.y === headBody.y)) {
            isEnd = true;
        }
        return isEnd
    }

    const speedUp = (snakeBody) => {
        const totalLength = size * size;
        const currentLength = snakeBody.length;
        console.log(currentLength, totalLength, currentLength / totalLength)
        setSpeed(prev => prev - prev / 2 * (currentLength / totalLength))
    }

    useEffect(() => {
        speedUp(snakeBody);
    }, [food])

    const handleMove = () => {
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
            let x, y;
            do {
                x = Math.floor(Math.random() * (size - 1) + 1);
                y = Math.floor(Math.random() * (size - 1) + 1);
            } while (snakeBodyTemp.some(o => o.x === x && o.y === y));
            setFood({ x, y })
        }
        switch (move) {
            case LEFT:
                setSnakeBody([
                    ...snakeBodyTemp,
                    {
                        x: headSnake.x - 1 <= 0 ? size : headSnake.x - 1,
                        y: headSnake.y
                    }
                ]);
                break;
            case RIGHT:
                setSnakeBody([
                    ...snakeBodyTemp,
                    {
                        x: headSnake.x + 1 > size ? 1 : headSnake.x + 1,
                        y: headSnake.y
                    }
                ]);
                break;
            case UP:
                setSnakeBody([
                    ...snakeBodyTemp,
                    {
                        x: headSnake.x,
                        y: headSnake.y - 1 <= 0 ? size : headSnake.y - 1
                    }
                ]);
                break;
            case DOWN:
                setSnakeBody(prev => [
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
    useInterval(handleMove, speed);

    const handleChangeMove = (key) => {
        if ((key === LEFT && move === RIGHT) || (key === RIGHT && move === LEFT)) {
            return
        }
        if ((key === UP && move === DOWN) || (key === DOWN && move === UP)) {
            return
        }
        setMove(key);
    };

    const renderBoard = () => {
        return Array(size)
            .fill("")
            .map((_, i) => (
                <div style={{ display: "flex" }}>
                    {Array(size)
                        .fill("")
                        .map((_, j) => (
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
                        ))}
                </div>
            ));
    };

    const restart = () => {
        setIsPause(true)
        setSnakeBody(defaultSnake(size))
        setFood({ x: Math.floor(Math.random() * (size - 1) + 1), y: Math.floor(Math.random() * (size - 1) + 1) })
    }

    const pause = () => {
        setIsPause(prev => !prev)
    }

    return (
        <div>
            <KeyboardEventHandler
                handleKeys={CONTROL}
                onKeyEvent={handleChangeMove}
            />
            {renderBoard()}
            <button onClick={restart}>restart</button>
            <button onClick={pause}>{isPause ? 'continuous' : 'pause'}</button>
        </div>
    );
};

export default Board;
