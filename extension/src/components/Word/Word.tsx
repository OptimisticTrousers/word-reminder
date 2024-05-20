import CSSModules from "react-css-modules"
import styles from "./Word.module.css";
import { MdDelete } from "react-icons/md";
import { BsInfoCircleFill } from "react-icons/bs";

const Word = CSSModules(() => {
    return (
        <article styleName="word">
            <p styleName="word__name">Superfluous</p>
            <div styleName="word__divider"></div>
            <div styleName="word__buttons">
                <button styleName="word__button word__button--info">
                    <BsInfoCircleFill styleName="word__icon" />
                </button>
                <button styleName="word__delete word__button--delete">
                    <MdDelete styleName="word__icon" />
                </button>
            </div>
        </article>
    )
}, styles, { allowMultiple: true, handleNotFoundStyleName: "ignore" })

export default Word;