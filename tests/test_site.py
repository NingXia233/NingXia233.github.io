"""Regression checks for the built site; run after `bundle exec jekyll build`."""
from html.parser import HTMLParser
from pathlib import Path
import os
import re
import unittest
from urllib.parse import unquote, urlsplit, parse_qs

ROOT = Path(__file__).resolve().parents[1]
SITE = Path(os.environ.get('SITE_DIR', ROOT / '_site'))


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links = []
        self.scripts = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
        if tag == 'script':
            self.scripts.append(attrs)


class SiteTests(unittest.TestCase):
    def test_math_survives_markdown(self):
        text = (SITE / 'In-Memorial-of-CNY.html').read_text()
        self.assertIn(r'\(Y^{ab}_{ij}\)', text)
        self.assertNotIn('Y^{ab}<em>', text)
        text = (SITE / 'Many-Body-Physics-Numeric-dmrg1.html').read_text()
        self.assertIn(r'\(\{\vert a\rangle\}\)', text)
        self.assertIn(r'\(\mathcal{H}_i\)', text)
        self.assertIn(r'\sum_{\{s_n\}}', text)
        self.assertIn(r'\[', text)
        self.assertIn('tex2jax_process', text)
        text = (SITE / 'Ultracold-Atomic-Physics.html').read_text()
        article = text.split('<article', 1)[1].split('</article>', 1)[0]
        self.assertNotIn('$$', article)
        self.assertIn(r'\(\Pi_1(S^1)\)', article)

    def test_existing_formulas_reach_built_articles(self):
        for post in (ROOT / '_posts').glob('*.md'):
            with self.subTest(post=post.name):
                source = re.sub(r'```.*?```', '', post.read_text(), flags=re.S)
                slug = re.sub(r'^\d{4}-\d{1,2}-\d{1,2}-', '', post.stem)
                text = (SITE / (slug + '.html')).read_text()
                article = text.split('<article', 1)[1].split('</article>', 1)[0]
                protected = article.count(r'\(') + article.count(r'\[')
                self.assertEqual(source.count('$$') // 2, protected)

    def test_home_has_plain_summaries(self):
        text = (SITE / 'index.html').read_text().split('<body', 1)[1]
        self.assertNotIn(r'\[', text)
        self.assertNotIn(r'\(', text)
        self.assertNotIn('$$', text)
        self.assertIn('学习笔记', text)
        self.assertIn('阅读全文', text)
        self.assertEqual(len(re.findall(r'<h1\b', text)), 1)

    def test_personal_identity_and_no_old_comment_clients(self):
        for page in SITE.rglob('*.html'):
            with self.subTest(page=page.name):
                text = page.read_text()
                for old in ['new Valine', 'Valine.min.js', 'av-min.js', 'disqus.com',
                            'the Jekyll theme Lagrange', 'google-analytics.com/analytics.js']:
                    self.assertNotIn(old, text)
        self.assertIn('Ning Xia', (SITE / 'index.html').read_text())
        self.assertTrue((ROOT / 'LICENSE.md').read_text().startswith('# The MIT License'))

    def test_internal_navigation_resolves(self):
        for page in SITE.rglob('*.html'):
            for url in Document(page.read_text()).links:
                parts = urlsplit(url)
                path = unquote(parts.path)
                if parts.scheme or parts.netloc or not path.startswith('/'):
                    continue
                dest = SITE / path.lstrip('/')
                if dest.is_dir():
                    dest /= 'index.html'
                elif not dest.suffix and dest.with_suffix('.html').is_file():
                    # Jekyll serve and GitHub Pages resolve extensionless permalinks.
                    dest = dest.with_suffix('.html')
                with self.subTest(page=page.name, link=url):
                    self.assertTrue(dest.exists(), url)

    def test_discussions_links_keep_article_context(self):
        text = (SITE / 'Auto-Differentiation.html').read_text()
        links = Document(text).links
        new = next(url for url in links if '/discussions/new?' in url)
        query = parse_qs(urlsplit(new).query)
        self.assertIn('机器学习笔记：概论与自动微分', query['title'][0])
        self.assertIn('https://ningxia233.github.io/Auto-Differentiation', query['body'][0])
        lookup = next(url for url in links if '/discussions?discussions_q=' in url)
        self.assertIn('in:title', parse_qs(urlsplit(lookup).query)['discussions_q'][0])
        board = (SITE / 'guestbook/index.html').read_text()
        self.assertIn('https://github.com/NingXia233/NingXia233.github.io/discussions', board)
        self.assertNotIn('localStorage', board)

    def test_home_and_guestbook_share_a_discussion(self):
        home = (SITE / 'index.html').read_text()
        board = (SITE / 'guestbook/index.html').read_text()
        widgets = []
        for text in [home, board]:
            self.assertEqual(text.count('id="guestbook"'), 1)
            self.assertNotIn('localStorage', text)
            scripts = [s for s in Document(text).scripts
                       if s.get('src') == 'https://giscus.app/client.js']
            self.assertLessEqual(len(scripts), 1)
            widgets.extend(scripts)
        self.assertIn('/#guestbook', home)
        self.assertIn('/#guestbook', board)
        if 'GISCUS_EXPECTED' in os.environ:
            self.assertEqual(bool(widgets), os.environ['GISCUS_EXPECTED'] == '1')
        if widgets:
            self.assertEqual(len(widgets), 2)
            self.assertEqual(widgets[0], widgets[1])
            self.assertEqual(widgets[0]['data-repo'], 'NingXia233/NingXia233.github.io')
            self.assertTrue(widgets[0]['data-repo-id'])
            self.assertTrue(widgets[0]['data-term'])
            self.assertIn(widgets[0]['data-mapping'], ['number', 'specific'])
            if widgets[0]['data-mapping'] == 'number':
                self.assertGreater(int(widgets[0]['data-term']), 0)
            else:
                self.assertTrue(widgets[0]['data-category-id'])
        else:
            for text in [home, board]:
                self.assertIn('https://github.com/NingXia233/NingXia233.github.io/discussions', text)


if __name__ == '__main__':
    unittest.main()
