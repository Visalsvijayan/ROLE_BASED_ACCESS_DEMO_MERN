import { useEffect, useRef, useState } from "react";

/**
 * A search box that waits until the user stops typing (400 ms) before it
 * calls onSearch, so we don't hit the API on every single keystroke.
 */
export default function SearchInput({ value, onSearch, placeholder = "Search...", label = "Search", delay = 400 }) {
  const [text, setText] = useState(value);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []); // cleanup on unmount

  const handleChange = (event) => {
    const next = event.target.value;
    setText(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(next.trim()), delay);
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Enter searches immediately
    clearTimeout(timer.current);
    onSearch(text.trim());
  };

  return (
    <form className="search" role="search" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="search-input">
        {label}
      </label>
      <input
        id="search-input"
        type="search"
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={100}
        autoComplete="off"
      />
    </form>
  );
}
