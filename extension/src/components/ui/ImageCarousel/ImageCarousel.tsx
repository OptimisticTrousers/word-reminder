import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import CSSModules from "react-css-modules";

import styles from "./ImageCarousel.module.css";
import { useInterval } from "../../../hooks/useInterval";
import { Image } from "common";
import noImageAvailableImage from "../../../assets/images/no-image-available.jpg";

export interface Props {
  images: Image[];
  hasAutoScroll: boolean;
}

export const ImageCarousel = CSSModules(
  function ({ images, hasAutoScroll }: Props) {
    const [slideIndex, setSlideIndex] = useState(1);

    const delay = 500;
    useInterval(
      () => {
        plusSlides(1);
      },
      hasAutoScroll ? delay : null
    );

    function plusSlides(number: number) {
      setSlideIndex((prevSlideIndex) => {
        const newIndex = prevSlideIndex + number;
        if (newIndex > images.length) {
          return 1;
        } else if (newIndex < 1) {
          return images.length;
        }
        return newIndex;
      });
    }

    function currentSlide(index: number) {
      setSlideIndex(index);
    }

    return (
      <div styleName="carousel">
        <div styleName="carousel__images">
          {images.length > 0 ? (
            images.map((image: Image, index: number) => {
              const position = index + 1;
              return (
                position === slideIndex && (
                  <figure key={index} styleName="carousel__item fade">
                    <span styleName="carousel__count">
                      {position}/{images.length}
                    </span>
                    <img
                      styleName="carousel__image"
                      src={image.src}
                      alt=""
                      role="presentation"
                    />
                    <figcaption styleName="carousel__caption">
                      {image.caption}
                    </figcaption>
                  </figure>
                )
              );
            })
          ) : (
            <figure styleName="carousel__item fade">
              <span styleName="carousel__count">0/0</span>
              <img
                styleName="carousel__image"
                src={noImageAvailableImage}
                alt=""
                role="presentation"
              />
              <figcaption styleName="carousel__caption">
                No Images Available
              </figcaption>
            </figure>
          )}
          <button
            styleName="carousel__button carousel__button--prev"
            aria-label="Previous image"
            onClick={() => {
              plusSlides(-1);
            }}
          >
            <ChevronLeft styleName="carousel__icon" />
          </button>
          <button
            styleName="carousel__button carousel__button--next"
            aria-label="Next image"
            onClick={() => {
              plusSlides(1);
            }}
          >
            <ChevronRight styleName="carousel__icon" />
          </button>
        </div>
        <div styleName="carousel__dots">
          {images.map((_, index: number) => {
            const position = index + 1;
            return (
              <button
                key={index}
                styleName={`carousel__button carousel__button--dot ${
                  slideIndex === position && "carousel__button--active"
                }`}
                aria-label={`Show image ${position}`}
                onClick={() => currentSlide(position)}
              ></button>
            );
          })}
        </div>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
