import React from 'react';
import {
  calculateAverageWorkPeriodLength,
  calculateAverageCommitTime,
  calculateAverageCommitsPerWorkPeriod,
  calculateAverageCommitsPerContributorPerWorkPeriod,
  calculateCommitStats,
  calculateContributors,
  getLastContributor,
  generateChartTimeDataForEachWorkDay,
  generateWorkActivityGraph,
  formatTime,
  assertIsCard,
  colorizeGraph,
} from "../../helpers/stats";
import {getAvatarFor} from '../../helpers/timecard';
import {
  Panel,
  Col,
  ProgressBar,
  Well,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import _ from 'underscore';
import {
  Line as LineChart,
  Bar as BarChart,
  Doughnut as PieChart,
} from 'react-chartjs';

function ClientRating({part, whole}) {
  let quality = (function() {
    let ratio = part / (whole || 100);
    if (ratio > 0.6) {
      return "good";
    } else if (ratio > 0.4) {
      return "ok";
    } else {
      return "bad";
    }
  })();
  return <div className={`client-score ${quality}`}>
    <div className="numerator">{Math.round(part)}</div>
    <div className="denominator">{whole || 100}</div>
  </div>;
}

// format a time to the specified unit given a value in milliseconds
export function FormatTime({unit, value}) {
  // what to divide by to convert milliseconds to the given unit
  let [label, multiplier] = (function() {
    switch (unit.toLowerCase()) {
      case "day":
      case "days":
      case "d":
        return ["days", 60 * 60 * 1000 * 24];
      case "hour":
      case "hours":
      case "h":
        return ["hours", 60 * 60 * 1000];
      case "minute":
      case "minutes":
      case "min":
      case "m":
        return ["minutes", 60 * 1000];
      case "second":
      case "seconds":
      case "sec":
      case "s":
        return ["seconds", 1000];
      case "millisecond":
      case "milliseconds":
      case "ms":
        return ["ms", 1];
    }
  })();

  let dispValue = Math.round(value / multiplier * 100) / 100;

  // remove plural form for when the item is singular
  if (dispValue === 1 && label !== "ms") {
    label = label.slice(0, -1);
  }

  return <span className="formatted-time">
    <span className="value">{dispValue}</span>
    &nbsp;
    <span className="unit">{label}</span>
  </span>;
}

export function Client({
  timecard,
  commits,
  users,
  stats: {
    payAmountBreakdownCircle,
    payFrequencyBreakdownCircle,
    payment,
  },
}) {
  const howMuchPaidTooltip = <Tooltip id="how-much-paid">
          A diagram showing all instances that the client paid for work completed.
          Higher numbers indicate a more-regular payment schedule.
        </Tooltip>,
        howSoonPaidTooltip = <Tooltip id="how-soon-paid">
          A measure of the amount of time it takes for an hour of work done by
          the freelancer to be paid by the client. Lower is better.
        </Tooltip>;

  if (assertIsCard(timecard) && Array.isArray(commits) && Array.isArray(users)) {
    return <div className="repo-metrics repo-metrics-client">
      <Panel header="Client">
        {/* Disambiguation of score */}
        <Col xs={12} md={8}>
          <div className="client-score-disambiguation">
            <Col xs={4} xsOffset={4} md={4} mdOffset={0}>
              <ClientRating part={payment.score * 100} />
            </Col>

            {/* stats about the client */}
            <Col xs={12} md={8}>
              <ul>
                {
                  payment.lastMonth ?
                  <li>
                    ${payment.lastMonth}
                    <span className="label">paid last month</span>
                  </li> : null
                }
                {
                  payment.paymentFrequencyHours ?
                  <li>
                    <FormatTime value={payment.paymentFrequencyHours} unit="days" />
                    <span className="label">on average between consecutive payments</span>
                  </li> : null
                }
                {
                  payment.longestPaymentFrequencyHours ?
                  <li>
                    <FormatTime value={payment.longestPaymentFrequencyHours} unit="days" />
                    <span className="label">at maximum between consecutive payments</span>
                  </li> : null
                }
              </ul> 
            </Col>

            <div className="client-score-payment-chart">
              <Col xs={12} md={6}>
                <OverlayTrigger placement="bottom" overlay={howMuchPaidTooltip}>
                  <h4>How much am I paid?</h4>
                </OverlayTrigger>
                {
                  payAmountBreakdownCircle ?
                  <PieChart data={payAmountBreakdownCircle} options={{responsive: true}} /> :
                  <Well>Only available in for hourly payments.</Well>
                }
              </Col>
              <Col xs={12} md={6}>
                <OverlayTrigger placement="bottom" overlay={howSoonPaidTooltip}>
                  <h4>How soon am I paid?</h4>
                </OverlayTrigger>
                <PieChart data={payFrequencyBreakdownCircle} options={{responsive: true}} />
              </Col>
            </div>
          </div>
        </Col>

        {/* Client info */}
        <Col xs={12} md={4}>
          <div className="client-card">
            <h3>{timecard.clientName || "Client"}</h3>

            {/* percentage of time owed that has already been paid */}
            <div className="percent">
              {Math.round(payment.timePaid / payment.timeWorked * 1000) / 10}
            </div>

            <span className="client-card-payment-amount">
              Paid for
              <span className="a-unit">
                <FormatTime value={payment.timePaid} unit="days" />
                {payment.amountEarned ? `($${payment.amountEarned.toFixed(2)})` : null}
              </span>
              out of
              <span className="a-unit">
                <FormatTime value={payment.timeWorked} unit="days" />
                {payment.amountValued ? `($${payment.amountValued.toFixed(2)})` : null}
              </span>
            </span>
          </div>
        </Col>
      </Panel>
    </div>;
  } else {
    return null;
  }
}


export function Averages({
  timecard,
  commits,
  users,
  stats: {
    workActivityGraph,
  },
}) {
  if (assertIsCard(timecard) && Array.isArray(commits) && Array.isArray(users)) {
    let avgWorkPeriodLength = calculateAverageWorkPeriodLength(timecard),
        commitsPerWorkPeriod = calculateAverageCommitsPerWorkPeriod(timecard, commits),
        commitStats = calculateCommitStats(commits),
        avgCommitsPerUserPerWorkPeriod = calculateAverageCommitsPerContributorPerWorkPeriod(timecard, commits, users);

    // add colors to the graph (red = unpaid, green = paid)
    workActivityGraph = colorizeGraph(workActivityGraph, "Paid time", "#8ac450", "#73A443");
    workActivityGraph = colorizeGraph(workActivityGraph, "Unpaid time", "#c45151", "#AC5B5B");

    return <div className="repo-metrics">
      <Panel header="Work Time">
        <BarChart
          data={workActivityGraph}
          options={{
            responsive: true,
            scaleLabel: "<%= value %> hours",
          }}
        />

        <div className="average-modal">
          <Col xs={12} md={4}>
            <Panel footer="Average commits per contributor">
              <span className="average-stat sm">
                {Math.floor(avgCommitsPerUserPerWorkPeriod)}
                <span className="unit">commits per work period</span>
              </span>
            </Panel>
          </Col>
          <Col xs={12} md={4}>
            <Panel footer="Commits per average work period">
              <span className="average-stat">
                {Math.round(commitsPerWorkPeriod)}
                <span className="unit">commits</span>
              </span>
            </Panel>
          </Col>
          <Col xs={12} md={4}>
            <Panel footer="Average work period length">
              <span className="average-stat sm">
                {formatTime(avgWorkPeriodLength)}
              </span>
            </Panel>
          </Col>
        </div>

        <footer>
          From a sample of the last {commitStats.commits} commits since {commitStats.lastCommitTime.toString()}
        </footer>
      </Panel>
    </div>;
  } else {
    return null;
  }
}

// the color of a contributor based on their index
const CONTRIBUTOR_COLORS = [
  undefined,
  "success",
  "info",
  "warning",
  "danger"
];





// get total amount of times a user has contributed
function getTotalContributions(contributors) {
  let total = 0;
  Object.keys(contributors).forEach((i) => total += contributors[i]);
  return total
}

// show the 5 most prolific contributors, and lump all the rest into an "others"
// category
export function contributorBarGraph(contributors, useFirst=5) {
  let total = getTotalContributions(contributors),
      left = 100;

  // graph the first `useFirst` contributor's contributions
  let graphedContributors = _.unique(Object.keys(contributors))
  let mostProlificContributors = graphedContributors
  .slice(0, useFirst)
  .map((i, ct) => {
    let percentage = contributors[i] / total * 100;
    left -= percentage; // remove this part from the remainder of the bar
    return <ProgressBar
      bsStyle={CONTRIBUTOR_COLORS[ct]}
      now={percentage}
      label={i}
      key={ct}
    />
  });

  // the rest are lumped into the last category
  if (Object.keys(contributors).length > useFirst) {
    return [
      ...mostProlificContributors, 
      <ProgressBar
        now={left}
        striped
        label="Others"
        key={-1}
      />
    ];
  } else {
    return mostProlificContributors;
  }
}





export function Contributions({
  timecard,
  commits,
  users,
}) {
  if (assertIsCard(timecard) && Array.isArray(commits)) {
    let contributors = calculateContributors(timecard),
        totalContributions = getTotalContributions(contributors);

    return <div className="repo-metrics contributors-modal">
      <Panel header="Contributions">
        <ProgressBar>
          {contributorBarGraph(contributors)}
        </ProgressBar>

        {/* A list of all contributors */}
        <Col md={7} sm={12}>
          <ul className="contributors">
            {Object.keys(contributors).map((i, ct) => {
              return <li className="contributor-item" key={ct}>
                {getAvatarFor(users, i).avatar_img}
                <h3
                  className={`text-${CONTRIBUTOR_COLORS[ct % CONTRIBUTOR_COLORS.length] || "primary"}`}
                >{i}</h3>
                <span>
                  {contributors[i] === 1 ? "1 contribution " : `${contributors[i]} contributions `}
                  ({Math.floor(contributors[i] / totalContributions * 1000) / 10}%)
                </span>
              </li>;
            })}
          </ul>
        </Col>

        {/* A list of contributor stats */}
        <Col md={5} sm={12}>
          <ul>
            <li>{Object.keys(contributors).length} Contributors</li>
            {lastContribution({timecard})}
          </ul>
        </Col>

      </Panel>
    </div>;
  } else {
    return null;
  }
}

// "Last contribution made on date (by username)" label
export function lastContribution({timecard}) {
  let lastContribution = getLastContributor(timecard);
  if (lastContribution) {
    return <li>
      Last contribution made on&nbsp;
      {lastContribution.when.toDateString()}
      {lastContribution.author ? ` by ${lastContribution.author}` : null}
    </li>;
  } else {
    return null;
  }
}
