import React from 'react';
export default function Loading({size, title, message, spinner}) {
  function chooseFunnyMessage() {
    let funnys = [
      "We'll be back in a sec.",
      "funny #1",
      "funny #2",
    ];
    return funnys[Math.floor(Math.random() * funnys.length)];
  }

  return <div className={`loading loading-${size || "md"}`}>
    {spinner ? <i className="fa fa-spinner fa-spin" /> : null}
    <h1>{title || "Loading..."}</h1>
    <p>{message ? message : chooseFunnyMessage()}</p>
  </div>;
}
