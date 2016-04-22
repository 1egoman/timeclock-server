import React from 'react';
import {
  calculateAverageWorkPeriodLength,
  calculateAverageCommitTime,
  calculateAverageCommitsPerWorkPeriod,
  calculateAverageCommitsPerContributorPerWorkPeriod,
  calculateCommitStats,
  calculateContributors,
  formatTime,
  assertIsCard,
} from "../../helpers/stats";
import {getAvatarFor} from '../../helpers/timecard';
import {
  Panel,
  Col,
  ProgressBar,
} from 'react-bootstrap';
import _ from 'underscore';

export function Averages({
  timecard,
  commits,
  users,
}) {
  if (assertIsCard(timecard) && Array.isArray(commits) && Array.isArray(users)) {
    let avgWorkPeriodLength = calculateAverageWorkPeriodLength(timecard),
        commitsPerWorkPeriod = calculateAverageCommitsPerWorkPeriod(timecard, commits),
        avgCommitsPerUserPerWorkPeriod = calculateAverageCommitsPerContributorPerWorkPeriod(timecard, commits, users);

    return <div>
      <h3>Averages</h3>
      <p>
        On average, a work period is {formatTime(avgWorkPeriodLength)} long,
        with {formatTime(avgWorkPeriodLength)} spent between consecutive commits.
        In an average work period, {Math.floor(commitsPerWorkPeriod)} commits
        are made, with {Math.floor(avgCommitsPerUserPerWorkPeriod)} made by
        each contributor.
      </p>
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
        commitStats = calculateCommitStats(commits),
        totalContributions = getTotalContributions(contributors);

    return <div className="repo-metrics contributors-modal">
      <Panel header="Contributions">
        <ProgressBar>
          {contributorBarGraph(contributors)}
        </ProgressBar>

        {/* A list of all contributors */}
        <Col md={8} sm={12}>
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
        <Col md={4} sm={12}>
          <ul>
            <li>Contributor Count: {Object.keys(contributors).length}</li>
            <li>Velocity: X commits per week</li>
          </ul>
        </Col>

        <footer>
          From a sample of the last {commitStats.commits} contributions since {commitStats.lastCommitTime.toString()}
        </footer>
      </Panel>
    </div>;
  } else {
    return null;
  }
}
