const generateUuid = function() {
  /**
  * Returns a UUID, using the Math function
  */
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

const setSessionCookie = function(key, value) {
  /**
  * Sets a cookie that expires at the end of a session (no expiry date)
  */
  document.cookie = key + "=" + value + ";";
}

const getSessionCookie = function(key) {
  /**
  * Returns the value of cookie if it exists. Returns null if it does not
  */
  const cname = key + "=";
  const cookies = document.cookie.split(';');
  for(let i = 0; i < cookies.length; i++) {
    let c = cookies[i];
    while (c.charAt(0) == ' ') { //removing leading spaces
      c = c.substring(1);
    }
    if (c.indexOf(cname) == 0) {
      const cvalue = c.substring(cname.length, c.length);
      if (cvalue != "NaN" && cvalue != "null") {
        return cvalue;
      } else {
        return null;
      }
    }
  }
  return null;
}

const setStorage = function(key, value) {
  /**
  * Sets a value in local storage
  */
  localStorage.setItem(key, value);
}

const getStorage = function(key) {
  /**
  * Returns a value from local storage if it exists, and null if it does not
  */
  return localStorage.getItem(key);
}

//The object below measures the active time a user had spent on a page. It is from Jason Zissman's TimeMe library - https://github.com/jasonzissman/TimeMe.js. If you're reading this code, ignore this function and skip straight to the subsequent sections

/*Copyright (c) 2020 Jason Zissman
Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

let TimeMe = {
  startStopTimes: {},
  idleTimeoutMs: 30 * 1000,
  currentIdleTimeMs: 0,
  checkIdleStateRateMs: 250,
  isUserCurrentlyOnPage: true, 
  isUserCurrentlyIdle: false, 
  currentPageName: "default-page-name",
  timeElapsedCallbacks: [],
  userLeftCallbacks: [],
  userReturnCallbacks: [],

  trackTimeOnElement: (elementId) => {
    let element = document.getElementById(elementId);
    if (element) {
      element.addEventListener("mouseover", () => {
        TimeMe.startTimer(elementId);
      });
      element.addEventListener("mousemove", () => {
        TimeMe.startTimer(elementId);
      });
      element.addEventListener("mouseleave", () => {
        TimeMe.stopTimer(elementId);
      });
      element.addEventListener("keypress", () => {
        TimeMe.startTimer(elementId);
      });
      element.addEventListener("focus", () => {
        TimeMe.startTimer(elementId);
      });
    }
  },

  getTimeOnElementInSeconds: (elementId) => {
    let time = TimeMe.getTimeOnPageInSeconds(elementId);
    if (time) {
      return time;
    } else {
      return 0;
    }
  },

  // startTime is optional. If provided, must be of type Date(). By providing
  // startTime, you are overriding the internal timing mechanism and manually
  // indicating the start time.
  startTimer: (pageName, startTime) => {
    if (!pageName) {
      pageName = TimeMe.currentPageName;
    }

    if (TimeMe.startStopTimes[pageName] === undefined) {
      TimeMe.startStopTimes[pageName] = [];
    } else {
      let arrayOfTimes = TimeMe.startStopTimes[pageName];
      let latestStartStopEntry = arrayOfTimes[arrayOfTimes.length - 1];
      if (latestStartStopEntry !== undefined && latestStartStopEntry.stopTime === undefined) {
        // Can't start new timer until previous finishes.
        return;
      }
    }
    TimeMe.startStopTimes[pageName].push({
      "startTime": startTime || new Date(),
      "stopTime": undefined
    });				
  },

  stopAllTimers: () => {
    let pageNames = Object.keys(TimeMe.startStopTimes);
    for (let i = 0; i < pageNames.length; i++) {
      TimeMe.stopTimer(pageNames[i]);
    }
  },

  // stopTime is optional. If provided, must be of type Date(). By providing
  // stopTime, you are overriding the internal timing mechanism and manually
  // indicating the stop time.
  stopTimer: (pageName, stopTime) => {
    if (!pageName) {
      pageName = TimeMe.currentPageName;
    }
    let arrayOfTimes = TimeMe.startStopTimes[pageName];
    if (arrayOfTimes === undefined || arrayOfTimes.length === 0) {
      // Can't stop timer before you've started it.
      return;
    }
    if (arrayOfTimes[arrayOfTimes.length - 1].stopTime === undefined) {
      arrayOfTimes[arrayOfTimes.length - 1].stopTime = stopTime || new Date();
    }
  },

  getTimeOnCurrentPageInSeconds: () => {
    return TimeMe.getTimeOnPageInSeconds(TimeMe.currentPageName);
  },

  getTimeOnPageInSeconds: (pageName) => {
    let timeInMs = TimeMe.getTimeOnPageInMilliseconds(pageName);
    if (timeInMs === undefined) {
      return undefined;
    } else {
      return timeInMs / 1000;
    }
  },

  getTimeOnCurrentPageInMilliseconds: () => {
    return TimeMe.getTimeOnPageInMilliseconds(TimeMe.currentPageName);
  },

  getTimeOnPageInMilliseconds: (pageName) => {

    let totalTimeOnPage = 0;

    let arrayOfTimes = TimeMe.startStopTimes[pageName];
    if (arrayOfTimes === undefined) {
      // Can't get time on page before you've started the timer.
      return;
    }

    let timeSpentOnPageInSeconds = 0;
    for (let i = 0; i < arrayOfTimes.length; i++) {
      let startTime = arrayOfTimes[i].startTime;
      let stopTime = arrayOfTimes[i].stopTime;
      if (stopTime === undefined) {
        stopTime = new Date();
      }
      let difference = stopTime - startTime;
      timeSpentOnPageInSeconds += (difference);
    }

    totalTimeOnPage = Number(timeSpentOnPageInSeconds);
    return totalTimeOnPage;
  },

  getTimeOnAllPagesInSeconds: () => {
    let allTimes = [];
    let pageNames = Object.keys(TimeMe.startStopTimes);
    for (let i = 0; i < pageNames.length; i++) {
      let pageName = pageNames[i];
      let timeOnPage = TimeMe.getTimeOnPageInSeconds(pageName);
      allTimes.push({
        "pageName": pageName,
        "timeOnPage": timeOnPage
      });
    }
    return allTimes;
  },

  setIdleDurationInSeconds: (duration) => {
    let durationFloat = parseFloat(duration);
    if (isNaN(durationFloat) === false) {
      TimeMe.idleTimeoutMs = duration * 1000;
    } else {
      throw {
        name: "InvalidDurationException",
        message: "An invalid duration time (" + duration + ") was provided."
      };
    }
  },

  setCurrentPageName: (pageName) => {
    TimeMe.currentPageName = pageName;
  },

  resetRecordedPageTime: (pageName) => {
    delete TimeMe.startStopTimes[pageName];
  },

  resetAllRecordedPageTimes: () => {
    let pageNames = Object.keys(TimeMe.startStopTimes);
    for (let i = 0; i < pageNames.length; i++) {
      TimeMe.resetRecordedPageTime(pageNames[i]);
    }
  },
  userActivityDetected: () => {
    if (TimeMe.isUserCurrentlyIdle) {
      TimeMe.triggerUserHasReturned();
    }
    TimeMe.resetIdleCountdown();
  },
  resetIdleCountdown: () => {
    TimeMe.isUserCurrentlyIdle = false;
    TimeMe.currentIdleTimeMs = 0;
  },

  callWhenUserLeaves: (callback, numberOfTimesToInvoke) => {
    TimeMe.userLeftCallbacks.push({
      callback: callback,
      numberOfTimesToInvoke: numberOfTimesToInvoke
    })
  },

  callWhenUserReturns: (callback, numberOfTimesToInvoke) => {
    TimeMe.userReturnCallbacks.push({
      callback: callback,
      numberOfTimesToInvoke: numberOfTimesToInvoke
    })
  },

  triggerUserHasReturned: () => {
    if (!TimeMe.isUserCurrentlyOnPage) {
      TimeMe.isUserCurrentlyOnPage = true;
      TimeMe.resetIdleCountdown();
      for (let i = 0; i < TimeMe.userReturnCallbacks.length; i++) {
        let userReturnedCallback = TimeMe.userReturnCallbacks[i];
        let numberTimes = userReturnedCallback.numberOfTimesToInvoke;
        if (isNaN(numberTimes) || (numberTimes === undefined) || numberTimes > 0) {
          userReturnedCallback.numberOfTimesToInvoke -= 1;
          userReturnedCallback.callback();
        }
      }
    }
    TimeMe.startTimer();
  },
  // TODO - we are muddying the waters in between
  // 'user left page' and 'user gone idle'. Really should be
  // two separate concepts entirely. Need to break this into smaller  functions
  // for either scenario.
  triggerUserHasLeftPageOrGoneIdle: () => {
    if (TimeMe.isUserCurrentlyOnPage) {
      TimeMe.isUserCurrentlyOnPage = false;					
      for (let i = 0; i < TimeMe.userLeftCallbacks.length; i++) {
        let userHasLeftCallback = TimeMe.userLeftCallbacks[i];
        let numberTimes = userHasLeftCallback.numberOfTimesToInvoke;
        if (isNaN(numberTimes) || (numberTimes === undefined) || numberTimes > 0) {
          userHasLeftCallback.numberOfTimesToInvoke -= 1;
          userHasLeftCallback.callback();
        }
      }
    }
    TimeMe.stopAllTimers();
  },

  callAfterTimeElapsedInSeconds: (timeInSeconds, callback) => {
    TimeMe.timeElapsedCallbacks.push({
      timeInSeconds: timeInSeconds,
      callback: callback,
      pending: true
    });
  },

  checkIdleState: () => {
    for (let i = 0; i < TimeMe.timeElapsedCallbacks.length; i++) {
      if (TimeMe.timeElapsedCallbacks[i].pending && TimeMe.getTimeOnCurrentPageInSeconds() > TimeMe.timeElapsedCallbacks[i].timeInSeconds) {
        TimeMe.timeElapsedCallbacks[i].callback();
        TimeMe.timeElapsedCallbacks[i].pending = false;
      }
    }
    if (TimeMe.isUserCurrentlyIdle === false && TimeMe.currentIdleTimeMs > TimeMe.idleTimeoutMs) {
      TimeMe.isUserCurrentlyIdle = true;
      TimeMe.triggerUserHasLeftPageOrGoneIdle();
    } else {
      TimeMe.currentIdleTimeMs += TimeMe.checkIdleStateRateMs;
    }
  },

  visibilityChangeEventName: undefined,
  hiddenPropName: undefined,

  listenForVisibilityEvents: (trackWhenUserLeavesPage, trackWhenUserGoesIdle) => {

    if (trackWhenUserLeavesPage) {
      TimeMe.listenForUserLeavesOrReturnsEvents();
    }

    if (trackWhenUserGoesIdle) {
      TimeMe.listForIdleEvents();
    }

  },

  listenForUserLeavesOrReturnsEvents: () => {
    if (typeof document.hidden !== "undefined") {
      TimeMe.hiddenPropName = "hidden";
      TimeMe.visibilityChangeEventName = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
      TimeMe.hiddenPropName = "mozHidden";
      TimeMe.visibilityChangeEventName = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      TimeMe.hiddenPropName = "msHidden";
      TimeMe.visibilityChangeEventName = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      TimeMe.hiddenPropName = "webkitHidden";
      TimeMe.visibilityChangeEventName = "webkitvisibilitychange";
    }

    document.addEventListener(TimeMe.visibilityChangeEventName, () => {
      if (document[TimeMe.hiddenPropName]) {
        TimeMe.triggerUserHasLeftPageOrGoneIdle();
      } else {
        TimeMe.triggerUserHasReturned();
      }
    }, false);

    window.addEventListener('blur', () => {
      TimeMe.triggerUserHasLeftPageOrGoneIdle();
    });

    window.addEventListener('focus', () => {
      TimeMe.triggerUserHasReturned();
    });
  },

  listForIdleEvents: () => {
    document.addEventListener("mousemove", () => { TimeMe.userActivityDetected(); });
    document.addEventListener("keyup", () => { TimeMe.userActivityDetected(); });
    document.addEventListener("touchstart", () => { TimeMe.userActivityDetected(); });
    window.addEventListener("scroll", () => { TimeMe.userActivityDetected(); });

    setInterval(() => {
      if (TimeMe.isUserCurrentlyIdle !== true) {
        TimeMe.checkIdleState();
      }
    }, TimeMe.checkIdleStateRateMs);
  },

  websocket: undefined,

  websocketHost: undefined,

  setUpWebsocket: (websocketOptions) => {
    if (window.WebSocket && websocketOptions) {
      let websocketHost = websocketOptions.websocketHost; // "ws://hostname:port"
      try {
        TimeMe.websocket = new WebSocket(websocketHost);
        window.onbeforeunload = () => {
          TimeMe.sendCurrentTime(websocketOptions.appId);
        };
        TimeMe.websocket.onopen = () => {
          TimeMe.sendInitWsRequest(websocketOptions.appId);
        }
        TimeMe.websocket.onerror = (error) => {
          if (console) {
            console.log("Error occurred in websocket connection: " + error);
          }
        }
        TimeMe.websocket.onmessage = (event) => {
          if (console) {
            console.log(event.data);
          }
        }
      } catch (error) {
        if (console) {
          console.error("Failed to connect to websocket host.  Error:" + error);
        }
      }
    }
  },

  websocketSend: (data) => {
    TimeMe.websocket.send(JSON.stringify(data));
  },

  sendCurrentTime: (appId) => {
    let timeSpentOnPage = TimeMe.getTimeOnCurrentPageInMilliseconds();
    let data = {
      type: "INSERT_TIME",
      appId: appId,
      timeOnPageMs: timeSpentOnPage,
      pageName: TimeMe.currentPageName
    };
    TimeMe.websocketSend(data);
  },
  sendInitWsRequest: (appId) => {
    let data = {
      type: "INIT",
      appId: appId
    };
    TimeMe.websocketSend(data);
  },

  initialize: (options) => {

    let idleTimeoutInSeconds = TimeMe.idleTimeoutMs || 30;
    let currentPageName = TimeMe.currentPageName || "default-page-name";
    let websocketOptions = undefined;
    let initialStartTime = undefined;
    let trackWhenUserLeavesPage = true;
    let trackWhenUserGoesIdle = true;

    if (options) {
      idleTimeoutInSeconds = options.idleTimeoutInSeconds || idleTimeoutInSeconds;
      currentPageName = options.currentPageName || currentPageName;
      websocketOptions = options.websocketOptions;
      initialStartTime = options.initialStartTime;

      if (options.trackWhenUserLeavesPage === false) {
        trackWhenUserLeavesPage = false;
      }
      if (options.trackWhenUserGoesIdle === false) {
        trackWhenUserGoesIdle = false;
      }
    }

    TimeMe.setIdleDurationInSeconds(idleTimeoutInSeconds)
    TimeMe.setCurrentPageName(currentPageName)
    TimeMe.setUpWebsocket(websocketOptions)
    TimeMe.listenForVisibilityEvents(trackWhenUserLeavesPage, trackWhenUserGoesIdle);

    // TODO - only do this if page currently visible.

    TimeMe.startTimer(undefined, initialStartTime);
  }
}

//Initialize the TimeMe library and start tracking time
TimeMe.initialize({
  currentPageName: generateUuid(), // current page
  idleTimeoutInSeconds: 30 // seconds
});

//The function below is from http://detectmobilebrowsers.com
const checkMobile = function(){
  /**
   * Detects if a user if using a mobile device, based on the navigator useragent and vendor
  */
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}

