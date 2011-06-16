/***********************************************************************************************
 * InfoMachine
 *
 *
 * Copyright (c) 2010 Casey Grun
 *
 ***********************************************************************************************
 * ~/client/objects/element.js
 *
 * Defines {Workspace.ElementObject} subclasses ({Workspace.Object}s built around simple,
 * non-vector graphic HTML elements)
 ***********************************************************************************************/

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.ImageObject
 * Represents a workspace object containing an image
 * @extends Workspace.ElementObject
 */
Workspace.ImageObject = function(workspace, config) {
    Workspace.ImageObject.superclass.constructor.call(this, workspace, config);

    Ext.apply(this.elementSpec, {
        tag: 'div',
        cls: 'image'
    });

    this.expose('url', true, true, true, false);
    //'getText', 'setText'); //,'text','string');
    this.on('change_url', this.setText, this)
};
Ext.extend(Workspace.ImageObject, Workspace.ElementObject, {
    wtype: 'Workspace.ImageObject',
    name: 'New Image',
    iconCls: 'image-icon',
    /**
     * @cfg {String} url
     * URL to the image to be displayed
     */
    url: '/canvas/uploads/',
    render: function() {
        // build inner HTML
        this.elementSpec.html = '<img src="' + this.get('url') + '" />';
        Workspace.ImageObject.superclass.render.call(this, arguments);

        // auto-calculate position and dimensions if not specified in config
        if (this.get('width') == 0) {
            $(this.getImageEl().dom).load( function() {
                var imageEl = this.getImageEl();
                this.set('width', imageEl.getWidth());
                this.set('height', imageEl.getHeight());
                /*
                 this.set('x', this.getX());
                 this.set('y', this.getY());
                 */
            }.createDelegate(this))
        }
    },
    getUrl: function() {
        return this.get('url');
        //this.text;
    },
    /**
     * setUrl
     * Updates the URL; called automatically when url property is set
     * @private
     * @param {Object} value
     */
    setUrl: function(value) {
        this.getImageEl().set({
            src: value
        });
    },
    /**
     * getImageEl
     * Returns the DOM img element
     * @return {Ext.Element}
     */
    getImageEl: function() {
        if (this.getEl())
            return this.getEl().child('img');
    },
    /**
     * updateWidth
     * Updates the element's dimensions. Called automatically when width property is changed
     * @param {Object} w
     */
    updateWidth: function(w) {
        this.getImageEl().setWidth(w);
        Workspace.ImageObject.superclass.updateWidth.apply(this, arguments);
    },
    /**
     * updateHeight
     * Updates the element's dimensions. Called automatically when height property is changed
     * @param {Object} h
     */
    updateHeight: function(h) {
        this.getImageEl().setHeight(h);
        Workspace.ImageObject.superclass.updateHeight.apply(this, arguments);
    }
});

Workspace.reg('Workspace.ImageObject', Workspace.ImageObject);
////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.EmbedObject
 * Represents a workspace object containing an embed.ly preview
 * @extends Workspace.ElementObject
 */
Workspace.EmbedObject = function(workspace, config) {
    Workspace.EmbedObject.superclass.constructor.call(this, workspace, config);

    Ext.apply(this.elementSpec, {
        tag: 'div',
        cls: 'embed'
    });

    this.expose('url', true, true, true, false);
    //'getText', 'setText'); //,'text','string');
    this.on('change_url', this.updateUrl, this)
};
Ext.extend(Workspace.EmbedObject, Workspace.ElementObject, {
    wtype: 'Workspace.EmbedObject',
    name: 'New Web Object',
    iconCls: 'image-icon',
    width: 300,
    height: 300,
    /**
     * @cfg {String} url
     * URL to the image to be displayed
     */
    url: '/canvas/uploads/',
    render: function() {
        // build inner HTML
        this.elementSpec.html = '<div></div>';
        Workspace.EmbedObject.superclass.render.call(this, arguments);
        this.innerEl = this.getEl().child('div');
        this.updateUrl(this.get('url'));
    },
    updateDimensions: function() {
        // auto-calculate position and dimensions if not specified in config
        if (this.getWidth() == 0) {
            this.set('width', this.getEl().getWidth());
            this.set('height', this.getEl().getHeight());
            this.set('x', this.getX());
            this.set('y', this.getY());
        }
    },
    getUrl: function() {
        return this.get('url');
        //this.text;
    },
    /**
     * updateUrl
     * Updates the URL; called automatically when url property is set
     * @private
     * @param {Object} value
     */
    updateUrl: function(value) {
        var opts = {
            elems: $(this.getEl().dom),
            success: this.embedlify.createDelegate(this)
        }, w = this.get('width'), h = this.get('height');
        //if(w) { opts.maxWidth = w; }
        //if(h) { opts.maxHeight = h; }
        $.embedly(value,opts);

    },
    embedlify: function(oembed, dict) {
        switch(oembed.type) {
            case 'photo':
                this.getInnerEl().update('<img src="'+oembed.url+'" />')
                break;
            default:
                this.getInnerEl().update(oembed.html);
        }
        this.set('width',oembed.width);
        this.set('height',oembed.height);
    },
    getInnerEl: function() {
        return this.innerEl;
    },
    /**
     * updateWidth
     * Updates the element's dimensions. Called automatically when width property is changed
     * @param {Object} w
     */
    updateWidth: function(w) {
        this.getInnerEl().setWidth(w);
        Workspace.EmbedObject.superclass.updateWidth.apply(this, arguments);
    },
    /**
     * updateHeight
     * Updates the element's dimensions. Called automatically when height property is changed
     * @param {Object} h
     */
    updateHeight: function(h) {
        this.getInnerEl().setHeight(h);
        Workspace.EmbedObject.superclass.updateHeight.apply(this, arguments);
    }
});

