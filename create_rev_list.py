import argparse
import os
import sys
import traceback


def create_revs_file(output_dir="./"):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    output_txt_file = os.path.join(output_dir, "reviewers_ids.txt")
    with open(output_txt_file, "w") as output:
        output.write("dani4wm\r\n")
        # output.write("")

    output_txt_file = os.path.join(output_dir, "reviewers_report.md")
    with open(output_txt_file, "w") as output:
        output.write("### Automatic reviewers\n\n")
        output.write(
            "The following group of people has been added automatically "
            "as reviewers to this PR:\n\n"
        )
        output.write(
            " * Daniela Rus Morales (dani4wm) because of changes in "
            "blah blah blah...\n"
        )
    return 0


def run():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "-o", dest="output_dir", default="./", help="Path to output directory"
    )

    args = parser.parse_args()

    try:
        ret_code = create_revs_file(args.output_dir)
    except Exception:
        traceback.print_exc()
        ret_code = 1

    return ret_code


if __name__ == "__main__":
    sys.exit(run())
