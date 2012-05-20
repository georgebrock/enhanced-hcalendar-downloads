/*
Enhanced hCalendar downloads
Author: George Brocklehurst (george.brocklehurst@gmail.com)
*/

$(function () {
    enhancedHCalendarInitLinks(
        "a[href^=http://technorati.com/events/]," +
        "a[href^=http://feeds.technorati.com/events/]," +
        "a[href^=http://h2vx.com/ics/]");
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

function enhancedHCalendarMenu(technoratiURL) {
    // Make sure we have a menu
    var $menu = $("#enhanced-hcalendar-menu");
    if ($menu.length === 0) {
        $menu = $("<div></div>")
            .append("<h6>Add to...</h6>")
            .append($("<ul></ul>")
                .append("<li class=\"ics\"><a title=\"Download in iCalendar format for iCal, Outlook etc.\">Desktop calendar software</a></li>")
                .append("<li class=\"google\"><a>Google calendar</a></li>")
                .append("<li class=\"yahoo\"><a>Yahoo! calendar</a></li>")
                .append("<li class=\"thirtyboxes\"><a>30 boxes</a></li>")
            )
            .attr("id", "enhanced-hcalendar-menu")
            .mouseover(function(e) {
                $(this).show();
            })
            .mouseout(function(e) {
                $(this).hide();
            })
            .appendTo("body");
    }

    // Get variations on the technorati parser URL
    var eventFragmentURL = technoratiURL.replace(/^http:\/\/((feeds.)?technorati.com\/events|h2vx.com\/ics)\//, "");
    var webcalURL = technoratiURL.replace(/^http:\/\//, "webcal://");

    // Get the event container ID
    var parts = eventFragmentURL.split("#");
    var elementID = parts[1];

    // Set URLs that don't need specific event details
    $("#enhanced-hcalendar-menu li.ics a").attr("href", technoratiURL);
    $("#enhanced-hcalendar-menu li.thirtyboxes a").attr("href", "http://30boxes.com/add.php?ics="+technoratiURL);

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
        var urlDuration = (hDur < 10 ? "0"+hDur : hDur) + (mDur < 10 ? "0"+mDur : mDur);

        $("#enhanced-hcalendar-menu li.google, #enhanced-hcalendar-menu li.yahoo").show();

        $("#enhanced-hcalendar-menu h6").html("Add &ldquo;"+evt.summary+"&rdquo; to...");
        $("#enhanced-hcalendar-menu li.google a").attr("href", "http://www.google.com/calendar/event?action=TEMPLATE&text="+evt.summary+"&dates="+urlStartDate+"/"+urlEndDate+(typeof(evt.location) != "undefined" ? "&location="+evt.location : "")+"&sprop=website:"+window.location);
        $("#enhanced-hcalendar-menu li.yahoo a").attr("href", "http://calendar.yahoo.com/?v=60&TITLE="+evt.summary+"&ST="+urlStartDate+"&DUR="+urlDuration+(typeof(evt.location) != "undefined" ? "&in_loc="+evt.location : "")+"&URL="+eventFragmentURL);
    } else {
        $("#enhanced-hcalendar-menu h6").html("Add to...");
        $("#enhanced-hcalendar-menu li.google, #enhanced-hcalendar-menu li.yahoo").hide();
    }

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
