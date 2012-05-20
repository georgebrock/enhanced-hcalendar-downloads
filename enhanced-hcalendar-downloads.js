/*
Enhanced hCalendar downloads
Author: George Brocklehurst (george.brocklehurst@gmail.com)
*/

(function () {

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

            var urlStartDate = iso8601(evt.dtstart);
            var urlEndDate = iso8601(evt.dtend);

            var mDur = (evt.dtend.getTime() - evt.dtstart.getTime()) / 60000;
            var hDur = 0;
            if (mDur >= 60) {
                hDur = Math.floor(mDur / 60);
                mDur -= hDur * 60;
            }
            var urlDuration = pad(hDur) + pad(mDur);

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

    function iso8601(date) {
        var y, m, d, th, tm, ts;

        y = "" + date.getFullYear();
        m = pad(date.getMonth() + 1);
        d = pad(date.getDate());
        th = pad(date.getHours());
        tm = pad(date.getMinutes());
        ts = pad(date.getSeconds());

        return y + m + d + "T" + th + tm + ts;
    }

    // Pads 1 digit numbers with a leading zero
    // e.g. pad(7) === "07"; pad(11) === "11"
    function pad(num) {
        return num < 10 ? "0" + num : "" + num;
    }

}());
