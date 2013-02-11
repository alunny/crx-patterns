/* matches against chrome extension match URLs
 *
 * <url-pattern> := <scheme>://<host><path>
 * <scheme> := '*' | 'http' | 'https' | 'file' | 'ftp' | 'chrome-extension'
 * <host> := '*' | '*.' <any char except '/' and '*'>+
 * <path> := '/' <any chars>
 *
 */
(function (exports) { 
    var SCHEMES = ['http', 'https', 'file', 'ftp', 'chrome-extension'],
        R_CHURL = /^([-*\w]+):\/\/([^\/]*)(\/.*)/;

    function ChromeURL(input) {
        var matches;

        this.url = input;

        if (!R_CHURL.test(input)) {
            console.log('no match');
            return;
        } else {
            matches = input.match(R_CHURL);

            this.scheme = matches[1];
            this.host   = matches[2];
            this.path   = matches[3];
        }
    }

    function MatchPattern(input) {
        var matches;

        this.pattern = input;

        // magic value
        if (input == '<all_urls>') {
            this.scheme = '*';
            this.host = '*';
            this.path = '*';

            return this;
        }
        
        if (!R_CHURL.test(input))
            throw new Error('not a valid pattern');

        matches = input.match(R_CHURL);

        this.scheme = matches[1];
        this.host   = matches[2];
        this.path   = matches[3];

        if (this.scheme != '*' && SCHEMES.indexOf(this.scheme) < 0)
            throw new Error('invalid scheme');

        this.host = validateHost(this.host);

        if (this.host != '*' && this.host.indexOf('*') >= 0) {
            this.r_host = new RegExp('^' + (this.host.replace(/^\*\./, '*')
                                                    .replace(/\*/g, '.*')) + '$');
        }

        if (this.path != '*' && this.path.indexOf('*') >= 0) {
            this.r_path = new RegExp('^' + this.path.replace(/\*/g, '.*') + '$');
        }
    }

    function validateHost(host) {
        var star;

        if (!host.match(/\*/) || host == '*')
            return host;

        star = host.indexOf('*');

        if (star != 0) {
            throw new Error('"*" in host must be first character');
        }

        if (host.length > star + 1 && host.charAt(star + 1) != '.') {
            throw new Error('"*" in the host can be followed only by a "." or "/"');
        }

        return host;
    }

    MatchPattern.prototype.match = function (input) {
        var input = new ChromeURL(input);

        // check for valid URL
        if ((typeof input.scheme) != 'string') {
            return false;
        }

        // check for scheme mismatch
        if (SCHEMES.indexOf(input.scheme) < 0) {
            return false;
        } else if (this.scheme != '*' && input.scheme != this.scheme) {
            return false;
        }

        // check for host mismatch
        if (this.host != '*' && this.host != input.host) {
            if (!this.r_host || !this.r_host.test(input.host)) {
                return false;
            }
        }

        // check for path mismatch
        if (this.path != '*' && this.path != input.path) {
            if (!this.r_path || !this.r_path.test(input.path)) {
                return false;
            }
        }

        return true;
    }

    exports.MatchPattern    = MatchPattern;
    exports.ChromeURL       = ChromeURL;

})(typeof exports === 'undefined'? this['MatchPatterns']={}: exports);
