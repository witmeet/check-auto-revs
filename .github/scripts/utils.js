const OWNER = "witmeet";
const REPO = "check-auto-revs";
const URL = "/repos/{owner}/{repo}/branches/{branch}/protection";


async function get_branch_protection(octokit, branch) {
    try {
        const response = await octokit.request(URL, {
            owner: OWNER,
            repo: REPO,
            branch: branch,
        });

        if (response.status !== 200) {
            return response.data ? response.data : null;
        }

        return response.data;

    } catch(error) {
        return (error.response && error.response.data)
            ? error.response.data
            : null;
    }
}


module.exports = {
    get_branch_protection
}
