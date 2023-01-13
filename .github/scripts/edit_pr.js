const fs = require('fs');

const { get_branch_protection } = require('./utils');


const { access, readFile } = fs.promises;

const OWNER = 'witmeet';
const REPO = 'check-auto-revs';
const GET_PR_URL = 'GET /repos/{owner}/{repo}/pulls/{pull_number}';
const GET_REVIEWS_URL = '/repos/{owner}/{repo}/pulls/{pull_number}/reviews';

const reviewers_ids_path = "./build/output/reviewers_ids.txt";
const reviewers_report_path = "./build/output/reviewers_report.md";


async function readContentFromFile(reviewers_ids_path) {
  let result = "";

  try {
    await access(reviewers_ids_path, fs.F_OK);
    result = await readFile(reviewers_ids_path, 'utf-8');
    if (result.length == 0) {
      return "";
    }
  } catch (err) {
    console.error(`Could not read the file ${reviewers_ids_path}.`, err);
    return "";
  }

  return result;
}


async function get_pr_reviews(octokit, pull_number) {
  const response = await octokit.request(GET_REVIEWS_URL, {
    owner: OWNER,
    repo: REPO,
    pull_number: pull_number
  });

  return response.status !== 200 ? null : response.data;
}

function is_approved_by_user(reviews, username) {
  const res = reviews.filter(
    item => item.user.login === username && item.state === "APPROVED"
  );
  if (res.length === 1) {
    return true;
  }
  return false;
}


async function automatic_pr_update(octokit, github, context, title) {
  const rev_ids = await readContentFromFile(reviewers_ids_path);
  const rev_report = await readContentFromFile(reviewers_report_path);
  const pr_number = context.payload.number;

  const response = await octokit.request(GET_PR_URL, {
    owner: OWNER,
    repo: REPO,
    pull_number: pr_number
  });

  if (response.status !== 200) {
    console.log("Could not read the latest state of the PR");
    console.dir(response);
    process.exit(1);
  }

  const { data: pr_data } = response;

  let valid_reviewer_list = null;

  const rev_id_list =
    rev_ids
    .split("\n")
    .map(i => i.replace(/(\r\n|\n|\r)/gm, ""))
    .filter(i => i.trim().length)
    .filter(i => i !== pr_data.user.login);
  // console.log("rev_id_list:", rev_id_list);
  // console.log("submitter:", pr_data.user.login);

  let dismiss_approved_reviews = false;
  const branch_protection = await get_branch_protection(octokit, "main");

  if (branch_protection && branch_protection.required_pull_request_reviews) {
    const { required_pull_request_reviews } = branch_protection;
    const { dismiss_stale_reviews } = required_pull_request_reviews;
    dismiss_approved_reviews = dismiss_stale_reviews;
  }
  console.log("Dismiss approved reviews?", dismiss_approved_reviews);

  if (dismiss_approved_reviews === true) {
    valid_reviewer_list = rev_id_list;
  } else {
    valid_reviewer_list = [];
    const reviews = await get_pr_reviews(octokit, pr_number);
    for (const username of rev_id_list) {
      const is_approved = is_approved_by_user(reviews, username);
      // If the user didn't approved yet, send another review request.
      if (!is_approved) {
        valid_reviewer_list.push(username);
      }
    }
  }

  console.log("Final list of reviewers:", valid_reviewer_list);

  let body = pr_data.body;
  const auto_revs_pos = body.indexOf(title);
  if (auto_revs_pos > -1) {
    body = body.substring(0, auto_revs_pos);
  }

  // If the reviewers_report.md has content, append it to PR's body.
  if (rev_report.length > 0) {
    body = body + `\n${rev_report}`;
  }

  if (github) {
    // Update the body of the PR.
    github.rest.pulls.update({
      owner: context.repo.owner,
      repo:  context.repo.repo,
      pull_number: context.payload.number,
      body: body
    });

    // Add the reviewers to the PR.
    github.rest.pulls.requestReviewers({
      owner: context.repo.owner,
      repo:  context.repo.repo,
      pull_number: context.payload.number,
      reviewers: valid_reviewer_list
    });
  } else {
    console.log("New body:", body);
    console.log("New list of reviewers:", valid_reviewer_list);
  }
}

module.exports = {
  automatic_pr_update
}
