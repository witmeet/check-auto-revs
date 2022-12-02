
// const edit_pr_body = require('./.github/scripts/edit_pr_body.js');
// const res1 = await github.request(`/repos/{owner}/{repo}/pulls/{pull_number}`, {
//   owner: context.repo.owner,
//   repo: context.repo.repo,
//   pull_number: context.issue.number
// });
// console.log("Response status: ", res1.status);
// console.log("PR body: ", res1.data.body);
// const new_body = await edit_pr_body(res1.data.body);

// const res2 = await.github.request(`PATCH /repos/{owner}/{repo}/pulls/{pull_number}`, {
//   owner: context.repo.owner,
//   repo: context.repo.repo,
//   pull_number: context.issue.number,
//   body: new_body
// });


const fs = require('fs');

const { access, readFile } = fs.promises;


const file_path = "./build/output/reviewers_ids.txt";


async function readContentFromFile(file_path) {
  let result = "";

  try {
    await access(file_path, fs.F_OK);
    result = await readFile(file_path);
    if (result.length == 0) {
      return "";
    }
  } catch (err) {
    console.error(`Could not read the file ${file_path}.`, err);
    return "";
  }

  return result;
}


async function getNewBody(github, context) {
  const rev_ids = await readContentFromFile(file_path);
  console.log("pull_request number:", context.payload.number);
  console.log("pull_request body:", context.payload.pull_request.body);
  console.log(`rev_ids:`, rev_ids);
  // console.log("------------------");
  // console.log("github:");
  // console.dir(github);
  console.log("------------------");
  console.log("context:");
  console.dir(context);
}

module.exports = ({github, context}) => {
  return getNewBody(github, context);
}
