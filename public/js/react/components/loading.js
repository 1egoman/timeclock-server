const LoadingComponent = function({size}) {
  function choose_funny_message() {
    let funnys = [
      "funny #1",
      "funny #2"
    ];
    return funnys[Math.floor(Math.random() * funnys.length)];
  }

  return <div className={`loading loading-${size}`}>
    <h1>Loading...</h1>
    <p>{choose_funny_message()}</p>
  </div>;
}
