import React from 'react';
import './LanguageBox.css';

const LANGUAGES = [
  { word: 'Apple',    lang: 'English',  top: '-5%',   left: '50%', delay: '0s',    size: 'large' },
  { word: 'りんご',   lang: 'Japanese', top: '15%',  left: '12%',  delay: '0.6s',  size: 'medium' },
  { word: 'تفاح',    lang: 'Arabic',   top: '15%',  left: '88%', delay: '1.1s',  size: 'medium' },
  { word: '苹果',    lang: 'Chinese',  top: '75%',  left: '12%', delay: '0.3s',  size: 'medium' },
  { word: 'แอปเปิ้ล', lang: 'Thai',   top: '75%',  left: '88%', delay: '0.9s',  size: 'medium' },
  { word: 'Apel',    lang: 'Bahasa',   top: '90%',  left: '50%', delay: '1.5s',  size: 'medium' },
];

const LanguageBox = ({ word, lang, top, left, delay, size }) => {
  return (
    <div
      className={`lang-box lang-box--${size}`}
      style={{ top, left, animationDelay: delay }}
    >
      <span className="lang-box__word">{word}</span>
      <span className="lang-box__lang">{lang}</span>
    </div>
  );
};

const LanguageBoxes = () => {
  return (
    <div className="lang-boxes-container">
      {LANGUAGES.map((l, i) => (
        <LanguageBox key={i} {...l} />
      ))}
    </div>
  );
};

export default LanguageBoxes;
