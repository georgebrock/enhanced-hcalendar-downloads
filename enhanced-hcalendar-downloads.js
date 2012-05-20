/*
Enhanced hCalendar downloads
Author: George Brocklehurst (george.brocklehurst@gmail.com)
*/

$(function () {
    enhancedHCalendarInitLinks(
        "a[href^='http://technorati.com/events/']," +
        "a[href^='http://feeds.technorati.com/events/']," +
        "a[href^='http://h2vx.com/ics/']");
});

function enhancedHCalendarInitLinks(selector) {
    $(selector).click(function (e) {
        var $menu, x, y;

        $menu = enhancedHCalendarMenu($(this).attr("href"));
        if (!$menu) {
            return true;
        }

        $menu
            .css("position", "absolute")
            .show();

        x = e.pageX - 30;
        y = e.pageY - 30;

        if (x < 2) {
            x = 2;
        }

        if (y < 2) {
            y = 2;
        }

        if (x + $menu.width() > $(window).width()) {
            x = $(window).width() - $menu.width() - 2;
        }

        if (y + $menu.height() > $(window).height()) {
            y = $(window).height() - $menu.height() - 2;
        }

        $menu.css({
            "top": y + "px",
            "left": x + "px"
        });

        if (typeof(this.blur) === "function") {
            this.blur();
        }

        return false;
    });
}

function enhancedHCalendarMenu(iCalendarURL) {
    var $menu, $list;

    $menu = $("#enhanced-hcalendar-menu");
    if ($menu.length === 0) {
        $list = $("<ul></ul>");
        $menu = $("<div></div>")
            .append("<h6>Add to&hellip;</h6>")
            .append($list)
            .attr("id", "enhanced-hcalendar-menu")
            .mouseleave(function(e) {
                $(this).hide();
            })
            .appendTo("body");
    } else {
        $list = $menu.find("ul");
        $list.html("");
    }

    // Get variations on the technorati parser URL
    var eventFragmentURL = iCalendarURL.replace(
        /^http:\/\/((feeds.)?technorati.com\/events|h2vx.com\/ics)\//, "");

    // Get the event container ID
    var parts = eventFragmentURL.split("#");
    var elementID = parts[1];

    // Extract event using sumo
    var events = HCalendar.discover(document.getElementById(elementID));
    if (events.length > 0) {
        var evt = events[0];

        if (!evt.dtend) {
            if (evt.duration) {
                var durationMinutes = evt.duration.match(/^PT(\d+)M$/)[1];
                evt.dtend = new Date();
                evt.dtend.setTime(evt.dtstart.getTime() + durationMinutes * 60000);
            } else {
                evt.dtend = evt.dtstart;
            }
        }

        var urlStartDate = enhancedHCalendarMakeISODate(evt.dtstart);
        var urlEndDate = enhancedHCalendarMakeISODate(evt.dtend);

        var mDur = (evt.dtend.getTime() - evt.dtstart.getTime()) / 60000;
        var hDur = 0;
        if (mDur >= 60) {
            hDur = Math.floor(mDur / 60);
            mDur -= hDur * 60;
        }
        var urlDuration = (hDur < 10 ? "0"+hDur : hDur) +
                          (mDur < 10 ? "0"+mDur : mDur);

        $menu.find("h6").html("Add &ldquo;"+evt.summary+"&rdquo; to&hellip;");

        var googleURL = "http://www.google.com/calendar/event" +
                        "?action=TEMPLATE" +
                        "&text=" + evt.summary +
                        "&dates=" + urlStartDate + "/" + urlEndDate +
                        "&sprop=website:" + window.location;
        if (evt.location !== undefined) {
            googleURL += "&location=" + evt.location;
        }

        $list.append(
            "<li class='google'>" +
            "<a href='" + googleURL + "'>Google Calendar</a>" +
            "</li>");

        var yahooURL = "http://calendar.yahoo.com/" +
                       "?v=60" +
                       "&TITLE=" + evt.summary +
                       "&ST=" + urlStartDate +
                       "&DUR=" + urlDuration +
                       "&URL=" + eventFragmentURL;
        if (evt.location !== undefined) {
            yahooURL += "&in_loc=" + evt.location;
        }

        $list.append(
            "<li class='yahoo'>" +
            "<a href='" + yahooURL + "'>Yahoo! Calendar</a>" +
            "</li>");
    }

    // Set URLs that don't need specific event details
    $list.prepend(
        "<li class='ics'>" +
        "<a href='" + iCalendarURL + "'" +
        "title='Download in iCalendar format for iCal, Outlook etc.'>" +
        "Desktop calendar software" +
        "</a></li>");

    $list.append(
        "<li class='thirtyboxes'>" +
        "<a href='http://30boxes.com/add.php?ics=" + iCalendarURL + "'>" +
        "30 boxes" +
        "</a></li>");


    return $menu;
}

function enhancedHCalendarMakeISODate(date) {
    var d = {};
    d.y = ""+date.getFullYear();
    d.m = ""+(date.getMonth() + 1);
    d.d = ""+date.getDate();
    d.th = ""+date.getHours();
    d.tm = ""+date.getMinutes();
    d.ts = ""+date.getSeconds();
    for (i in d) {
        if (d[i].length < 2) {
            d[i] = "0"+d[i];
        }
    }

    return d.y+d.m+d.d+"T"+d.th+d.tm+d.ts;
}
