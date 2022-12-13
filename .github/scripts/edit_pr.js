const fs = require('fs');

const { access, readFile } = fs.promises;


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


async function update_pr_with_reviewers(github, context, title) {
  const rev_ids = await readContentFromFile(reviewers_ids_path);
  const rev_report = await readContentFromFile(reviewers_report_path);

  console.log(`rev_ids:`, rev_ids);

  const rev_id_list =
    rev_ids
    .split("\n")
    .map(i => i.replace(/(\r\n|\n|\r)/gm, ""))
    .filter(i => i.trim().length);

  let body = context.payload.pull_request.body;
  const auto_revs_pos = body.indexOf(title);
  if (auto_revs_pos > -1) {
    body = body.substring(0, auto_revs_pos);
  }

  // If the reviewers_report.md has content, append it to PR's body.
  if (rev_report.length > 0) {
    body = body + `\n${rev_report}`;
  }

  console.log("pull_request number:", context.payload.number);
  console.log("pull_request body:", context.payload.pull_request.body);
  // console.log("------------------");
  // console.log("github:");
  // console.dir(github);
  // console.log("------------------");
  // console.log("context:");
  // console.dir(context);

  // Update the body of the PR.
  github.rest.pulls.update({
    owner: context.repo.owner,
    repo:  context.repo.repo,
    pull_number: context.payload.number,
    body: new_body
  });

  // Add the reviewers to the PR.
  github.rest.pulls.requestReviewers({
    owner: context.repo.owner,
    repo:  context.repo.repo,
    pull_number: context.payload.number,
    reviewers: rev_id_list
  });
}

module.exports = ({github, context, title}) => {
  return update_pr_with_reviewers(github, context, title);
}
