import os
import sys

from github import Github


g = Github()


def print_reviewers(pr):
    reviewers = pr.get_review_requests()
    for rev in reviewers:
        for page_num in range(0, rev.totalCount):
            list_of_users = rev.get_page(page_num)
            for user in list_of_users:
                print("reviewer:", user.login)

def add_reviewers(pr, reviewers_id_list):
    # Delete a reviewer.
    pr.delete_review_request(reviewers=["dani4wm",])
    # pr.create_review_request(reviewers=reviewers_id_list)


def update_body(pr, reviewers_report, title_hook):
    body = pr.body
    auto_revs_pos = body.find(title_hook)
    if auto_revs_pos > -1:
        body = body[0:auto_revs_pos]
    pr.edit(body=body + reviewers_report)


def run(reviewers_report_path, reviewers_ids_path, delete_prefix, title_hook):
    GHT = os.environ.get("GITHUB_TOKEN", None)
    if GHT is None:
        print("Found no environment variable GITHUB_TOKEN.")
        return 1

    reviewers_ids = open(reviewers_ids_path, "r").read()
    reviewers_report = open(reviewers_report_path, "r").read()

    rev_id_list = reviewers_ids.split("\n")
    rev_id_list = [i.strip().replace(delete_prefix, "") for i in rev_id_list]

    g = Github(GHT)

    repo = g.get_repo("witmeet/check-auto-revs")
    pr = repo.get_pull(2)
    update_body(pr, reviewers_report, title_hook)
    add_reviewers(pr, rev_id_list)


if __name__ == "__main__":
    sys.exit(
        run(
            "build/output/reviewers_report.md",  # reviewers_ids_path
            "build/output/reviewers_ids.txt",    # reviewers_report_path
            "PERS_",                             # delete_prefix
            "### Automatic reviewers",           # title_hook
        )
    )
