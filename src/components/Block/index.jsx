import "./styles.css";

const Block = ({ active, isHead, isFood }) => {
    return (
        <div
            className={`block ${active && "block-active"} ${isHead && "block-head"} ${isFood && "block-food"}`}
        ></div>
    );
};

export default Block;
