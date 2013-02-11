var mp = require('./matchPatterns'),
    MatchPattern = mp.MatchPattern,
    ChromeURL = mp.ChromeURL,

    assert = require('assert'),
    matcher, url;

    // test urls chrome provides
    url = new ChromeURL('http://example.org/foo/bar.html');
    assert.equal('http', url.scheme);
    assert.equal('example.org', url.host);
    assert.equal('/foo/bar.html', url.path);

    url = new ChromeURL('chrome-extension://askla...asdf/options.html');
    assert.equal('chrome-extension', url.scheme);
    assert.equal('askla...asdf', url.host);
    assert.equal('/options.html', url.path);

    url = new ChromeURL('file:///foo');
    assert.equal('file', url.scheme);
    assert.equal('', url.host);
    assert.equal('/foo', url.path);

    // <all_urls> Matches any URL that uses a permitted scheme
    matcher = new MatchPattern('<all_urls>');
    assert(matcher.match('http://example.org/foo/bar.html'));
    assert(matcher.match('file:///bar/baz.html'));
    assert.equal(false, matcher.match('poop:///bar/baz.html'));

    // http ://*/*   Matches any URL that uses the http scheme    
    matcher = new MatchPattern('http://*/*');
    assert(matcher.match('http://www.google.com/'));
    assert(matcher.match('http://example.org/foo/bar.html'));
    assert.equal(false, matcher.match('https://google.com/foo'));

    // http ://*/foo*    Matches any URL that uses the http scheme, on any host,
    // as long as the path starts with /foo
    matcher = new MatchPattern('http://*/foo*');
    assert(matcher.match('http://example.com/foo/bar.html'));
    assert(matcher.match('http://www.google.com/foo'));
    assert.equal(false, matcher.match('http://google.com/boofooboo'));

    // https://*.google.com/foo*bar     Matches any URL that uses the https
    // scheme, is on a google.com host (such as www.google.com, docs.google.com,
    // or google.com), as long as the path starts with /foo and ends with bar 
    matcher = new MatchPattern('https://*.google.com/foo*bar');
    assert(matcher.match('https://www.google.com/foo/baz/bar'));
    assert(matcher.match('https://docs.google.com/foobar'));
    assert(matcher.match('https://google.com/foo/ba/bar'));
    assert.equal(false, matcher.match('https://docs.google.com/foo'));
    assert.equal(false, matcher.match('http://www.google.com/foobar'));
    assert.equal(false, matcher.match('https://rutube.com/foo/ba/bar'));

    // http://example.org/foo/bar.html Matches the specified URL
    matcher = new MatchPattern('http://example.org/foo/bar.html');
    assert(matcher.match('http://example.org/foo/bar.html'));
    assert.equal(false, matcher.match('https://example.org/foo/bar.html'));
    assert.equal(false, matcher.match('http://nix.org/foo/bar.html'));
    assert.equal(false, matcher.match('http://example.org/foo/bar.shtml'));

    // file:///foo*    Matches any local file whose path starts with /foo
    matcher = new MatchPattern('file:///foo*');
    assert(matcher.match('file:///foo/bar.html'));
    assert(matcher.match('file:///foo'));
    assert.equal(false, matcher.match('https:///foo'));
    assert.equal(false, matcher.match('file://network/foo'));
    assert.equal(false, matcher.match('file:///goo'));
 
    // http://127.0.0.1/*   Matches any URL that uses the http scheme and is on
    // the host 127.0.0.1
    matcher = new MatchPattern('http://127.0.0.1/*');
    assert(matcher.match('http://127.0.0.1/'));
    assert(matcher.match('http://127.0.0.1/foo/bar.html'));
    assert.equal(false, matcher.match('file://127.0.0.1/foo/bar.html'));
    assert.equal(false, matcher.match('http://12a.0.0.1/foo/bar.html'));

    // *://mail.google.com/*    Matches any URL that starts with
    // http://mail.google.com or https://mail.google.com.  
    matcher = new MatchPattern('*://mail.google.com/*');
    assert(matcher.match('http://mail.google.com/foo/baz/bar'));
    assert(matcher.match('https://mail.google.com/foobar'));
    assert.equal(false, matcher.match('https://docs.google.com/foobar'));

    // chrome-extension://*_/*   Matches any URL pointing to an extension (the
    // first * represents a filter for extension IDs, the second for paths).   
    matcher = new MatchPattern('chrome-extension://*/*');
    assert(matcher.match('chrome-extension://asklaunununasdf/options.html'));
    assert.equal(false, matcher.match('file://asklaunununasdf/options.html'));

    // rejected patterns
    // no path
    assert.throws(function () {
        new MatchPattern('http://www.google.com');
    });

    // Missing scheme separator ("/" should be "//")
    assert.throws(function () {
        new MatchPattern('http:/bar/');
    });

    // Invalid scheme
    assert.throws(function () {
        new MatchPattern('foo://*/');
    });

    // If '*' is in the host, it must be the first character
    assert.throws(function () {
        new MatchPattern('http://foo.*.bar/baz');
    });

    // '*' in the host can be followed only by a '.' or '/'
    assert.throws(function () {
        new MatchPattern('http://*foo/bar');
    });
