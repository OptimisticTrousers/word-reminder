import CSSModules from "react-css-modules"
import styles from "./Word.module.css";
import { MdDelete } from "react-icons/md";
import { BsInfoCircleFill } from "react-icons/bs";
import { useRef, useState } from "react";

const Word = CSSModules(() => {
    const accordion = useRef<HTMLDivElement | null>(null);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);

    const handleAccordion = () => {
        setIsAccordionOpen((prevValue) => !prevValue);
        if (accordion.current) {
            accordion.current.style.maxHeight = accordion.current?.style.maxHeight !== "0px" ? `0px` : `${accordion.current?.scrollHeight}px`
        }
    }
    return (
        <div>
            <article styleName="word">
                <p styleName="word__name">Superfluous</p>
                <div styleName="word__divider"></div>
                <div styleName="word__buttons">
                    <button styleName="word__button word__button--info" onClick={handleAccordion}>
                        <BsInfoCircleFill styleName="word__icon" />
                    </button>
                    <button styleName="word__delete word__button--delete">
                        <MdDelete styleName="word__icon" />
                    </button>
                </div>
            </article>
            <div ref={accordion}
                styleName={`panel ${isAccordionOpen && "panel--active"}`}

            >
                <p styleName="panel__paragraph">Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur labore optio earum eius autem, voluptate repudiandae. Sit quis earum fugiat aliquam iste sint architecto provident dolores nam dolore, quos error?</p>
            </div>
        </div>
    )
}, styles, { allowMultiple: true, handleNotFoundStyleName: "ignore" })

export default Word;