const getQueryParamValue = function(paramName) {
  /**
   * Returns the value of a query parameter, if it exists
   * Returns null otherwise
   */
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
}

class FSDIngestor {
  /**
   * 
   * @param {*} clientId: The clientId which the data is associated with
   */

  constructor(clientId) {
    this.clientId = clientId; //useful if you are using this script for multiple domains
    this.urlPath = window.location.pathname;
    this.pageId = generateUuid();
    this.isMobile = checkMobile();
    this.resolution = String(parseInt(window.screen.width * window.devicePixelRatio)) + "x" + String(parseInt(window.screen.height * window.devicePixelRatio));
    this.uuid = null;
    this.sessionId = null;
    this.referrer = null;
    this.referrerHost = null;
    this.sessionReferrer = null;
    this.firstEverSession = null;
    this.firstEverPageview = null;
    this.numLifetimePageviews = null;
    this.numLifetimeSessions = null;
    this.sessionHitNum = null;
    this.activeLast24Hrs = null;
    this.activeLast7Days = null;
    this.timeSpent = null; //active time spent in seconds
    this.maxDepth = null; //maximum depth (in vertical page %) that the user scrolled to
    this.eventCounts = {}; //key-value object of event names and values
    this.eventNames = {}; //key-value object of event names and values
    this.source = getQueryParamValue("utm_source"); //equivalent of utm_source -- useful for measuring impact of a Call-to-Action or inline link
    this.campaign = getQueryParamValue("utm_campaign"); //equivalent of utm_campaign -- useful for measuring impact of a promotional campaign
    this.medium = getQueryParamValue("utm_medium"); //equivalent of utm_medium -- useful for understanding if users came from email, social media, or somewhere else
  }

