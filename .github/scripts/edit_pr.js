const fs = require('fs');

const { access, readFile } = fs.promises;


const file_path = "./build/output/reviewers_ids.txt";


async function readContentFromFile(file_path) {
  let result = "";

  try {
    await access(file_path, fs.F_OK);
    result = await readFile(file_path, 'utf-8');
    if (result.length == 0) {
      return "";
    }
  } catch (err) {
    console.error(`Could not read the file ${file_path}.`, err);
    return "";
  }

  return result;
}


async function update_pr_with_reviewers(github, context, title) {
  const rev_ids = await readContentFromFile(file_path);
  console.log(`rev_ids:`, rev_ids);

  const rev_id_list =
    rev_ids
    .split("\n")
    .map(i => i.replace(/(\r\n|\n|\r)/gm, ""))
    .filter(i => i.trim().length);

  let rev_id_str = "";
  if (rev_id_list.length === 0) {
    rev_id_str = "No automatic reviewers added."
  } else {
    rev_id_list.map(item => `@${item}`).join(", ");
  }
  console.log(`rev_id_list: `, rev_id_list);
  console.log(`rev_id_str: `, rev_id_str);

  console.log("pull_request number:", context.payload.number);
  console.log("pull_request body:", context.payload.pull_request.body);
  // console.log("------------------");
  // console.log("github:");
  // console.dir(github);
  // console.log("------------------");
  // console.log("context:");
  // console.dir(context);

  let body = context.payload.pull_request.body;
  const auto_revs_pos = body.indexOf(title);
  if (auto_revs_pos > -1) {
    body = body.substring(0, auto_revs_pos);
  }
  let new_body = body + `\n${title}\n\n${rev_id_str}`;

  // Clean up multiple blank lines.
  // console.log("New body:", new_body);
  // const EOL = new_body.match(/\r\n/gm) ? "\r\n" : "\n";
  // console.log("EOL:", EOL);
  // const regExp = new RegExp("(" + EOL + "){3,}", "gm");
  // new_body = new_body.replace(regExp, EOL+EOL);
  // console.log("New body after replace:", new_body);

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
