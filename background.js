var discussionUrls = {};

chrome.browserAction.setBadgeBackgroundColor({ color: "#333" });

chrome.browserAction.onClicked.addListener(function(activeTab) {
    var newURL = discussionUrls[activeTab.id];
    if (!newURL) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            newURL = "http://news.ycombinator.com/submitlink?u=" + encodeURIComponent(tabs[0].url) + "&t=" + encodeURIComponent(tabs[0].title);
            chrome.tabs.create({ url: newURL });
        });
    } else {
        chrome.tabs.create({ url: newURL });
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo && changeInfo.hasOwnProperty("status") && changeInfo.status == "complete")
        checkHN(tab.url, tabId);
});

chrome.tabs.onCreated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo && changeInfo.hasOwnProperty("url"))
        checkHN(changeInfo.url, tabId);
});

function checkHN(url, tabId) {
    var host = getHostName(url);
    if (exclude.some(function(v) { return host == v; }))
        return;

    url = normalizeUrl(url);

    //first check for the exact URL, then for the root URL
    getHNRank(url, tabId);
}

function getHNRank(url, tabId) {
    $.get("https://hn.algolia.com/api/v1/search?restrictSearchableAttributes=url&tags=story&query=" + encodeURIComponent(url),
        function(data) {
            if (data.hits.length > 0 && normalizeUrl(url) == normalizeUrl(data.hits[0].url)) {
                chrome.browserAction.setBadgeText({ text: data.hits[0].points.toString(), tabId: tabId });
                discussionUrls[tabId.toString()] = "https://news.ycombinator.com/item?id=" + data.hits[0].objectID;
            } else {
                //try again, but removing the query string
                var index = url.lastIndexOf("?");
                if (index > -1)
                    getHNRank(url.substring(0, index), tabId);

                chrome.browserAction.setBadgeText({ text: '', tabId: tabId });
                discussionUrls[tabId.toString()] = null;
            }
        });
}

function normalizeUrl(url) {
    var tmp = document.createElement('a');
    tmp.href = url;
    return url.replace(tmp.protocol + "//", '').replace(/\/$/, "").replace("www.", "");
}

function getHostName(url) {
    var tmp = document.createElement('a');
    tmp.href = url;
    return tmp.hostname;
}

var exclude = [
    "google.com",
    "facebook.com",
    "youtube.com",
    "yahoo.com",
    "baidu.com",
    "amazon.com",
    "wikipedia.org",
    "taobao.com",
    "twitter.com",
    "qq.com",
    "google.co.in",
    "live.com",
    "linkedin.com",
    "sina.com.cn",
    "tmall.com",
    "weibo.com",
    "yahoo.co.jp",
    "blogspot.com",
    "ebay.com",
    "yandex.ru",
    "hao123.com",
    "vk.com",
    "google.de",
    "bing.com",
    "adcash.com",
    "ask.com",
    "google.co.jp",
    "pinterest.com",
    "reddit.com",
    "wordpress.com",
    "msn.com",
    "google.co.uk",
    "sohu.com",
    "instagram.com",
    "tumblr.com",
    "aliexpress.com",
    "mail.ru",
    "amazon.co.jp",
    "google.fr",
    "alibaba.com",
    "PayPal.com",
    "google.com.br",
    "imgur.com",
    "google.ru",
    "apple.com",
    "xvideos.com",
    "microsoft.com",
    "360.cn",
    "imdb.com",
    "google.it",
    "amazon.de",
    "go.com",
    "t.co",
    "google.es",
    "fc2.com",
    "163.com",
    "amazon.co.uk",
    "soso.com",
    "gmw.cn",
    "stackoverflow.com",
    "xhamster.com",
    "craigslist.org",
    "google.com.mx",
    "Onclickads.net",
    "google.ca",
    "netflix.com",
    "google.com.hk",
    "espn.go.com",
    "youradexchange.com",
    "Googleadservices.com",
    "Cntv.cn",
    "people.com.cn",
    "pornhub.com",
    "google.com.tr",
    "rakuten.co.jp",
    "ebay.de",
    "bbc.co.uk",
    "cnn.com",
    "amazon.cn",
    "Naver.com",
    "xinhuanet.com",
    "walmart.com",
    "alipay.com",
    "google.pl",
    "adobe.com",
    "dailymotion.com",
    "flipkart.com",
    "dropbox.com",
    "google.com.au",
    "uol.com.br",
    "kickass.so",
    "youku.com",
    "ebay.co.uk",
    "huffingtonpost.com",
    "bestbuy.com",
    "blogger.com",
    "Buzzfeed.com",
    "xnxx.com",
    "odnoklassniki.ru",
    "Akamaihd.net",
    "newtab",
    ".exe",
    ".zip",
    ".jpg",
    ".gif",
    ".png",
    ".pdf",
    ".mp3"
];