Workspace.reg('Workspace.EmbedObject', Workspace.EmbedObject);

Workspace.EmbedObject.regex = /http:\/\/(.*youtube\.com\/watch.*|.*\.youtube\.com\/v\/.*|youtu\.be\/.*|.*\.youtube\.com\/user\/.*|.*\.youtube\.com\/.*#.*\/.*|m\.youtube\.com\/watch.*|m\.youtube\.com\/index.*|.*\.youtube\.com\/profile.*|.*justin\.tv\/.*|.*justin\.tv\/.*\/b\/.*|.*justin\.tv\/.*\/w\/.*|www\.ustream\.tv\/recorded\/.*|www\.ustream\.tv\/channel\/.*|www\.ustream\.tv\/.*|qik\.com\/video\/.*|qik\.com\/.*|qik\.ly\/.*|.*revision3\.com\/.*|.*\.dailymotion\.com\/video\/.*|.*\.dailymotion\.com\/.*\/video\/.*|www\.collegehumor\.com\/video:.*|.*twitvid\.com\/.*|www\.break\.com\/.*\/.*|vids\.myspace\.com\/index\.cfm\?fuseaction=vids\.individual&videoid.*|www\.myspace\.com\/index\.cfm\?fuseaction=.*&videoid.*|www\.metacafe\.com\/watch\/.*|www\.metacafe\.com\/w\/.*|blip\.tv\/file\/.*|.*\.blip\.tv\/file\/.*|video\.google\.com\/videoplay\?.*|.*revver\.com\/video\/.*|video\.yahoo\.com\/watch\/.*\/.*|video\.yahoo\.com\/network\/.*|.*viddler\.com\/explore\/.*\/videos\/.*|liveleak\.com\/view\?.*|www\.liveleak\.com\/view\?.*|animoto\.com\/play\/.*|dotsub\.com\/view\/.*|www\.overstream\.net\/view\.php\?oid=.*|www\.livestream\.com\/.*|www\.worldstarhiphop\.com\/videos\/video.*\.php\?v=.*|worldstarhiphop\.com\/videos\/video.*\.php\?v=.*|teachertube\.com\/viewVideo\.php.*|www\.teachertube\.com\/viewVideo\.php.*|www1\.teachertube\.com\/viewVideo\.php.*|www2\.teachertube\.com\/viewVideo\.php.*|bambuser\.com\/v\/.*|bambuser\.com\/channel\/.*|bambuser\.com\/channel\/.*\/broadcast\/.*|www\.schooltube\.com\/video\/.*\/.*|bigthink\.com\/ideas\/.*|bigthink\.com\/series\/.*|sendables\.jibjab\.com\/view\/.*|sendables\.jibjab\.com\/originals\/.*|www\.xtranormal\.com\/watch\/.*|dipdive\.com\/media\/.*|dipdive\.com\/member\/.*\/media\/.*|dipdive\.com\/v\/.*|.*\.dipdive\.com\/media\/.*|.*\.dipdive\.com\/v\/.*|v\.youku\.com\/v_show\/.*\.html|v\.youku\.com\/v_playlist\/.*\.html|.*yfrog\..*\/.*|tweetphoto\.com\/.*|www\.flickr\.com\/photos\/.*|flic\.kr\/.*|twitpic\.com\/.*|www\.twitpic\.com\/.*|twitpic\.com\/photos\/.*|www\.twitpic\.com\/photos\/.*|.*imgur\.com\/.*|.*\.posterous\.com\/.*|post\.ly\/.*|twitgoo\.com\/.*|i.*\.photobucket\.com\/albums\/.*|s.*\.photobucket\.com\/albums\/.*|phodroid\.com\/.*\/.*\/.*|www\.mobypicture\.com\/user\/.*\/view\/.*|moby\.to\/.*|xkcd\.com\/.*|www\.xkcd\.com\/.*|imgs\.xkcd\.com\/.*|www\.asofterworld\.com\/index\.php\?id=.*|www\.asofterworld\.com\/.*\.jpg|asofterworld\.com\/.*\.jpg|www\.qwantz\.com\/index\.php\?comic=.*|23hq\.com\/.*\/photo\/.*|www\.23hq\.com\/.*\/photo\/.*|.*dribbble\.com\/shots\/.*|drbl\.in\/.*|.*\.smugmug\.com\/.*|.*\.smugmug\.com\/.*#.*|emberapp\.com\/.*\/images\/.*|emberapp\.com\/.*\/images\/.*\/sizes\/.*|emberapp\.com\/.*\/collections\/.*\/.*|emberapp\.com\/.*\/categories\/.*\/.*\/.*|embr\.it\/.*|picasaweb\.google\.com.*\/.*\/.*#.*|picasaweb\.google\.com.*\/lh\/photo\/.*|picasaweb\.google\.com.*\/.*\/.*|dailybooth\.com\/.*\/.*|brizzly\.com\/pic\/.*|pics\.brizzly\.com\/.*\.jpg|img\.ly\/.*|www\.tinypic\.com\/view\.php.*|tinypic\.com\/view\.php.*|www\.tinypic\.com\/player\.php.*|tinypic\.com\/player\.php.*|www\.tinypic\.com\/r\/.*\/.*|tinypic\.com\/r\/.*\/.*|.*\.tinypic\.com\/.*\.jpg|.*\.tinypic\.com\/.*\.png|meadd\.com\/.*\/.*|meadd\.com\/.*|.*\.deviantart\.com\/art\/.*|.*\.deviantart\.com\/gallery\/.*|.*\.deviantart\.com\/#\/.*|fav\.me\/.*|.*\.deviantart\.com|.*\.deviantart\.com\/gallery|.*\.deviantart\.com\/.*\/.*\.jpg|.*\.deviantart\.com\/.*\/.*\.gif|.*\.deviantart\.net\/.*\/.*\.jpg|.*\.deviantart\.net\/.*\/.*\.gif|plixi\.com\/p\/.*|plixi\.com\/profile\/home\/.*|plixi\.com\/.*|www\.fotopedia\.com\/.*\/.*|fotopedia\.com\/.*\/.*|photozou\.jp\/photo\/show\/.*\/.*|photozou\.jp\/photo\/photo_only\/.*\/.*|instagr\.am\/p\/.*|skitch\.com\/.*\/.*\/.*|img\.skitch\.com\/.*|https:\/\/skitch\.com\/.*\/.*\/.*|https:\/\/img\.skitch\.com\/.*|share\.ovi\.com\/media\/.*\/.*|www\.questionablecontent\.net\/|questionablecontent\.net\/|www\.questionablecontent\.net\/view\.php.*|questionablecontent\.net\/view\.php.*|questionablecontent\.net\/comics\/.*\.png|www\.questionablecontent\.net\/comics\/.*\.png|picplz\.com\/user\/.*\/pic\/.*\/|twitrpix\.com\/.*|.*\.twitrpix\.com\/.*|www\.someecards\.com\/.*\/.*|someecards\.com\/.*\/.*|some\.ly\/.*|www\.some\.ly\/.*|pikchur\.com\/.*|achewood\.com\/.*|www\.achewood\.com\/.*|achewood\.com\/index\.php.*|www\.achewood\.com\/index\.php.*|www\.whitehouse\.gov\/photos-and-video\/video\/.*|www\.whitehouse\.gov\/video\/.*|wh\.gov\/photos-and-video\/video\/.*|wh\.gov\/video\/.*|www\.hulu\.com\/watch.*|www\.hulu\.com\/w\/.*|hulu\.com\/watch.*|hulu\.com\/w\/.*|.*crackle\.com\/c\/.*|www\.fancast\.com\/.*\/videos|www\.funnyordie\.com\/videos\/.*|www\.funnyordie\.com\/m\/.*|funnyordie\.com\/videos\/.*|funnyordie\.com\/m\/.*|www\.vimeo\.com\/groups\/.*\/videos\/.*|www\.vimeo\.com\/.*|vimeo\.com\/m\/#\/featured\/.*|vimeo\.com\/groups\/.*\/videos\/.*|vimeo\.com\/.*|vimeo\.com\/m\/#\/featured\/.*|www\.ted\.com\/talks\/.*\.html.*|www\.ted\.com\/talks\/lang\/.*\/.*\.html.*|www\.ted\.com\/index\.php\/talks\/.*\.html.*|www\.ted\.com\/index\.php\/talks\/lang\/.*\/.*\.html.*|.*nfb\.ca\/film\/.*|www\.thedailyshow\.com\/watch\/.*|www\.thedailyshow\.com\/full-episodes\/.*|www\.thedailyshow\.com\/collection\/.*\/.*\/.*|movies\.yahoo\.com\/movie\/.*\/video\/.*|movies\.yahoo\.com\/movie\/.*\/trailer|movies\.yahoo\.com\/movie\/.*\/video|www\.colbertnation\.com\/the-colbert-report-collections\/.*|www\.colbertnation\.com\/full-episodes\/.*|www\.colbertnation\.com\/the-colbert-report-videos\/.*|www\.comedycentral\.com\/videos\/index\.jhtml\?.*|www\.theonion\.com\/video\/.*|theonion\.com\/video\/.*|wordpress\.tv\/.*\/.*\/.*\/.*\/|www\.traileraddict\.com\/trailer\/.*|www\.traileraddict\.com\/clip\/.*|www\.traileraddict\.com\/poster\/.*|www\.escapistmagazine\.com\/videos\/.*|www\.trailerspy\.com\/trailer\/.*\/.*|www\.trailerspy\.com\/trailer\/.*|www\.trailerspy\.com\/view_video\.php.*|www\.atom\.com\/.*\/.*\/|fora\.tv\/.*\/.*\/.*\/.*|www\.spike\.com\/video\/.*|www\.gametrailers\.com\/video\/.*|gametrailers\.com\/video\/.*|www\.koldcast\.tv\/video\/.*|www\.koldcast\.tv\/#video:.*|techcrunch\.tv\/watch.*|techcrunch\.tv\/.*\/watch.*|mixergy\.com\/.*|video\.pbs\.org\/video\/.*|www\.zapiks\.com\/.*|tv\.digg\.com\/diggnation\/.*|tv\.digg\.com\/diggreel\/.*|tv\.digg\.com\/diggdialogg\/.*|www\.trutv\.com\/video\/.*|www\.nzonscreen\.com\/title\/.*|nzonscreen\.com\/title\/.*|app\.wistia\.com\/embed\/medias\/.*|https:\/\/app\.wistia\.com\/embed\/medias\/.*|hungrynation\.tv\/.*\/episode\/.*|www\.hungrynation\.tv\/.*\/episode\/.*|hungrynation\.tv\/episode\/.*|www\.hungrynation\.tv\/episode\/.*|indymogul\.com\/.*\/episode\/.*|www\.indymogul\.com\/.*\/episode\/.*|indymogul\.com\/episode\/.*|www\.indymogul\.com\/episode\/.*|channelfrederator\.com\/.*\/episode\/.*|www\.channelfrederator\.com\/.*\/episode\/.*|channelfrederator\.com\/episode\/.*|www\.channelfrederator\.com\/episode\/.*|tmiweekly\.com\/.*\/episode\/.*|www\.tmiweekly\.com\/.*\/episode\/.*|tmiweekly\.com\/episode\/.*|www\.tmiweekly\.com\/episode\/.*|99dollarmusicvideos\.com\/.*\/episode\/.*|www\.99dollarmusicvideos\.com\/.*\/episode\/.*|99dollarmusicvideos\.com\/episode\/.*|www\.99dollarmusicvideos\.com\/episode\/.*|ultrakawaii\.com\/.*\/episode\/.*|www\.ultrakawaii\.com\/.*\/episode\/.*|ultrakawaii\.com\/episode\/.*|www\.ultrakawaii\.com\/episode\/.*|barelypolitical\.com\/.*\/episode\/.*|www\.barelypolitical\.com\/.*\/episode\/.*|barelypolitical\.com\/episode\/.*|www\.barelypolitical\.com\/episode\/.*|barelydigital\.com\/.*\/episode\/.*|www\.barelydigital\.com\/.*\/episode\/.*|barelydigital\.com\/episode\/.*|www\.barelydigital\.com\/episode\/.*|threadbanger\.com\/.*\/episode\/.*|www\.threadbanger\.com\/.*\/episode\/.*|threadbanger\.com\/episode\/.*|www\.threadbanger\.com\/episode\/.*|vodcars\.com\/.*\/episode\/.*|www\.vodcars\.com\/.*\/episode\/.*|vodcars\.com\/episode\/.*|www\.vodcars\.com\/episode\/.*|confreaks\.net\/videos\/.*|www\.confreaks\.net\/videos\/.*|www\.godtube\.com\/featured\/video\/.*|godtube\.com\/featured\/video\/.*|www\.godtube\.com\/watch\/.*|godtube\.com\/watch\/.*|www\.tangle\.com\/view_video.*|mediamatters\.org\/mmtv\/.*|www\.clikthrough\.com\/theater\/video\/.*|soundcloud\.com\/.*|soundcloud\.com\/.*\/.*|soundcloud\.com\/.*\/sets\/.*|soundcloud\.com\/groups\/.*|snd\.sc\/.*|www\.last\.fm\/music\/.*|www\.last\.fm\/music\/+videos\/.*|www\.last\.fm\/music\/+images\/.*|www\.last\.fm\/music\/.*\/_\/.*|www\.last\.fm\/music\/.*\/.*|www\.mixcloud\.com\/.*\/.*\/|www\.radionomy\.com\/.*\/radio\/.*|radionomy\.com\/.*\/radio\/.*|www\.entertonement\.com\/clips\/.*|www\.rdio\.com\/#\/artist\/.*\/album\/.*|www\.rdio\.com\/artist\/.*\/album\/.*|www\.zero-inch\.com\/.*|.*\.bandcamp\.com\/|.*\.bandcamp\.com\/track\/.*|.*\.bandcamp\.com\/album\/.*|freemusicarchive\.org\/music\/.*|www\.freemusicarchive\.org\/music\/.*|freemusicarchive\.org\/curator\/.*|www\.freemusicarchive\.org\/curator\/.*|www\.npr\.org\/.*\/.*\/.*\/.*\/.*|www\.npr\.org\/.*\/.*\/.*\/.*\/.*\/.*|www\.npr\.org\/.*\/.*\/.*\/.*\/.*\/.*\/.*|www\.npr\.org\/templates\/story\/story\.php.*|huffduffer\.com\/.*\/.*|www\.audioboo\.fm\/boos\/.*|audioboo\.fm\/boos\/.*|boo\.fm\/b.*|www\.xiami\.com\/song\/.*|xiami\.com\/song\/.*|espn\.go\.com\/video\/clip.*|espn\.go\.com\/.*\/story.*|abcnews\.com\/.*\/video\/.*|abcnews\.com\/video\/playerIndex.*|washingtonpost\.com\/wp-dyn\/.*\/video\/.*\/.*\/.*\/.*|www\.washingtonpost\.com\/wp-dyn\/.*\/video\/.*\/.*\/.*\/.*|www\.boston\.com\/video.*|boston\.com\/video.*|www\.facebook\.com\/photo\.php.*|www\.facebook\.com\/video\/video\.php.*|www\.facebook\.com\/v\/.*|cnbc\.com\/id\/.*\?.*video.*|www\.cnbc\.com\/id\/.*\?.*video.*|cnbc\.com\/id\/.*\/play\/1\/video\/.*|www\.cnbc\.com\/id\/.*\/play\/1\/video\/.*|cbsnews\.com\/video\/watch\/.*|www\.google\.com\/buzz\/.*\/.*\/.*|www\.google\.com\/buzz\/.*|www\.google\.com\/profiles\/.*|google\.com\/buzz\/.*\/.*\/.*|google\.com\/buzz\/.*|google\.com\/profiles\/.*|www\.cnn\.com\/video\/.*|edition\.cnn\.com\/video\/.*|money\.cnn\.com\/video\/.*|today\.msnbc\.msn\.com\/id\/.*\/vp\/.*|www\.msnbc\.msn\.com\/id\/.*\/vp\/.*|www\.msnbc\.msn\.com\/id\/.*\/ns\/.*|today\.msnbc\.msn\.com\/id\/.*\/ns\/.*|multimedia\.foxsports\.com\/m\/video\/.*\/.*|msn\.foxsports\.com\/video.*|www\.globalpost\.com\/video\/.*|www\.globalpost\.com\/dispatch\/.*|.*amazon\..*\/gp\/product\/.*|.*amazon\..*\/.*\/dp\/.*|.*amazon\..*\/dp\/.*|.*amazon\..*\/o\/ASIN\/.*|.*amazon\..*\/gp\/offer-listing\/.*|.*amazon\..*\/.*\/ASIN\/.*|.*amazon\..*\/gp\/product\/images\/.*|www\.amzn\.com\/.*|amzn\.com\/.*|www\.shopstyle\.com\/browse.*|www\.shopstyle\.com\/action\/apiVisitRetailer.*|api\.shopstyle\.com\/action\/apiVisitRetailer.*|www\.shopstyle\.com\/action\/viewLook.*|gist\.github\.com\/.*|twitter\.com\/.*\/status\/.*|twitter\.com\/.*\/statuses\/.*|mobile\.twitter\.com\/.*\/status\/.*|mobile\.twitter\.com\/.*\/statuses\/.*|www\.crunchbase\.com\/.*\/.*|crunchbase\.com\/.*\/.*|www\.slideshare\.net\/.*\/.*|www\.slideshare\.net\/mobile\/.*\/.*|.*\.scribd\.com\/doc\/.*|screenr\.com\/.*|polldaddy\.com\/community\/poll\/.*|polldaddy\.com\/poll\/.*|answers\.polldaddy\.com\/poll\/.*|www\.5min\.com\/Video\/.*|www\.howcast\.com\/videos\/.*|www\.screencast\.com\/.*\/media\/.*|screencast\.com\/.*\/media\/.*|www\.screencast\.com\/t\/.*|screencast\.com\/t\/.*|issuu\.com\/.*\/docs\/.*|www\.kickstarter\.com\/projects\/.*\/.*|www\.scrapblog\.com\/viewer\/viewer\.aspx.*|ping\.fm\/p\/.*|chart\.ly\/.*|maps\.google\.com\/maps\?.*|maps\.google\.com\/\?.*|maps\.google\.com\/maps\/ms\?.*|.*\.craigslist\.org\/.*\/.*|my\.opera\.com\/.*\/albums\/show\.dml\?id=.*|my\.opera\.com\/.*\/albums\/showpic\.dml\?album=.*&picture=.*|tumblr\.com\/.*|.*\.tumblr\.com\/post\/.*|www\.polleverywhere\.com\/polls\/.*|www\.polleverywhere\.com\/multiple_choice_polls\/.*|www\.polleverywhere\.com\/free_text_polls\/.*|www\.quantcast\.com\/wd:.*|www\.quantcast\.com\/.*|siteanalytics\.compete\.com\/.*|statsheet\.com\/statplot\/charts\/.*\/.*\/.*\/.*|statsheet\.com\/statplot\/charts\/e\/.*|statsheet\.com\/.*\/teams\/.*\/.*|statsheet\.com\/tools\/chartlets\?chart=.*|.*\.status\.net\/notice\/.*|identi\.ca\/notice\/.*|brainbird\.net\/notice\/.*|shitmydadsays\.com\/notice\/.*|www\.studivz\.net\/Profile\/.*|www\.studivz\.net\/l\/.*|www\.studivz\.net\/Groups\/Overview\/.*|www\.studivz\.net\/Gadgets\/Info\/.*|www\.studivz\.net\/Gadgets\/Install\/.*|www\.studivz\.net\/.*|www\.meinvz\.net\/Profile\/.*|www\.meinvz\.net\/l\/.*|www\.meinvz\.net\/Groups\/Overview\/.*|www\.meinvz\.net\/Gadgets\/Info\/.*|www\.meinvz\.net\/Gadgets\/Install\/.*|www\.meinvz\.net\/.*|www\.schuelervz\.net\/Profile\/.*|www\.schuelervz\.net\/l\/.*|www\.schuelervz\.net\/Groups\/Overview\/.*|www\.schuelervz\.net\/Gadgets\/Info\/.*|www\.schuelervz\.net\/Gadgets\/Install\/.*|www\.schuelervz\.net\/.*|myloc\.me\/.*|pastebin\.com\/.*|pastie\.org\/.*|www\.pastie\.org\/.*|redux\.com\/stream\/item\/.*\/.*|redux\.com\/f\/.*\/.*|www\.redux\.com\/stream\/item\/.*\/.*|www\.redux\.com\/f\/.*\/.*|cl\.ly\/.*|cl\.ly\/.*\/content|speakerdeck\.com\/u\/.*\/p\/.*|www\.kiva\.org\/lend\/.*|www\.timetoast\.com\/timelines\/.*|storify\.com\/.*\/.*|.*meetup\.com\/.*|meetu\.ps\/.*|www\.dailymile\.com\/people\/.*\/entries\/.*|.*\.kinomap\.com\/.*|www\.metacdn\.com\/api\/users\/.*\/content\/.*|www\.metacdn\.com\/api\/users\/.*\/media\/.*|prezi\.com\/.*\/.*|.*\.uservoice\.com\/.*\/suggestions\/.*|formspring\.me\/.*|www\.formspring\.me\/.*|formspring\.me\/.*\/q\/.*|www\.formspring\.me\/.*\/q\/.*|twitlonger\.com\/show\/.*|www\.twitlonger\.com\/show\/.*|tl\.gd\/.*)/i;

////////////////////////////////////////////////////////////////////////////////////////////////
/*
 * @class Workspace.IFrameObject
 * Represents a workspace object containing an iframe
 * @extends Workspace.ElementObject
 */
Workspace.IFrameObject = function(workspace, config) {
    Workspace.IFrameObject.superclass.constructor.call(this, workspace, config);

    Ext.apply(this.elementSpec, {
        tag: 'div',
        cls: 'iframe'
    });

    this.expose('url', true, true, true, false);
    //'getText', 'setText'); //,'text','string');
    this.on('change_url', this.setText, this)
};
Ext.extend(Workspace.IFrameObject, Workspace.ElementObject, {
    wtype: 'Workspace.IFrameObject',
    isEditable: false,
    isSelectable: true,
    isResizable: true,
    name: 'New IFrame',
    iconCls: 'iframe-icon',
    width: 300,
    height: 400,
    /**
     * @cfg {Number} padding
     * Amount to pad the iframe element (to allow this object to be dragged from iframe edges)
     */
    padding: 2,
    /**
     * @cfg {String} url
     */
    url: '',
    render: function() {
        // build iframe
        this.elementSpec.html = '<iframe src="' + this.getFullUrl() + '" />';
        Workspace.IFrameObject.superclass.render.call(this, arguments);

        // update position and dimensions
        this.set('width', this.getWidth());
        this.set('height', this.getHeight());
        this.getIFrameEl().position('relative');

        // apply "padding" to this element so that iframe can be dragged
        this.getIFrameEl().setLeftTop(this.padding, this.padding);
    },
    /**
     * getFullUrl
     * Allows descendent classes to implement URL filtering
     * @abstract
     */
    getFullUrl: function() {
        return this.getUrl();
    },
    getUrl: function() {
        return this.get('url');
        //this.text;
    },
    setUrl: function(value) {
        this.getImageEl().set({
            src: value
        });
    },
    /**
     * getImageEl
     * Returns the DOM iframe element
     * @return {Ext.Element}
     */
    getIFrameEl: function() {
        if (this.getEl())
            return this.getEl().child('iframe');
    },
    updateWidth: function(w) {
        this.getIFrameEl().setWidth(w - (this.padding * 2));
        Workspace.IFrameObject.superclass.updateWidth.apply(this, arguments);
    },
    updateHeight: function(h) {
        this.getIFrameEl().setHeight(h - (this.padding * 2));
        Workspace.IFrameObject.superclass.updateHeight.apply(this, arguments);
    }
});

Workspace.reg('Workspace.IFrameObject', Workspace.IFrameObject);

////////////////////////////////////////////////////////////////////////////////////////////////
/*
 * @class Workspace.PDFEmbedObject
 * Represents a workspace object containing an iframe
 * @extends Workspace.IFrameObject
 */
Workspace.PDFEmbedObject = function(workspace, config) {
    Workspace.PDFEmbedObject.superclass.constructor.call(this, workspace, config);
};
Ext.extend(Workspace.PDFEmbedObject, Workspace.IFrameObject, {
    wtype: 'Workspace.PDFEmbedObject',
    name: 'New PDF',
    iconCls: 'pdf',
    url: 'http://labs.google.com/papers/bigtable-osdi06.pdf',
    /**
     * Returns the URL to the Google Docs PDF embedding suite
     * @param {Object} value
     */
    getFullUrl: function(value) {
        value = value || this.get('url');
        return 'http://docs.google.com/viewer?embedded=true&url=' + encodeURIComponent(value);
    },
    setUrl: function(value) {
        this.getIFrameEl().set({
            src: this.getFullUrl(value)
        });
    }
});

Workspace.reg('Workspace.PDFEmbedObject', Workspace.PDFEmbedObject);

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.RichTextObject
 * Represents a workspace object containing editable, rich HTML
 * @extends Workspace.ElementObject
 */
Workspace.RichTextObject = function(workspace, config) {
    Workspace.RichTextObject.superclass.constructor.call(this, workspace, config);

    Ext.apply(this.elementSpec, {
        tag: 'div',
        cls: 'textbox'
    });

    this.expose('text', true, true, true, false);
    //'getText', 'setText'); //,'text','string');
    this.on('change_text', this.setText, this)
};
Ext.extend(Workspace.RichTextObject, Workspace.ElementObject, {
    autoMaxWidth: 300,
    wtype: 'Workspace.RichTextObject',
    isEditable: true,
    isSelectable: true,
    isResizable: true,
    text: '',
    name: "New Textbox",
    iconCls: 'text-icon',
    /**
     * @cfg {String} editor
     * The name of a {@link WorkspaceTool} to use to edit this object (activated on double-click)
     */
    editor: 'aloha',
    render: function() {
        this.elementSpec.html = this.get('text');
        Workspace.RichTextObject.superclass.render.call(this, arguments);
    },
    getText: function() {
        //this.text = this.getEl().innerHTML;
        return this.get('text');
        //this.text;
    },
    /**
     * setText
     * Updates the element with the passed HTML; automatically invoked when 'text' property is set.
     * @private
     * @param {Object} value
     */
    setText: function(value) {
        this.text = value;
        this.getEl().update(value);
    },
    /**
     * sizeToFit
     * Automatically resizes the textbox to fit the provided text. Uses {@link #autoMaxWidth} to
     * determine the width beyond which to wrap the text.
     */
    sizeToFit: function() {
        var metrics = Ext.util.TextMetrics.createInstance(this.getEl());
        text = this.get('text'),
        width = metrics.getWidth(text);
        if(width > this.autoMaxWidth) {
            this.set('width',this.autoMaxWidth);
            metrics.setFixedWidth(this.autoMaxWidth);
        } else {
            this.set('width',width+20);
            metrics.setFixedWidth(width+20);
        }
        this.set('height',metrics.getHeight(text)+20);
    }
});

Workspace.reg('Workspace.RichTextObject', Workspace.RichTextObject);

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.MathEquationObject
 * Represents a workspace object containing an editable mathematical equation
 * @extends Workspace.ElementObject
 */
Workspace.MathEquationObject = function(workspace, config) {
    Ext.applyIf(config, {

    })

    Workspace.MathEquationObject.superclass.constructor.call(this, workspace, config);

    Ext.apply(this.elementSpec, {
        tag: 'div',
        cls: 'math'
    });

    this.expose('latex', true, true, true, false);
};
Ext.extend(Workspace.MathEquationObject, Workspace.ElementObject, {
    wtype: 'Workspace.MathEquationObject',
    name: 'New Equation',
    iconCls: 'math-icon',
    isEditable: true,
    isSelectable: true,
    isResizable: true,
    /**
     * @cfg {String} latex
     * The LaTeX string to be rendered in this element
     */
    latex: '',
    editor: 'mathquill',
    render: function() {
        Workspace.MathEquationObject.superclass.render.call(this, arguments);
        this.showImage(this.get('latex'));
        // $(this.getEl().dom).mathquill('latex',this.get('latex'));
    },
    /**
     * Render LaTeX as image using a free service
     * @param {Object} text
     */
    showImage: function(text) {
        var url = 'http://latex.codecogs.com/gif.latex?';
        url += encodeURIComponent(text);
        this.getEl().update('<img src="' + url + '" />');
    },
    /**
     * activate
     * Makes this element editable using Mathquill; automatically invoked by the configured editor
     * @private
     */
    activate: function() {
        var el = this.getEl();
        el.update('');
        $(el.dom).mathquill('editable').mathquill('latex', this.get('latex'));
    },
    /**
     * deactivate
     * Restores this element to a non-editable image; automatically invoekd by the configured editor
     * @private
     */
    deactivate: function() {
        var el = this.getEl(),
        text = $(el.dom).mathquill('latex');

        this.set('latex', text);

        $(this.element.dom).mathquill('revert');
        this.element = Ext.get(this.element.dom);
        this.showImage(text)
    }
});

Workspace.reg('Workspace.MathEquationObject', Workspace.MathEquationObject);

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.ChemStructureObject
 * Represents a workspace object containing an editable chemical structure
 * @extends Workspace.ElementObject
 */
Workspace.ChemStructureObject = function(workspace, config) {
    Workspace.ChemStructureObject.superclass.constructor.call(this, workspace, config);

    Ext.apply(this.elementSpec, {
        tag: 'div',
        cls: 'textbox'
    });

};
Ext.extend(Workspace.ChemStructureObject, Workspace.ElementObject, {
    wtype: 'Workspace.ChemStructureObject',
    name: 'New Chemical Structure',
    iconCls: 'chem',
    isEditable: true,
    isSelectable: true,
    isResizable: true,
    editor: 'chemdraw',
    render: function() {
        Workspace.ChemStructureObject.superclass.render.call(this, arguments);
    }
});

Workspace.reg('Workspace.ChemStructureObject', Workspace.ChemStructureObject);
