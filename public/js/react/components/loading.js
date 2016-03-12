import React from 'react';
export default function Loading({size, title, message, spinner}) {
  function choose_funny_message() {
    let funnys = [
      "funny #1",
      "funny #2",
      "We'll be back in a sec.",
    ];
    return funnys[Math.floor(Math.random() * funnys.length)];
  }

  return <div className={`loading loading-${size || "md"}`}>
    {spinner ? <i className="fa fa-spinner fa-spin" /> : null}
    <h1>{title || "Loading..."}</h1>
    <p>{message ? message : choose_funny_message()}</p>
  </div>;
}
