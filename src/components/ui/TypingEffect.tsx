"use client";

import React, { useState, useEffect } from "react";

const TypingEffect = ({ texts, speed = 100, eraseSpeed = 50, delay = 1000 }: { texts: string[]; speed: number; eraseSpeed: number; delay: number }) => {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleTyping = () => {
      const currentText = texts[index];
      if (isDeleting) {
        setText((prev) => prev.slice(0, prev.length - 1));
        if (text === "") {
          setIsDeleting(false);
          setIndex((prev) => (prev + 1) % texts.length);
        }
      } else {
        setText((prev) => currentText.slice(0, prev.length + 1));
        if (text === currentText) {
          setIsDeleting(true);
          setTimeout(() => {}, delay);
        }
      }
    };

    const typingSpeed = isDeleting ? eraseSpeed : speed;
    const timer = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, texts, index, speed, eraseSpeed, delay]);

  return <span>{text}</span>;
};

export default TypingEffect;
