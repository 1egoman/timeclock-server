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

export function Contributions({
  timecard,
  commits,
}) {
  // display contributor info nicely
  function formatContributors(contributors, max=5) {
    if (contributors.length > max) {
      return `${contributors.slice(max).join(", ")}, and more`
    } else {
      return contributors.join(", ");
    }
  }

  if (assertIsCard(timecard) && Array.isArray(commits)) {
    let contributors = calculateContributors(timecard),
        commitStats = calculateCommitStats(commits);
    return <div>
     <h3>Contributions</h3>
     <p>
      Each of this project's {contributors.length} contributor(s) ({formatContributors(contributors)}) have pushed {commitStats.commits} commits
      since {commitStats.lastCommitTime.toString()}. In the last week, contributions have
      increased n% when compared to the previous week.
     </p>
    </div>;
  } else {
    return null;
  }
}
