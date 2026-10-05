"""MkDocs hooks: links that point outside the site are sent to the repo on GitHub.

Folders left out of the site (see exclude_docs in mkdocs.yml) and bare folder
links still work when the files are read on GitHub, so the site follows them there.
"""

import posixpath
import re

REPO_TREE = "https://github.com/gi-org-pl/product/tree/main/mypolitics/"
OUTSIDE_SITE = ("tasks/",)

LINK = re.compile(r"(?<!!)\]\((\.{1,2}/[^)\s#]*)(#[^)\s]*)?\)")


def on_page_markdown(markdown, page, **kwargs):
    base = posixpath.dirname(page.file.src_uri)

    def rewrite(match):
        target = posixpath.normpath(posixpath.join(base, match.group(1)))
        if match.group(1).endswith("/"):
            target += "/"
        if not target.startswith(OUTSIDE_SITE):
            return match.group(0)
        return f"]({REPO_TREE}{target}{match.group(2) or ''})"

    return LINK.sub(rewrite, markdown)
