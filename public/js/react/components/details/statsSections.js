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
} from 'react-bootstrap';
import _ from 'underscore';
import {Line as LineChart} from 'react-chartjs';


export function Client({
  timecard,
  commits,
  users,
  stats: {
    workActivityGraph,
  },
}) {
  if (assertIsCard(timecard) && Array.isArray(commits) && Array.isArray(users)) {
    return <div className="repo-metrics">
      <div className="client-score">
      </div>
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
      <Panel header="Work Periods">
        <LineChart
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
