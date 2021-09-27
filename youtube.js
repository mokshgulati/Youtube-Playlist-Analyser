let puppeteer = require('puppeteer');
let pdf = require('pdfkit');
let page;

(async function () {
    try {
        let initBrowser = await puppeteer.launch(
            {
                headless: false,
                defaultViewport: null,
                args: ["--start-maximized"]
            }
        );
        let pageArr = await initBrowser.pages();
        page = pageArr[0];
        await page.goto("https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq");
        await page.waitForTimeout(10000);
        await page.waitForSelector("h1[id='title']");
        let title = await page.evaluate(function (elem) {
            return document.querySelector(elem).innerText.trim();
        }, "h1[id='title']");
        console.log("TITLE         :     " + title);
        let videosNdViews = await page.$$(".style-scope.ytd-playlist-sidebar-primary-info-renderer");
        let videos = await page.evaluate(function (elem) {
            return elem.textContent.trim();
        }, videosNdViews[5]);
        console.log("VIDEOS        :     " + videos);
        let views = await page.evaluate(function (elem) {
            return elem.textContent.trim();
        }, videosNdViews[6]);
        console.log("VIEWS         :     " + views);
        let totalVideos = (Number)(videos.split(" ")[0]);
        let visibleVideos = await noOfElements("div#content.style-scope.ytd-playlist-video-renderer h3");
        while (totalVideos - visibleVideos > 10) {
            await scrollToBottom();
            visibleVideos = await noOfElements("div#content.style-scope.ytd-playlist-video-renderer h3");
        }
        console.log("ACTUAL VIDEOS :     " + visibleVideos + " videos");
        let titleNdDurationList = await getTitlesNdDurations('div#content.style-scope.ytd-playlist-video-renderer h3', '#text.style-scope.ytd-thumbnail-overlay-time-status-renderer');
        console.log(titleNdDurationList);
        // let totalLength = totalLengthOfAllVideos(titleNdDurationList);
        // console.log(totalLength);
    } catch (error) {
        console.log(error);
    }
})();

async function scrollToBottom() {
    await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
    })
}

async function noOfElements(selector) {
    let nos = await page.evaluate(function (elem) {
        let elemArr = document.querySelectorAll(elem);
        return elemArr.length;
    }, selector);
    return nos;
}

function totalLengthOfAllVideos(list) {
    let l = 0;
    for (let i = 0; i < list.length; i++) {
        let x = list[i].duration;
        let y = x.split(":");
        let a = (Number)(y[0].trim());
        let b = (Number)(y[1].trim());
        l += a * 60 + b;
    }
    return l;
}

async function getTitlesNdDurations(titleSelector, durationSelector) {
    let array = await page.evaluate((titleSelector, durationSelector) => {
        let titles = document.querySelectorAll(titleSelector);
        let durations = document.querySelectorAll(durationSelector);
        let arrayList = [];
        for (let i = 0; i < titles.length; i++) {
            var title = titles[i].textContent.trim();
            var duration = durations[i].textContent.trim();
            arrayList.push({ title, duration });
        }
        return arrayList;
    }, titleSelector, durationSelector)
    return array;
}