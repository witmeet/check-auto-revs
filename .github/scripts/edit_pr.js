
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


async function update_pr_with_reviewers(github, context) {
  const rev_ids = await readContentFromFile(file_path);
  const rev_id_list = rev_ids.split("\n");

  console.log("pull_request number:", context.payload.number);
  console.log("pull_request body:", context.payload.pull_request.body);
  console.log(`rev_ids:`, rev_ids);
  // console.log("------------------");
  // console.log("github:");
  // console.dir(github);
  console.log("------------------");
  console.log("context:");
  console.dir(context);

  rev_id_list.forEach(item => {
    const gh_id = item.trim();
    console.log(`I need to add ${gh_id} as a reviewer`);
  });

  const new_body = (
    context.payload.pull_request.body +
    `\n\n### Automatic reviewers

${rev_id_list.map(item => `@${item}`).join(", ")}
`);

  github.rest.pulls.update({
    owner: context.repo.owner,
    repo:  context.repo.repo,
    pull_number: context.payload.number,
    body: new_body
  })
}

module.exports = ({github, context}) => {
  return update_pr_with_reviewers(github, context);
}
