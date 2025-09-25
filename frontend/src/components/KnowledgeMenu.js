// components/KnowledgeMenu.js
import React, { useState } from "react";
import KnowledgeIcon from "../icons/knowledge.svg"; // new icon
import WikiIcon from "../icons/wiki.svg";
import DictionaryIcon from "../icons/dictionary.svg";
import QuoteIcon from "../icons/quote.svg";
import JokeIcon from "../icons/joke.svg";

const KnowledgeMenu = ({ onWiki, onDictionary, onQuote, onJoke }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="knowledgemenu-wrapper">
      {/* Button */}
      <button
        className="knowledge-button"
        onClick={() => setOpen(!open)}
        title="Knowledge & Fun"
      >
        <img src={KnowledgeIcon} alt="Knowledge" width="20" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="knowledge-dropdown">
          <button onClick={onWiki} title="Ask Wikipedia">
            <img src={WikiIcon} alt="Wiki" width="18" /> Wikipedia
          </button>
          <button onClick={onDictionary} title="Dictionary lookup">
            <img src={DictionaryIcon} alt="Dictionary" width="18" /> Dictionary
          </button>
          <button onClick={onQuote} title="Get a Quote">
            <img src={QuoteIcon} alt="Quote" width="18" /> Quote
          </button>
          <button onClick={onJoke} title="Tell a Joke">
            <img src={JokeIcon} alt="Joke" width="18" /> Joke
          </button>
        </div>
      )}
    </div>
  );
};

export default KnowledgeMenu;
