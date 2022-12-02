const fs = require('fs');

const { access, readFile } = fs.promises;


const file_path = "./build/output/reviewers_ids.txt";


async function readFile(file_path) {
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
  const rev_ids = await readFile(file_path);
  console.log(`rev_ids:`, rev_ids);
  console.log("------------------");
  console.log("github:");
  console.dir(github);
  console.log("------------------");
  console.log("context:");
  console.dir(context);
}

module.exports = () => {
  return getNewBody();
}