  setUserSessionId() {
    /**
     * sets a unique UUID for the user, as well as for the session
     */
    let uuid = getStorage("fsd_uuid_" + this.clientId);
    if (uuid == null) {
      uuid = generateUuid();
      setStorage("fsd_uuid_" + this.clientId, uuid);
    }
    this.uuid = uuid;

    let sessionId = getSessionCookie("fsd_session_id_" + this.clientId);
    if (sessionId == null) {
      sessionId = generateUuid();
      setSessionCookie("fsd_session_id_" + this.clientId, sessionId);
    }
    this.sessionId = sessionId;
  }

  setReferrerDetails() {
    /**
     * sets referrer details – both the URL that a user came from, as well as a human readable version for more popular referrers. Like "Twitter" for "t.co" etc
     * Also sets a session referrer – the referrer responsible for beginning the user's session
     */
    let referrer = document.referrer;
    let referrerHost;
    if (referrer != ""){
      referrerHost = referrer.toString().replace(/^(.*\/\/[^\/?#]*).*$/,"$1").split('//')[1];
      if ((referrerHost.indexOf('.facebook.') !== -1) || (referrerHost.indexOf('.fb.') !== -1) || (referrerHost.indexOf('facebook.') === 0) || (referrerHost.indexOf('fb.') === 0)){
        referrerHost = 'Facebook';
      }
      else if ((referrerHost.indexOf("mail.google") !== -1) || (referrerHost.indexOf("gmail.com") !== -1)) {
        referrerHost = "Gmail"
      }
      else if ((referrerHost.indexOf('.google.') !== -1) || (referrerHost.indexOf('.googleusercontent.') !== -1) || (referrerHost.indexOf('google.') === 0)) {
        referrerHost = 'Google';
      }
      else if (referrerHost.indexOf('reddit.com') !== -1){
        referrerHost = 'Reddit';
      }
      else if (referrerHost.indexOf('t.co') === 0){
        referrerHost = 'Twitter';
      }
      else if ((referrerHost.indexOf('lnkd.in') === 0) || (referrerHost.indexOf('linkedin.') === 0)){
        referrerHost = 'LinkedIn';
      }
    }
    else {
      referrerHost = "direct";
      referrer = "direct";
    }
    this.referrer = referrer;
    this.referrerHost = referrerHost;

    let sessionReferrer = getSessionCookie("fsd_session_referrer_" + this.clientId);
    if (sessionReferrer == null) {
      sessionReferrer = referrerHost;
      setSessionCookie("fsd_session_referrer_" + this.clientId, sessionReferrer);      
    }
    this.sessionReferrer = sessionReferrer;
  }

  setLongTermUsageMetrics() {
    /**
     * Updates long term usage metrics, like lifetime pageviews, lifetime sessions, number of pages in a given session etc
     * Also computes if this is a user's first pageviews or session
     * Lastly, computes if the user has been active in the last 24 hours or the last 7 days
     */
    let numLifetimePageviews = getStorage("fsd_lifetime_pageviews_" + this.clientId);
    let numLifetimeSessions = getStorage("fsd_lifetime_sessions_" + this.clientId);
    let sessionHitNum = getSessionCookie("fsd_session_hit_num_" + this.clientId);

    if (numLifetimePageviews == null) {
      numLifetimePageviews = 1;
      this.firstEverPageview = true;
    } else {
      numLifetimePageviews = parseInt(numLifetimePageviews) + 1;
      this.firstEverPageview = false;
    }
    setStorage("fsd_lifetime_pageviews_" + this.clientId, numLifetimePageviews);
    this.numLifetimePageviews = numLifetimePageviews;

    if (numLifetimeSessions == null) {
      numLifetimeSessions = 0; //initialized to zero since it'll be added by 1 when checking for session hit number
      this.firstEverSession = true;
    } else {
      if (parseInt(numLifetimeSessions) === 0) {
        this.firstEverSession = true;
      } else {
        this.firstEverSession = false;
      }
    }

    if (sessionHitNum == null) {
      numLifetimeSessions = parseInt(numLifetimeSessions) + 1;
      sessionHitNum = 1;
    } else {
      sessionHitNum = parseInt(sessionHitNum) + 1;
    }
    
    this.numLifetimeSessions = numLifetimeSessions;
    this.sessionHitNum = sessionHitNum;
    
    setStorage("fsd_lifetime_sessions_" + this.clientId, numLifetimeSessions);
    setSessionCookie("fsd_session_hit_num_" + this.clientId, sessionHitNum);

    let lastActiveTime = getStorage("fsd_last_active_time_" + this.clientId);

    if (lastActiveTime == null) {
      this.activeLast24Hrs = false;
      this.activeLast7Days = false;
    } else {
      this.activeLast24Hrs = (new Date() - Date.parse(lastActiveTime)) < 24*3600*1000;
      this.activeLast7Days = (new Date() - Date.parse(lastActiveTime)) < 7*24*3600*1000;
    }
    setStorage("fst_last_active_time_" + this.clientId, (new Date).toISOString());
  }

  updateEngagementMetrics() {
    /**
     * Updates engagement metrics – active time spent and the maximum depth that a user has scrolled to on the page
     */
    let timeSpent = TimeMe.getTimeOnCurrentPageInSeconds();
    if (timeSpent < 0) {
      this.timeSpent = 0;
    } else if (timeSpent > 3600) {
      this.timeSpent = 3600;
    } else {
      this.timeSpent = timeSpent;
    }
    
    let curDepth = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0)/parseInt(document.body.clientHeight);
    if (curDepth >= this.maxDepth) {
      this.maxDepth = curDepth;
    }
  }

  sendDataToServer(serverURL = "YOUR_URL") {
    /**
     * @param serverURL: The url to send data to
     */
    const payload = JSON.stringify({
      clientId: this.clientId,
      urlPath: this.urlPath,
      pageId: this.pageId,
      isMobile: this.isMobile,
      resolution: this.resolution,
      uuid: this.uuid,
      sessionId: this.sessionId,
      referrer: this.referrer,
      referrerHost: this.referrerHost,
      sessionReferrer: this.sessionReferrer,
      firstEverSession: this.firstEverSession,
      firstEverPageview: this.firstEverPageview,
      numLifetimePageviews: this.numLifetimePageviews,
      numLifetimeSessions: this.numLifetimeSessions,
      sessionHitNum: this.sessionHitNum,
      activeLast24Hrs: this.activeLast24Hrs,
      activeLast7Days: this.activeLast7Days,
      timeSpent: this.timeSpent,
      maxDepth: this.maxDepth,
      eventCounts: this.eventCounts,
      eventNames: this.eventNames,
      source: this.source,
      campaign: this.campaign,
      medium: this.medium
    });
    
    if("sendBeacon" in navigator){
      navigator.sendBeacon(serverURL, payload);
    } else {
      var xmlhttp=new XMLHttpRequest();
      xmlhttp.open("POST", serverURL, true);
      xmlhttp.setRequestHeader("Content-Type", "application/json; charset=utf-8");
      xmlhttp.send(payload);
    }

    console.log(payload);
  }

  updateEventCounts(eventName) {
    if (eventName in this.eventCounts) {
      this.eventCounts[eventName] += 1;  
    } else {
      this.eventCounts[eventName] = 1;
    }
  }

  updateEventNames(eventName, eventValue) {
    if (eventName in this.eventNames) {
      this.events[eventName].append(eventValue);
    } else {
      this.events[eventName] = [eventValue];
    }
  }
}

let fsdIngestor;

function fsdIngest(clientId) {
  /**
   * Logs user data and sends it to a server
  */

  // First, initialize the ingestor
  fsdIngestor = new FSDIngestor(clientId);
  
  // then, set the user and session IDs
  fsdIngestor.setUserSessionId();

  // then, set the referrer details
  fsdIngestor.setReferrerDetails();

  // then, calculate usage metrics
  fsdIngestor.setLongTermUsageMetrics();
  
  // send data to the server at first – just to make sure we don't lose data
  fsdIngestor.sendDataToServer();
  
  // update engagement metrics every second. any more, and it'll impact performance
  window.setInterval(function() {
    fsdIngestor.updateEngagementMetrics();
  }, 1000);

  // any time there is a visibility change, send data to the server
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      fsdIngestor.sendDataToServer();
    }
  });

  // Safari doesn't always play nice with visbility change. So adding another alternative here
  window.addEventListener("pagehide", function() {
    fsdIngestor.sendDataToServer();
  });
}

function fsdUpdateEvent(eventName, eventValue, eventType) {
  /**
   * adds the name and value of an event to payload
   */
  if (eventType == "numeric") {
    fsdIngestor.updateEventCounts(eventName);
  } else if (eventType == "text") {
    fsdIngestor.updateEventNames(eventName, eventValue);
  }
}
