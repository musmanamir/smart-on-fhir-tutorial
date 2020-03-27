function timeline() {

    var list = [];
    var regDate = pregDate = new Date();
    var currentStartDate;
    var currentEndDate;
    var checkedEvents = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    var viewType = 3;
    var pid = $("#CRMpatietid").val(); // parent.Xrm.Page.data.entity.getId();
    var userId = ""; // parent.Xrm.Page.context.getUserId();
    var userDateFormat = 'MM/DD/YYYY';
    var isChanged = false;
    var defaultName = "NA";
    var timeLineFooter = '<div class="timelineFooter"> <a class="previousnext round" style="cursor:pointer;" onclick="javascript:movePrevious()" > &#8249 </a> <a  class="previousnext round" style="cursor:pointer;" onclick="javascript:moveNext()"> &#8250 </a>  </div> ';
    //var checkboxesVisible = false;

    if (pid == '' || pid == null) {
        $('.timelineControl').hide();
        $('.errorMessage').show();

    } else {
        $('.errorMessage').hide();
        $('.timelineControl').show();
        getPatientRegistrationDate();

        var selectedDates = getMinMaxDates();
        var sDate = moment(selectedDates.min).format('MM/DD/YYYY');
        var eDate = moment(selectedDates.max).format('MM/DD/YYYY');

        loadData(true, sDate, eDate);
    }

    // EVENTS
    $("input[type=checkbox]").on("click", function () {
        var ev = $("input[name=events]");

        if (this.value == 0) //select all
        {
            for (var index = 0; index < ev.length; index++) {
                ev[index].checked = this.checked;
            }
        }

        checkedEvents = [];
        for (var index = 0; index < ev.length; index++) {
            if (ev[index].checked)
                checkedEvents.push(ev[index].value);
        }

        var selectedDates = getMinMaxDates();
        var sDate = moment(selectedDates.min).format('MM/DD/YYYY');
        var eDate = moment(selectedDates.max).format('MM/DD/YYYY');

        var eventSelect = document.getElementById("eventSelect");
        var arrow = eventSelect.innerText.slice(-1);
        if (checkedEvents.length == 0)
            eventSelect.innerText = "Events " + arrow;
        else
            if (checkedEvents.length == ev.length)
                eventSelect.innerText = "All Events " + arrow;
            else
                eventSelect.innerText = checkedEvents.length + " out of " + ev.length + " events " + arrow


        loadData(false, sDate, eDate);
    });

    $("#dayMenu").click(function () {
        if (!$(this).hasClass("active")) {
            isChanged = false;
            $(this).addClass("active");
            $("#weekMenu").removeClass("active");
            $("#monthMenu").removeClass("active");
            viewType = 1;
            regDate = pregDate;
            var minDate = '';
            var daysdiff = moment().diff(moment(pregDate).format('MM/DD/YYYY'), 'days');
            if (daysdiff < 6)
                minDate = moment(pregDate).format('MM/DD/YYYY');
            else
                minDate = moment().subtract(6, 'd').format('MM/DD/YYYY');

            var maxDate = moment().format('MM/DD/YYYY');
            $('#txtStartDate').attr('min', moment(pregDate).format('MM/DD/YYYY'));
            $('#txtStartDate').attr('max', moment(new Date()).format('MM/DD/YYYY'));

            $('#txtEndDate').attr('min', moment(pregDate).format('MM/DD/YYYY'));
            $('#txtEndDate').attr('max', moment(new Date()).format('MM/DD/YYYY'));

            $('#txtStartDate').val(minDate);
            $('#txtEndDate').val(maxDate);


            refreshTimeline();
            $('.weekly').hide();
            $('.monthly').hide();
            $('.daily').show();
        }
    });

    $("#weekMenu").click(function () {
        if (!$(this).hasClass("active")) {
            $(this).addClass("active");
            isChanged = false;
            $("#dayMenu").removeClass("active");
            $("#monthMenu").removeClass("active");

            viewType = 2;
            regDate = pregDate;
            var minDate = '';
            var maxDate = moment().startOf('week').format('MM/DD/YYYY');
            var maxweekdiff = moment(maxDate).diff(moment(pregDate).format('MM/DD/YYYY'), 'weeks');
            var maxdaydiff = moment(maxDate).diff(moment(pregDate).format('MM/DD/YYYY'), 'days');

            if (maxweekdiff < 3)
                minDate = moment(pregDate).format('MM/DD/YYYY');
            else
                minDate = moment(maxDate).subtract(3, 'weeks').format('MM/DD/YYYY');

            $('#txtStartDate').attr('min', moment(pregDate).format('MM/DD/YYYY'));
            $('#txtStartDate').attr('max', moment(new Date()).format('MM/DD/YYYY'));
            $('#txtEndDate').attr('min', moment(pregDate).format('MM/DD/YYYY'));
            $('#txtEndDate').attr('max', moment(new Date()).format('MM/DD/YYYY'));

            $('#txtStartDate').val(minDate);
            $('#txtEndDate').val(moment().format('MM/DD/YYYY'));

            refreshTimeline();
            $('.daily').hide();
            $('.monthly').hide();
            $('.weekly').show();
        }
    });

    $("#monthMenu").click(function () {
        if (!$(this).hasClass("active")) {
            $(this).addClass("active");
            isChanged = false;
            $("#weekMenu").removeClass("active");
            $("#dayMenu").removeClass("active");

            viewType = 3;
            regDate = pregDate;
            var minDate = '';
            var maxDate = moment().format('MM/DD/YYYY');

            var monthsdiff = moment().diff(moment(pregDate).format('MM/DD/YYYY'), 'months');
            if (monthsdiff < 5)
                minDate = moment(pregDate).format('MM/DD/YYYY');
            else
                minDate = moment(new Date()).subtract(5, 'months').startOf('month').format('MM/DD/YYYY');

            $('#txtStartDate').attr('min', moment(pregDate).format('MM/DD/YYYY'));
            $('#txtStartDate').attr('max', moment(new Date()).format('MM/DD/YYYY'));
            $('#txtEndDate').attr('min', moment(pregDate).format('MM/DD/YYYY'));
            $('#txtEndDate').attr('max', moment(new Date()).format('MM/DD/YYYY'));

            $('#txtStartDate').val(minDate);
            $('#txtEndDate').val(maxDate);

            refreshTimeline();
            $('.weekly').hide();
            $('.daily').hide();
            $('.monthly').show();
        }
    });

    $("#txtStartDate").change(function () {
        isChanged = false;
        var Date = '', currDate = '';

        if (moment($(this).datepicker('getDate')).diff(pregDate) < 0)
            currDate = pregDate;
        else if (moment().diff($(this).datepicker('getDate')) < 0)
            currDate = moment().format('MM/DD/YYYY');
        else
            currDate = moment($(this).datepicker('getDate')).format('MM/DD/YYYY');
        $(this).datepicker('setDate', currDate);

        if (viewType == 1) {
            var daysdiff = moment().diff(currDate, 'days');

            if (currDate == $('#txtEndDate').val())
                Date = currDate;
            else if (daysdiff < 6)
                Date = moment().format('MM/DD/YYYY');
            else
                Date = moment(currDate).add(6, 'd').format('MM/DD/YYYY');
        }
        else if (viewType == 2) {
            var weeksdiff = moment().diff(currDate, 'weeks');
            if (currDate == $('#txtEndDate').val())
                Date = currDate;
            else if (weeksdiff < 3)
                Date = moment().format('MM/DD/YYYY');
            else
                Date = moment(currDate).add(3, 'weeks').format('MM/DD/YYYY');
        }
        else if (viewType == 3) {
            var monthsdiff = moment().diff(currDate, 'months');
            if (currDate == $('#txtEndDate').val())
                Date = currDate;
            else if (monthsdiff < 5)
                Date = moment().format('MM/DD/YYYY');
            else
                Date = moment(currDate).add(5, 'months').format('MM/DD/YYYY');
        }
        $('#txtEndDate').val(Date);

        refreshTimeline();
    });

    $("#txtEndDate").change(function () {
        isChanged = false;
        var Date = '', currDate = '';

        if (moment($(this).datepicker('getDate')).diff(pregDate) < 0)
            currDate = pregDate;
        else if (moment().diff($(this).datepicker('getDate')) < 0)
            currDate = moment().format('MM/DD/YYYY');
        else
            currDate = moment($(this).datepicker('getDate')).format('MM/DD/YYYY');

        $(this).datepicker('setDate', currDate);
        regDate = currDate;

        if (viewType == 1) {
            var daysdiff = moment(currDate).diff(moment(pregDate).format('MM/DD/YYYY'), 'days');
            if (currDate == $('#txtStartDate').val())
                Date = currDate;
            else if (daysdiff < 6)
                Date = moment(pregDate).format('MM/DD/YYYY');
            else
                Date = moment(currDate).subtract(6, 'd').format('MM/DD/YYYY');
        }
        else if (viewType == 2) {
            var weeksdiff = moment(currDate).diff(moment(pregDate).format('MM/DD/YYYY'), 'weeks');
            if (currDate == $('#txtStartDate').val())
                Date = currDate;
            else if (weeksdiff < 3)
                Date = moment(pregDate).format('MM/DD/YYYY');
            else
                Date = moment(currDate).subtract(3, 'weeks').format('MM/DD/YYYY');
        }
        else if (viewType == 3) {
            var monthsdiff = moment(currDate).diff(moment(pregDate).format('MM/DD/YYYY'), 'months');
            if (currDate == $('#txtStartDate').val())
                Date = currDate;
            else if (monthsdiff < 5)
                Date = moment(pregDate).format('MM/DD/YYYY');
            else
                Date = moment(currDate).subtract(5, 'months').format('MM/DD/YYYY');
        }
        $('#txtStartDate').val(Date);

        refreshTimeline();
    });

    // FUNCTIONS

    //function showCheckboxOptions() {
    //    var checkboxes = document.getElementById("checkboxEventList");
    //    var eventSelect = document.getElementById("eventSelect");
    //    if (!checkboxesVisible) {
    //        eventSelect.innerText = eventSelect.innerText.replace("▼", "▲");
    //        checkboxes.style.display = '';
    //        checkboxesVisible = true;
    //    }
    //    else {
    //        eventSelect.innerText = eventSelect.innerText.replace("▲", "▼");
    //        checkboxes.style.display = 'none';
    //        checkboxesVisible = false;
    //    }
    //}

    function loadData(doSync, sDate, eDate) {
        $("._loader").show();
        setTimeout(function () {

            currentStartDate = sDate;
            currentEndDate = eDate;

            var startDate = sDate; //moment(selectedDates.min).format('MM/DD/YYYY');
            var endDate = eDate; //moment(selectedDates.max).format('MM/DD/YYYY');

            $('#txtStartDate').val(sDate);
            $('#txtEndDate').val(eDate);

            if (doSync) {
                //loadUserDateFormat();

                list = [];
                //if (checkedEvents.indexOf('1') > -1) {
                //    loadAppointments(sDate, eDate);
                //}
                //if (checkedEvents.indexOf('2') > -1) {
                //    loadDevices(sDate, eDate);
                //}
                //if (checkedEvents.indexOf('3') > -1) {
                //    loadMedications(sDate, eDate);
                //}
                //if (checkedEvents.indexOf('4') > -1) {
                //    NutritionOrders(sDate, eDate);
                //}
                //if (checkedEvents.indexOf('5') > -1) {
                //    Tasks(sDate, eDate);
                //}
                //if (checkedEvents.indexOf('6') > -1) {
                //    Procedures(sDate, eDate);
                //}
                //if (checkedEvents.indexOf('7') > -1) {
                //    Referrals(sDate, eDate);
                //}
                //if (checkedEvents.indexOf('8') > -1) {
                //    Encounter(sDate, eDate);
                //}
                if (checkedEvents.indexOf('9') > -1) {
                    CarePlan(sDate, eDate);
                }
                if (checkedEvents.indexOf('11') > -1) {
                    Allergy(sDate, eDate);
                }
                if (checkedEvents.indexOf('12') > -1) {
                    Observation(sDate, eDate);
                }
                //if (checkedEvents.indexOf('10') > -1) {
                //   CarePlanGoal(sDate, eDate);
                //}
            }

            //event = $('select').val() == null ? '' : $('select').val();
            var fltrData = list.filter(function (e) { return this.indexOf(e.type.toString()) > -1; }, checkedEvents);
            fltrData.sort(dateSort);

            var rowCount = 0;
            var minRowCount = 10; // used to store the minimum rows to be shown in the grid, regardless the number of matching events.

            if (viewType == 1) {
                var dates = getDateRange(startDate, endDate, 'MM/DD/YYYY');
                $('.dailyHeader').empty();
                $('#dailyTab').empty();
                $('.weeklyHeader').empty();
                $('#weeklyTab').empty();
                $('.monthlyHeader').empty();
                $('#monthlyTab').empty();

                for (var i = dates.length - 1; i >= 0; i--) {
                    $('.dailyHeader').append('<li>' + dates[i] + '</li>');
                }
                for (var i = dates.length - 1; i >= 0; i--) {
                    var innercol = '';
                    var tblrow = '';

                    var filterData = $.grep(fltrData, function (v) {
                        return (v.date === dates[i] && moment(v.date) >= moment(startDate) && moment(v.date) <= moment(endDate));
                    });

                    if (filterData.length > 0) {
                        for (var j = 0; j < filterData.length; j++) {
                            if ($('#r-' + j).length == 0) {
                                var tempcol = '';
                                for (var k = dates.length - 1; k >= 0; k--) {
                                    if (filterData[j].date == dates[k]) {
                                        tempcol += '<div class="cellFlex" id="c-' + j + k + '"><div class="note"><img src="' + getTypeImageName(filterData[j].type) + '" alt="' + getTypeImageAltName(filterData[j].type) + '"> <p><a class="openLink" data-id="' + filterData[j].id + '" data-entity="' + filterData[j].entity + '">' + filterData[j].name + '</a></p> </div></div>';
                                    }
                                    else if (moment(dates[k]) < moment(pregDate)) {
                                        tempcol += '<div class="cellFlex greyOut" id="c-' + j + k + '"></div>';
                                    }
                                    else {
                                        tempcol += '<div class="cellFlex" id="c-' + j + k + '"></div>';
                                    }
                                }
                                $('#dailyTab').append('<div class="rowFlex" id="r-' + j + '">' + tempcol + '</div>');
                                rowCount += 1;
                            }
                            else if ($('#r-' + j).length > 0) {
                                var tempcol = '';
                                for (var k = dates.length - 1; k >= 0; k--) {
                                    if (filterData[j].date == dates[k]) {
                                        tempcol = '<div class="note"><img src="' + getTypeImageName(filterData[j].type) + '" alt="' + getTypeImageAltName(filterData[j].type) + '"> <p><a class="openLink" data-id="' + filterData[j].id + '" data-entity="' + filterData[j].entity + '">' + filterData[j].name + '</a></p> </div>';
                                        $('#c-' + j + k).append(tempcol);
                                    }
                                }
                            }
                        }
                    }

                }
                if ($('#dailyTab').is(':empty')) {
                    $('#dailyTab').append('<div class="noRecordFound">' + '<img src="./src/images/no_record.pngg"><p>No Record(s) found.</p>' + '</div>');
                }
                else {
                    while (rowCount < minRowCount) {
                        var tempcol = '';
                        for (var k = dates.length - 1; k >= 0; k--) {
                            if (moment(dates[k]) < moment(pregDate)) {
                                tempcol += '<div class="cellFlex greyOut" id="c-' + j + k + '"></div>';
                            }
                            else {
                                tempcol += '<div class="cellFlex" id="c-' + j + k + '"></div>';
                            }
                        }
                        $('#dailyTab').append('<div class="rowFlex" id="r-' + j + '">' + tempcol + '</div>');
                        rowCount += 1;
                    }
                }

                $('#dailyTab').append(timeLineFooter);
            }
            else if (viewType == 2) {
                var dates = getDateRange(startDate, endDate, 'MM/DD/YYYY');

                $('.dailyHeader').empty();
                $('#dailyTab').empty();
                $('.weeklyHeader').empty();
                $('#weeklyTab').empty();
                $('.monthlyHeader').empty();
                $('#monthlyTab').empty();

                for (var i = dates.length - 1; i >= 0; i--) {
                    //var nextWeek = eDate = moment(dates[i]).add(7, 'days').format('MM/DD/YYYY');
                    $('.weeklyHeader').append('<li><a href=javascript:openWeek("' + dates[i] + '")>' + dates[i] + '</a></li>');
                }
                for (var i = 0; i <= dates.length - 1; i++) {
                    var innercol = '';
                    var tblrow = '';

                    var filterData = $.grep(fltrData, function (v) {
                        if (i == 0) {
                            return (moment(v.date) >= moment(dates[i]) && moment(v.date) >= moment(startDate) && moment(v.date) <= moment(endDate));
                        }
                        else {
                            return (moment(v.date) >= moment(dates[i]) && (((moment(v.date) < moment(dates[i - 1])) && dates[i - 1] != undefined) || (v.date == dates[i] && i == 0)) && moment(v.date) >= moment(startDate) && moment(v.date) <= moment(endDate));
                        }
                    });


                    if (filterData.length > 0) {
                        for (var j = 0; j < filterData.length; j++) {
                            if ($('#r-' + j).length == 0) {
                                var tempcol = '';
                                var isMatch = false;
                                for (var k = dates.length - 1; k >= 0; k--) {

                                    if (moment(filterData[j].date) >= moment(dates[k]) && moment(filterData[j].date) < moment(dates[k - 1]) && isMatch == false) {
                                        tempcol += '<div class="cellFlex" id="c-' + j + k + '"><div class="note"><img src="' + getTypeImageName(filterData[j].type) + '" alt="' + getTypeImageAltName(filterData[j].type) + '"> <p><a class="openLink" data-id="' + filterData[j].id + '" data-entity="' + filterData[j].entity + '">' + filterData[j].name + '</a></p> </div></div>';
                                        isMatch = true;
                                    }
                                    else if (moment(dates[k]) < moment(pregDate).startOf('week')) {
                                        tempcol += '<div class="cellFlex greyOut" id="c-' + j + k + '"></div>';
                                    }
                                    else {
                                        tempcol += '<div class="cellFlex" id="c-' + j + k + '"></div>';
                                    }
                                }
                                $('#weeklyTab').append('<div class="rowFlex" id="r-' + j + '">' + tempcol + '</div>');
                                rowCount += 1;
                            }
                            else if ($('#r-' + j).length > 0) {
                                var tempcol = '';
                                for (var k = 0; k <= dates.length - 1; k++) {
                                    if (moment(filterData[j].date) >= moment(dates[k]) && moment(filterData[j].date) < moment(dates[k - 1])) {
                                        tempcol = '<div class="note"><img src="' + getTypeImageName(filterData[j].type) + '" alt="' + getTypeImageAltName(filterData[j].type) + '"> <p><a class="openLink" data-id="' + filterData[j].id + '" data-entity="' + filterData[j].entity + '">' + filterData[j].name + '</a></p> </div>';

                                        $('#c-' + j + k).append(tempcol);

                                    }
                                }
                            }
                        }
                    }

                }

                if ($('#weeklyTab').is(':empty')) {
                    $('#weeklyTab').append('<div class="noRecordFound">' + '<img src="./src/images/no_record.png"><p>No Record(s) found.</p>' + '</div>');
                }
                else {
                    while (rowCount < minRowCount) {
                        var tempcol = '';
                        for (var k = dates.length - 1; k >= 0; k--) {
                            if (moment(dates[k]) < moment(pregDate)) {
                                tempcol += '<div class="cellFlex greyOut" id="c-' + j + k + '"></div>';
                            }
                            else {
                                tempcol += '<div class="cellFlex" id="c-' + j + k + '"></div>';
                            }
                        }
                        $('#weeklyTab').append('<div class="rowFlex" id="r-' + j + '">' + tempcol + '</div>');
                        rowCount += 1;
                    }
                }
                $('#weeklyTab').append(timeLineFooter);
            }
            else if (viewType == 3) {
                var dates = getDateRange(startDate, endDate, 'MM/DD/YYYY');
                $('.dailyHeader').empty();
                $('#dailyTab').empty();
                $('.weeklyHeader').empty();
                $('#weeklyTab').empty();
                $('.monthlyHeader').empty();
                $('#monthlyTab').empty();


                for (var i = dates.length - 1; i >= 0; i--) {
                    var firstOfMonth = (moment(dates[i]).month() + 01) + "/01/" + moment(dates[i]).year();
                    $('.monthlyHeader').append('<li><a href=javascript:openMonth("' + firstOfMonth + '")>' + moment(dates[i]).format('MMM') + ' ' + moment(dates[i]).year() + '</li>');
                }
                for (var i = 0; i <= dates.length - 1; i++) {
                    var innercol = '';
                    var tblrow = '';
                    var filterData = $.grep(fltrData, function (v) {
                        return (moment(v.date).month() + 1 == moment(dates[i]).month() + 1 && moment(v.date).year() == moment(dates[i]).year() &&
                            moment(v.date) >= moment(startDate) &&
                            moment(v.date) <= moment(endDate));
                    });


                    if (filterData.length > 0) {
                        for (var j = 0; j < filterData.length; j++) {
                            if ($('#r-' + j).length == 0) {
                                var tempcol = '';
                                var isMatch = false;
                                for (var k = dates.length - 1; k >= 0; k--) {
                                    if (moment(filterData[j].date).month() + 1 == moment(dates[k]).month() + 1 && moment(filterData[j].date).year() == moment(dates[k]).year() && isMatch == false) {
                                        tempcol += '<div class="cellFlex" id="c-' + j + k + '"><div class="note"><img src="' + getTypeImageName(filterData[j].type) + '" alt="' + getTypeImageAltName(filterData[j].type) + '"> <p><a class="openLink" data-id="' + filterData[j].id + '" data-entity="' + filterData[j].entity + '">' + filterData[j].name + '</a></p> </div></div>';
                                        isMatch = true;
                                    }
                                    else if (moment(dates[k]) < moment(pregDate)) {
                                        tempcol += '<div class="cellFlex greyOut" id="c-' + j + k + '"></div>';
                                    }
                                    else {
                                        tempcol += '<div class="cellFlex" id="c-' + j + k + '"></div>';
                                    }
                                }
                                $('#monthlyTab').append('<div class="rowFlex" id="r-' + j + '">' + tempcol + '</div>');
                                rowCount += 1;
                            }
                            else if ($('#r-' + j).length > 0) {
                                var tempcol = '';
                                for (var k = 0; k <= dates.length - 1; k++) {
                                    if (moment(filterData[j].date).month() + 1 == moment(dates[k]).month() + 1 && moment(filterData[j].date).year() == moment(dates[k]).year()) {
                                        tempcol = '<div class="note"><img src="' + getTypeImageName(filterData[j].type) + '" alt="' + getTypeImageAltName(filterData[j].type) + '"> <p><a class="openLink" data-id="' + filterData[j].id + '" data-entity="' + filterData[j].entity + '">' + filterData[j].name + '</a></p> </div>';
                                        $('#c-' + j + k).append(tempcol);
                                    }
                                }
                            }
                        }
                    }

                }
                if ($('#monthlyTab').is(':empty')) {
                    $('#monthlyTab').append('<div class="noRecordFound">' + '<img src="./src/images/no_record.png"><p>No Record(s) found.</p>' + '</div>');
                }
                else {
                    while (rowCount < minRowCount) {
                        var tempcol = '';
                        for (var k = dates.length - 1; k >= 0; k--) {
                            if (moment(dates[k]) < moment(pregDate)) {
                                tempcol += '<div class="cellFlex greyOut" id="c-' + j + k + '"></div>';
                            }
                            else {
                                tempcol += '<div class="cellFlex" id="c-' + j + k + '"></div>';
                            }
                        }
                        $('#monthlyTab').append('<div class="rowFlex" id="r-' + j + '">' + tempcol + '</div>');
                        rowCount += 1;
                    }
                }
                $('#monthlyTab').append(timeLineFooter);
            }

            $(".note img").click(function () {
                var $control = $(this).next('p');
                if ($control.is(":not(:visible)")) {
                    $control.removeClass('addTranslate');
                    $control.addClass('removeTranslate');
                    setTimeout(function () {
                        $control.show();
                    }, 300);
                } else {
                    $control.addClass('addTranslate');
                    $control.removeClass('removeTranslate');
                    setTimeout(function () {
                        $control.hide();
                    }, 300);
                }
            });

            $(".openLink").click(function () {
                var id = $(this).data("id");
                var entity = $(this).data("entity");
                openForm(id, entity);
            });

            enableDisableBackForward();
            $("._loader").hide();

        }, 500);
    }


    function moveNext() {
        var sDate, eDate;
        switch (viewType) {
            case 1:
                sDate = moment(currentStartDate).add(7, 'days').format('MM/DD/YYYY');
                eDate = moment(currentEndDate).add(7, 'days').format('MM/DD/YYYY');
                break;
            case 2:
                sDate = moment(currentStartDate).add(4, 'weeks').format('MM/DD/YYYY');
                eDate = moment(currentEndDate).add(4, 'weeks').format('MM/DD/YYYY');
                break;
            case 3:
                sDate = moment(currentStartDate).add(6, 'months').format('MM/DD/YYYY');
                eDate = moment(currentEndDate).add(6, 'months').format('MM/DD/YYYY');
                break;
        }

        loadData(true, sDate, eDate);
    }
    debugger;
    function movePrevious() {
        var sDate, eDate;
        switch (viewType) {
            case 1:
                sDate = moment(currentStartDate).subtract(7, 'days').format('MM/DD/YYYY');
                eDate = moment(currentEndDate).subtract(7, 'days').format('MM/DD/YYYY');
                break;
            case 2:
                sDate = moment(currentStartDate).subtract(4, 'weeks').format('MM/DD/YYYY');
                eDate = moment(currentEndDate).subtract(4, 'weeks').format('MM/DD/YYYY');
                break;
            case 3:
                sDate = moment(currentStartDate).subtract(6, 'months').format('MM/DD/YYYY');
                eDate = moment(currentEndDate).subtract(6, 'months').format('MM/DD/YYYY');
                break;
        }

        loadData(true, sDate, eDate);
    }

    function loadUserDateFormat() {
        var query = "?$select=dateformatstring&$filter=" + encodeURIComponent("systemuserid eq " + userId.replace(/[{}]/g, "")) + "";

        return parent.Xrm.WebApi.retrieveMultipleRecords("usersettings", query).then(
            function success(results) {
                if (results.entities.length > 0) {
                    userDateFormat = results.entities[0].dateformatstring.toUpperCase();
                }
            },
            function (error) {
                console.log(error.message);
                return Promise.reject(error.message);
            }
        );
    }

    function loadAppointments(sdate, edate) {
        var query = '<fetch mapping="logical" version="1.0" distinct="false" output-format="xml-platform">'
            + '  <entity name="msemr_appointmentemr">'
            + '    <attribute name="activityid" />'
            + '    <attribute name="subject" />'
            + '    <attribute name="msemr_starttime" />'
            + '    <filter type="and">'
            + '      <condition attribute="msemr_actorpatient" operator="eq" value="' + pid + '" />'
            + '      <condition value="' + sdate + '" attribute="msemr_starttime"  operator="on-or-after"  />'
            + '      <condition value="' + edate + '" attribute="msemr_starttime"  operator="on-or-before"  />'
            //+ '      <condition value="'+edate+'" attribute="msemr_endtime" operator="on-or-before" />'
            + '    </filter>'
            + '  </entity>'
            + '</fetch>';

        return parent.Xrm.WebApi.retrieveMultipleRecords("msemr_appointmentemr", "?fetchXml=" + encodeURIComponent(query)).then(
            function success(results) {
                for (var i = 0; i < results.entities.length; i++) {
                    var dataSet = results.entities[i];
                    var item = {};

                    if (dataSet.hasOwnProperty('activityid')) {
                        item.id = dataSet.activityid;
                    }

                    if (dataSet.hasOwnProperty('subject')) {
                        item.name = dataSet.subject;
                    } else {
                        item.name = "Appointment";
                    }

                    if (dataSet.hasOwnProperty('msemr_starttime')) {
                        item.date = moment(dataSet['msemr_starttime@OData.Community.Display.V1.FormattedValue'], userDateFormat).format('MM/DD/YYYY');
                        item.dateTime = moment.utc(dataSet.msemr_starttime).format('YYYY-MM-DD HH:mm:ss');
                    }
                    item.type = 1;
                    item.entity = "msemr_appointmentemr";
                    list.push(item);
                };
                return Promise.resolve();
            },
            function (error) {
                console.log(error.message);
                return Promise.reject(error.message);
            }
        );
    }

    function loadDevices(sdate, edate) {
        var query = '<fetch mapping="logical" version="1.0" distinct="false" output-format="xml-platform">'
            + '  <entity name="msemr_devicerequest">'
            + '    <attribute name="msemr_devicerequestid" />'
            + '    <attribute name="msemr_codetype" />'
            + '    <attribute name="msemr_codetypererence" />'
            + '    <attribute name="msemr_codetypecodeableconcept" />'
            + '    <attribute name="msemr_authoredon" />'
            + '    <filter type="and">'
            + '      <condition value="' + pid + '" attribute="msemr_subjecttypepatient" operator="eq" />'
            + '      <condition value="' + edate + '" attribute="msemr_authoredon"  operator="on-or-before"  />'
            + '      <condition value="' + sdate + '" attribute="msemr_authoredon" operator="on-or-after" />'
            + '    </filter>'
            + '  </entity>'
            + '</fetch>';

        return parent.Xrm.WebApi.retrieveMultipleRecords("msemr_devicerequest", "?fetchXml=" + encodeURIComponent(query)).then(
            function success(results) {
                for (var i = 0; i < results.entities.length; i++) {
                    var dataSet = results.entities[i];
                    var item = {};

                    if (dataSet.hasOwnProperty('msemr_devicerequestid')) {
                        item.id = dataSet.msemr_devicerequestid;
                    }

                    if (dataSet.hasOwnProperty('msemr_codetype')) {
                        var type = dataSet.msemr_codetype;
                        if (type == 935000000) {
                            if (dataSet.hasOwnProperty('_msemr_codetypererence_value@OData.Community.Display.V1.FormattedValue')) {
                                item.name = dataSet['_msemr_codetypererence_value@OData.Community.Display.V1.FormattedValue'];
                            } else {
                                item.name = defaultName;
                            }
                        } else if (type == 935000001) {
                            if (dataSet.hasOwnProperty('_msemr_codetypecodeableconcept_value@OData.Community.Display.V1.FormattedValue')) {
                                item.name = dataSet['_msemr_codetypecodeableconcept_value@OData.Community.Display.V1.FormattedValue'];
                            } else {
                                item.name = "Device Request";
                            }
                        } else {
                            item.name = "Device Request";
                        }
                    }

                    if (dataSet.hasOwnProperty('msemr_authoredon')) {
                        item.date = moment(dataSet['msemr_authoredon@OData.Community.Display.V1.FormattedValue'], userDateFormat).format('MM/DD/YYYY');
                        item.dateTime = moment.utc(dataSet.msemr_authoredon).format('YYYY-MM-DD HH:mm:ss');
                    }
                    item.type = 2;
                    item.entity = "msemr_devicerequest";
                    list.push(item);
                };
                return Promise.resolve();
            },
            function (error) {
                console.log(error.message);
                return Promise.reject(error.message);
            }
        );

    }

    function loadMedications(sdate, edate) {
        var query = '<fetch mapping="logical" version="1.0" distinct="false" output-format="xml-platform">'
            + '  <entity name="msemr_medicationrequest">'
            + '    <attribute name="msemr_medicationrequestid" />'
            + '    <attribute name="msemr_medicationtype" />'
            + '    <attribute name="msemr_medicationreferencenew" />'
            + '    <attribute name="msemr_medicationtypecodeableconcept" />'
            + '    <attribute name="msemr_authoredon" />'
            + '    <filter type="and">'
            + '      <condition value="' + pid + '" attribute="msemr_subjecttypepatient" operator="eq" />'
            + '      <condition value="' + edate + '" attribute="msemr_authoredon"  operator="on-or-before"  />'
            + '      <condition value="' + sdate + '" attribute="msemr_authoredon" operator="on-or-after" />'
            + '    </filter>'
            + '  </entity>'
            + '</fetch>';

        parent.Xrm.WebApi.retrieveMultipleRecords("msemr_medicationrequest", "?fetchXml=" + encodeURIComponent(query)).then(
            function success(results) {
                for (var i = 0; i < results.entities.length; i++) {
                    var dataSet = results.entities[i];
                    var item = {};

                    if (dataSet.hasOwnProperty('msemr_medicationrequestid')) {
                        item.id = dataSet.msemr_medicationrequestid;
                    }

                    if (dataSet.hasOwnProperty('msemr_medicationtype')) {
                        var type = dataSet.msemr_medicationtype;
                        if (type == 935000000) {
                            if (dataSet.hasOwnProperty('_msemr_medicationtypecodeableconcept_value@OData.Community.Display.V1.FormattedValue')) {
                                item.name = dataSet['_msemr_medicationtypecodeableconcept_value@OData.Community.Display.V1.FormattedValue'];
                            } else {
                                item.name = defaultName;
                            }
                        } else if (type == 935000001) {
                            if (dataSet.hasOwnProperty('_msemr_medicationtypereference_value@OData.Community.Display.V1.FormattedValue')) {
                                item.name = dataSet['_msemr_medicationtypereference_value@OData.Community.Display.V1.FormattedValue'];
                            } else {
                                item.name = "Medication Request";
                            }
                        } else {
                            item.name = "Medication Request";
                        }
                    }

                    if (dataSet.hasOwnProperty('msemr_authoredon')) {
                        item.date = moment(dataSet['msemr_authoredon@OData.Community.Display.V1.FormattedValue'], userDateFormat).format('MM/DD/YYYY');
                        item.dateTime = moment.utc(dataSet.msemr_authoredon).format('YYYY-MM-DD HH:mm:ss');
                    }
                    item.type = 3;
                    item.entity = "msemr_medicationrequest";
                    list.push(item);
                };
                return Promise.resolve();
            },
            function (error) {
                console.log(error.message);
                return Promise.reject(error.message);
            }
        );
    }

    function NutritionOrders(sdate, edate) {
        var query = '<fetch mapping="logical" version="1.0" distinct="false" output-format="xml-platform">'
            + '  <entity name="msemr_nutritionorder">'
            + '    <attribute name="msemr_nutritionorderid" />'
            //+ '    <attribute name="msemr_name" />'
            + '    <attribute name="msemr_datetime" />'
            + '    <filter type="and">'
            + '      <condition value="' + pid + '" attribute="msemr_patient" operator="eq" />'
            + '      <condition value="' + edate + '" attribute="msemr_datetime"  operator="on-or-before"  />'
            + '      <condition value="' + sdate + '" attribute="msemr_datetime" operator="on-or-after" />'
            + '    </filter>'
            + '  </entity>'
            + '</fetch>';

        parent.Xrm.WebApi.retrieveMultipleRecords("msemr_nutritionorder", "?fetchXml=" + encodeURIComponent(query)).then(
            function success(results) {
                for (var i = 0; i < results.entities.length; i++) {
                    var dataSet = results.entities[i];
                    var item = {};

                    if (dataSet.hasOwnProperty('msemr_nutritionorderid')) {
                        item.id = dataSet.msemr_nutritionorderid;
                    }

                    //if (dataSet.hasOwnProperty('msemr_name')) {
                    item.name = "Nutrition Order";
                    //}

                    if (dataSet.hasOwnProperty('msemr_datetime')) {
                        item.date = moment(dataSet['msemr_datetime@OData.Community.Display.V1.FormattedValue'], userDateFormat).format('MM/DD/YYYY');
                        item.dateTime = moment.utc(dataSet.msemr_datetime).format('YYYY-MM-DD HH:mm:ss');
                    }
                    item.type = 4;
                    item.entity = "msemr_nutritionorder";
                    list.push(item);
                };
                return Promise.resolve();
            },
            function (error) {
                console.log(error.message);
                return Promise.reject(error.message);
            }
        );
    }

    function Tasks(sdate, edate) {
        var query = '<fetch mapping="logical" version="1.0" distinct="false" output-format="xml-platform">'
            + '  <entity name="task">'
            + '    <attribute name="activityid" />'
            + '    <attribute name="subject" />'
            + '    <attribute name="createdon" />'
            + '    <filter type="and">'
            + '      <condition value="' + pid + '" attribute="msemr_requesteragentpatient" operator="eq" />'
            + '      <condition value="' + edate + '" attribute="createdon"  operator="on-or-before"  />'
            + '      <condition value="' + sdate + '" attribute="createdon" operator="on-or-after" />'
            + '    </filter>'
            + '  </entity>'
            + '</fetch>';

        return parent.Xrm.WebApi.retrieveMultipleRecords("task", "?fetchXml=" + encodeURIComponent(query)).then(
            function success(results) {
                for (var i = 0; i < results.entities.length; i++) {
                    var dataSet = results.entities[i];
                    var item = {};

                    if (dataSet.hasOwnProperty('activityid')) {
                        item.id = dataSet.activityid;
                    }

                    if (dataSet.hasOwnProperty('subject')) {
                        item.name = dataSet.subject;
                    } else {
                        item.name = "Assigned Task";
                    }

                    if (dataSet.hasOwnProperty('createdon')) {
                        item.date = moment(dataSet['createdon@OData.Community.Display.V1.FormattedValue'], userDateFormat).format('MM/DD/YYYY');
                        item.dateTime = moment.utc(dataSet.createdon).format('YYYY-MM-DD HH:mm:ss');
                    }
                    item.type = 5;
                    item.entity = "task";
                    list.push(item);
                };
                return Promise.resolve();
            },
            function (error) {
                console.log(error.message);
                return Promise.reject(error.message);
            }
        );
    }

    function Procedures(sdate, edate) {
        var query = '<fetch mapping="logical" version="1.0" distinct="false" output-format="xml-platform">'
            + '  <entity name="msemr_procedurerequest">'
            + '    <attribute name="msemr_procedurerequestid" />'
            + '    <attribute name="msemr_code" />'
            + '    <attribute name="msemr_code" />'
            + '    <attribute name="msemr_code" />'
            + '    <attribute name="msemr_authoredon" />'
            + '    <filter type="and">'
            + '      <condition value="' + pid + '" attribute="msemr_subjectpatient" operator="eq" />'
            + '      <condition value="' + edate + '" attribute="msemr_authoredon"  operator="on-or-before"  />'
            + '      <condition value="' + sdate + '" attribute="msemr_authoredon" operator="on-or-after" />'
            + '    </filter>'
            + '  </entity>'
            + '</fetch>';

        return parent.Xrm.WebApi.retrieveMultipleRecords("msemr_procedurerequest", "?fetchXml=" + encodeURIComponent(query)).then(
            function success(results) {
                for (var i = 0; i < results.entities.length; i++) {
                    var dataSet = results.entities[i];
                    var item = {};

                    if (dataSet.hasOwnProperty('msemr_procedurerequestid')) {
                        item.id = dataSet.msemr_procedurerequestid;
                    }

                    if (dataSet.hasOwnProperty('_msemr_code_value@OData.Community.Display.V1.FormattedValue')) {
                        item.name = dataSet['_msemr_code_value@OData.Community.Display.V1.FormattedValue'];
                    } else {
                        item.name = "Procedure Request";
                    }

                    if (dataSet.hasOwnProperty('msemr_authoredon')) {
                        item.date = moment(dataSet['msemr_authoredon@OData.Community.Display.V1.FormattedValue'], userDateFormat).format('MM/DD/YYYY');
                        item.dateTime = moment.utc(dataSet.msemr_authoredon).format('YYYY-MM-DD HH:mm:ss');
                    }
                    item.type = 6;
                    item.entity = "msemr_procedurerequest";
                    list.push(item);
                };
                return Promise.resolve();
            },
            function (error) {
                console.log(error.message);
                return Promise.rejec(error.message);
            }
        );
    }

    function Referrals(sdate, edate) {
        var query = '<fetch mapping="logical" version="1.0" distinct="false" output-format="xml-platform">'
            + '  <entity name="msemr_referralrequest">'
            + '    <attribute name="msemr_referralrequestid" />'
            + '    <attribute name="msemr_type" />'
            + '    <attribute name="msemr_authoredon" />'
            + '    <filter type="and">'
            + '      <condition value="' + pid + '" attribute="msemr_subjectpatient" operator="eq" />'
            + '      <condition value="' + edate + '" attribute="msemr_authoredon"  operator="on-or-before"  />'
            + '      <condition value="' + sdate + '" attribute="msemr_authoredon" operator="on-or-after" />'
            + '    </filter>'
            + '  </entity>'
            + '</fetch>';

        return parent.Xrm.WebApi.retrieveMultipleRecords("msemr_referralrequest", "?fetchXml=" + encodeURIComponent(query)).then(
            function success(results) {
                for (var i = 0; i < results.entities.length; i++) {
                    var dataSet = results.entities[i];
                    var item = {};

                    if (dataSet.hasOwnProperty('msemr_referralrequestid')) {
                        item.id = dataSet.msemr_referralrequestid;
                    }

                    if (dataSet.hasOwnProperty('_msemr_type_value@OData.Community.Display.V1.FormattedValue')) {
                        item.name = dataSet['_msemr_type_value@OData.Community.Display.V1.FormattedValue'];
                    } else {
                        item.name = "Referral Request";
                    }

                    if (dataSet.hasOwnProperty('msemr_authoredon')) {
                        item.date = moment(dataSet['msemr_authoredon@OData.Community.Display.V1.FormattedValue'], userDateFormat).format('MM/DD/YYYY');
                        item.dateTime = moment.utc(dataSet.msemr_authoredon).format('YYYY-MM-DD HH:mm:ss');
                    }
                    item.type = 7;
                    item.entity = "msemr_referralrequest";
                    list.push(item);
                };
                return Promise.resolve();
            },
            function (error) {
                console.log(error.message);
                return Promise.reject(error.message);
            }
        );
    }

    function Encounter(sdate, edate) {
        var query = '<fetch mapping="logical" version="1.0" distinct="false" output-format="xml-platform">'
            + '  <entity name="msemr_encounter">'
            + '    <attribute name="msemr_encounterid" />'
            //+ '    <attribute name="msemr_name" />'
            + '    <attribute name="msemr_periodstart" />'
            + '    <filter type="and">'
            + '      <condition value="' + pid + '" attribute="msemr_encounterpatientidentifier" operator="eq" />'
            + '      <condition value="' + edate + '" attribute="msemr_periodstart"  operator="on-or-before"  />'
            + '      <condition value="' + sdate + '" attribute="msemr_periodstart" operator="on-or-after" />'
            + '    </filter>'
            + '     <link-entity name="msemr_encounterparticipant" from="msemr_encounterparticipantdetailsid" to="msemr_encounterid" link-type="inner" alias="aa">'
            + '         <attribute name="msemr_individualtypepractitioner" />'
            + '          <filter type="and">'
            + '              <condition attribute="msemr_individualtypepractitioner" operator="not-null" />'
            + '          </filter>'
            + '      </link-entity>'
            + '  </entity>'
            + '</fetch>';


        return parent.Xrm.WebApi.retrieveMultipleRecords("msemr_encounter", "?fetchXml=" + encodeURIComponent(query)).then(
            function success(results) {
                for (var i = 0; i < results.entities.length; i++) {
                    var dataSet = results.entities[i];
                    var item = {};

                    if (dataSet.hasOwnProperty('msemr_encounterid')) {
                        item.id = dataSet.msemr_encounterid;
                    }

                    if (dataSet.hasOwnProperty('aa.msemr_individualtypepractitioner@OData.Community.Display.V1.FormattedValue')) {
                        item.name = dataSet["aa.msemr_individualtypepractitioner@OData.Community.Display.V1.FormattedValue"];
                    } else {
                        item.name = "Encounter";
                    }

                    if (dataSet.hasOwnProperty('msemr_periodstart')) {
                        item.date = moment(dataSet['msemr_periodstart@OData.Community.Display.V1.FormattedValue'], userDateFormat).format('MM/DD/YYYY');
                        item.dateTime = moment.utc(dataSet.msemr_periodstart).format('YYYY-MM-DD HH:mm:ss');
                    }
                    item.type = 8;
                    item.entity = "msemr_encounter";
                    list.push(item);
                };
                return Promise.resolve();
            },
            function (error) {
                console.log(error.message);
                return Promise.reject(error.message);
            }
        );
    }

    function CarePlan(sdate, edate) {
        //var query = '<fetch mapping="logical" version="1.0" distinct="false" output-format="xml-platform">'
        //    + '  <entity name="msemr_careplan">'
        //    + '    <attribute name="msemr_careplanid" />'
        //    + '    <attribute name="msemr_title" />'
        //    + '    <attribute name="msemr_planstartdate" />'
        //    + '    <filter type="and">'
        //    + '      <condition value="' + pid + '" attribute="msemr_patientidentifier" operator="eq" />'
        //    + '      <condition value="' + edate + '" attribute="msemr_planstartdate"  operator="on-or-before"  />'
        //    + '      <condition value="' + sdate + '" attribute="msemr_planstartdate" operator="on-or-after" />'
        //    + '    </filter>'
        //    + '  </entity>'
        //    + '</fetch>';

        //return parent.Xrm.WebApi.retrieveMultipleRecords("msemr_careplan", "?fetchXml=" + encodeURIComponent(query)).then(
        //    function success(results) {
        //        for (var i = 0; i < results.entities.length; i++) {
        //            var dataSet = results.entities[i];
        //            var item = {};

        //            if (dataSet.hasOwnProperty('msemr_careplanid')) {
        //                item.id = dataSet.msemr_careplanid;
        //            }
        //            item.name = dataSet.msemr_title;

        //            if (dataSet.hasOwnProperty('msemr_planstartdate')) {
        //                item.date = moment(dataSet['msemr_planstartdate@OData.Community.Display.V1.FormattedValue'], userDateFormat).format('MM/DD/YYYY');
        //                item.dateTime = moment.utc(dataSet.msemr_planstartdate).format('YYYY-MM-DD HH:mm:ss');
        //            }
        //            item.type = 9;
        //            item.entity = "msemr_careplan";
        //            list.push(item);
        //        };
        //        return Promise.resolve();
        //    },
        //    function (error) {
        //        console.log(error.message);
        //        return Promise.reject(error.message);
        //    }
        //);

        var patient = {}
        patient.patientId = pid;
        patient.startDate = sdate;
        patient.endDate = edate;

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "getPatientCarePlans",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(patient),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkhsQzBSMTJza3hOWjFXUXdtak9GXzZ0X3RERSIsImtpZCI6IkhsQzBSMTJza3hOWjFXUXdtak9GXzZ0X3RERSJ9.eyJhdWQiOiIwMDAwMDAwMi0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9jYjhkMGY1ZS0yOTVlLTQ0ZjEtOGNhYi0xODRhZTgyN2M4NjQvIiwiaWF0IjoxNTgzOTIwODY3LCJuYmYiOjE1ODM5MjA4NjcsImV4cCI6MTU4MzkyNDc2NywiYWlvIjoiNDJOZ1lOaXdaSG44bHpWL3IvVnd4Szc4L2NKbUdRQT0iLCJhcHBpZCI6IjZmOTBmZDRjLTFhYzItNGE2My1iM2ZiLTRlM2E4YjhlMzY1OCIsImFwcGlkYWNyIjoiMSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2NiOGQwZjVlLTI5NWUtNDRmMS04Y2FiLTE4NGFlODI3Yzg2NC8iLCJvaWQiOiJjNTZhOWVhZi0xNGUxLTRiMjctODVkZS0yYjI3MTBkNGI4OTciLCJzdWIiOiJjNTZhOWVhZi0xNGUxLTRiMjctODVkZS0yYjI3MTBkNGI4OTciLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiJjYjhkMGY1ZS0yOTVlLTQ0ZjEtOGNhYi0xODRhZTgyN2M4NjQiLCJ1dGkiOiJ4ckJINEtqS0hrcThKM0tjUDc4cEFBIiwidmVyIjoiMS4wIn0.OWbdn_1nW4DTU71m8LuJcCvQibO-tCEiSLsfUdphtD-voJ9XxgP81AdH7nXJfWwD97Uwl6XGzooLtMHDJex9uv_ybj6sa_IkRXftgxKmtQrNeRCq_JuWmDkKhdfyj6dcw7J0o9hJEKqxPvGlagjcxtxqDDEPWcFg0BhSttdxflDl6vvyyZmz--Jgj1iVxf60mulwGV_0EKvcJKBCL2pxs4pp44oCgEErooxg6di-mBFSRxVWfr3G6sMpqvXb9T40UAbaKh5t3kmFGjndpv_OoYk10IWYskCFTlZKuIz3InfU70xBhwP1uHUrj09tYpJJsDGksIZ1Lb654s8RMJIu8Q");
            },
            success: function (data) {
                console.log(data.data.records);
                for (var i = 0; i < data.data.records.length; i++) {
                    debugger;
                    var dataSet = data.data.records[i];
                    var item = {};

                    if (dataSet.hasOwnProperty('CarePlanID')) {
                        item.id = dataSet.CarePlanID;
                    }
                    item.name = dataSet.Title;

                    if (dataSet.hasOwnProperty('STartDate')) {
                        item.date = moment.utc(dataSet.STartDate).format('MM/DD/YYYY');
                        item.dateTime = moment.utc(dataSet.STartDate).format('YYYY-MM-DD HH:mm:ss');
                    }
                    item.type = 9;
                    item.entity = "msemr_careplan";
                    list.push(item);
                };
                return Promise.resolve();
            },
            error: function () {
                console.log("error");
            }
        });


    }

    function Allergy(sdate, edate) {
        debugger;
        var patient = {}
        patient.patientId = pid;
        patient.startDate = sdate;
        patient.endDate = edate;

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "getPatientAllergiesCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(patient),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkhsQzBSMTJza3hOWjFXUXdtak9GXzZ0X3RERSIsImtpZCI6IkhsQzBSMTJza3hOWjFXUXdtak9GXzZ0X3RERSJ9.eyJhdWQiOiIwMDAwMDAwMi0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9jYjhkMGY1ZS0yOTVlLTQ0ZjEtOGNhYi0xODRhZTgyN2M4NjQvIiwiaWF0IjoxNTgzOTIwODY3LCJuYmYiOjE1ODM5MjA4NjcsImV4cCI6MTU4MzkyNDc2NywiYWlvIjoiNDJOZ1lOaXdaSG44bHpWL3IvVnd4Szc4L2NKbUdRQT0iLCJhcHBpZCI6IjZmOTBmZDRjLTFhYzItNGE2My1iM2ZiLTRlM2E4YjhlMzY1OCIsImFwcGlkYWNyIjoiMSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2NiOGQwZjVlLTI5NWUtNDRmMS04Y2FiLTE4NGFlODI3Yzg2NC8iLCJvaWQiOiJjNTZhOWVhZi0xNGUxLTRiMjctODVkZS0yYjI3MTBkNGI4OTciLCJzdWIiOiJjNTZhOWVhZi0xNGUxLTRiMjctODVkZS0yYjI3MTBkNGI4OTciLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiJjYjhkMGY1ZS0yOTVlLTQ0ZjEtOGNhYi0xODRhZTgyN2M4NjQiLCJ1dGkiOiJ4ckJINEtqS0hrcThKM0tjUDc4cEFBIiwidmVyIjoiMS4wIn0.OWbdn_1nW4DTU71m8LuJcCvQibO-tCEiSLsfUdphtD-voJ9XxgP81AdH7nXJfWwD97Uwl6XGzooLtMHDJex9uv_ybj6sa_IkRXftgxKmtQrNeRCq_JuWmDkKhdfyj6dcw7J0o9hJEKqxPvGlagjcxtxqDDEPWcFg0BhSttdxflDl6vvyyZmz--Jgj1iVxf60mulwGV_0EKvcJKBCL2pxs4pp44oCgEErooxg6di-mBFSRxVWfr3G6sMpqvXb9T40UAbaKh5t3kmFGjndpv_OoYk10IWYskCFTlZKuIz3InfU70xBhwP1uHUrj09tYpJJsDGksIZ1Lb654s8RMJIu8Q");
            },
            success: function (data) {
                console.log(data.data.records);
                for (var i = 0; i < data.data.records.length; i++) {
                    debugger;
                    var dataSet = data.data.records[i];
                    var item = {};

                    if (dataSet.hasOwnProperty('Id')) {
                        item.id = dataSet.Id;
                    }
                    item.name = dataSet.name;

                    if (dataSet.hasOwnProperty('RecordedDate')) {
                        item.date = moment.utc(dataSet.RecordedDate).format('MM/DD/YYYY');
                        item.dateTime = moment.utc(dataSet.RecordedDate).format('YYYY-MM-DD HH:mm:ss');
                    }
                    item.type = 11;
                    item.entity = "msemr_allergyintolerance";
                    list.push(item);
                };
                return Promise.resolve();
            },
            error: function () {
                console.log("error");
            }
        });


    }

    function Observation(sdate, edate) {
        debugger;
        var patient = {}
        patient.patientId = pid;
        patient.startDate = sdate;
        patient.endDate = edate;

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "getPatientObservationCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(patient),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkhsQzBSMTJza3hOWjFXUXdtak9GXzZ0X3RERSIsImtpZCI6IkhsQzBSMTJza3hOWjFXUXdtak9GXzZ0X3RERSJ9.eyJhdWQiOiIwMDAwMDAwMi0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9jYjhkMGY1ZS0yOTVlLTQ0ZjEtOGNhYi0xODRhZTgyN2M4NjQvIiwiaWF0IjoxNTgzOTIwODY3LCJuYmYiOjE1ODM5MjA4NjcsImV4cCI6MTU4MzkyNDc2NywiYWlvIjoiNDJOZ1lOaXdaSG44bHpWL3IvVnd4Szc4L2NKbUdRQT0iLCJhcHBpZCI6IjZmOTBmZDRjLTFhYzItNGE2My1iM2ZiLTRlM2E4YjhlMzY1OCIsImFwcGlkYWNyIjoiMSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2NiOGQwZjVlLTI5NWUtNDRmMS04Y2FiLTE4NGFlODI3Yzg2NC8iLCJvaWQiOiJjNTZhOWVhZi0xNGUxLTRiMjctODVkZS0yYjI3MTBkNGI4OTciLCJzdWIiOiJjNTZhOWVhZi0xNGUxLTRiMjctODVkZS0yYjI3MTBkNGI4OTciLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiJjYjhkMGY1ZS0yOTVlLTQ0ZjEtOGNhYi0xODRhZTgyN2M4NjQiLCJ1dGkiOiJ4ckJINEtqS0hrcThKM0tjUDc4cEFBIiwidmVyIjoiMS4wIn0.OWbdn_1nW4DTU71m8LuJcCvQibO-tCEiSLsfUdphtD-voJ9XxgP81AdH7nXJfWwD97Uwl6XGzooLtMHDJex9uv_ybj6sa_IkRXftgxKmtQrNeRCq_JuWmDkKhdfyj6dcw7J0o9hJEKqxPvGlagjcxtxqDDEPWcFg0BhSttdxflDl6vvyyZmz--Jgj1iVxf60mulwGV_0EKvcJKBCL2pxs4pp44oCgEErooxg6di-mBFSRxVWfr3G6sMpqvXb9T40UAbaKh5t3kmFGjndpv_OoYk10IWYskCFTlZKuIz3InfU70xBhwP1uHUrj09tYpJJsDGksIZ1Lb654s8RMJIu8Q");
            },
            success: function (data) {
                console.log(data.data.records);
                for (var i = 0; i < data.data.records.length; i++) {
                    debugger;
                    var dataSet = data.data.records[i];
                    var item = {};

                    if (dataSet.hasOwnProperty('ObservationID')) {
                        item.id = dataSet.ObservationID;
                    }
                    item.name = dataSet.Description;

                    if (dataSet.hasOwnProperty('IssuedDate')) {
                        item.date = moment.utc(dataSet.IssuedDate).format('MM/DD/YYYY');
                        item.dateTime = moment.utc(dataSet.IssuedDate).format('YYYY-MM-DD HH:mm:ss');
                    }
                    item.type = 12;
                    item.entity = "msemr_observation";
                    list.push(item);
                };
                return Promise.resolve();
            },
            error: function () {
                console.log("error");
            }
        });


    }

    function CarePlanGoal(sdate, edate) {
        var query = '<fetch mapping="logical" version="1.0" distinct="false" output-format="xml-platform">'
            + '  <entity name="msemr_careplangoal">'
            + '    <attribute name="createdon" />'
            + '    <attribute name="msemr_name" />'
            + '    <attribute name="msemr_careplangoalid" />'
            + '    <filter type="and">'
            + '      <condition value="' + edate + '" attribute="createdon"  operator="on-or-before"  />'
            + '      <condition value="' + sdate + '" attribute="createdon" operator="on-or-after" />'
            + '    </filter>'
            + '    <link-entity name="msemr_careplan" from="msemr_careplanid" to="msemr_careplan" link-type="inner" alias="ad">'
            + '         <filter type="and">'
            + '             <condition attribute="msemr_patientidentifier" operator="eq" value="' + pid + '" />'
            + '         </filter>'
            + '    </link-entity>'
            + '  </entity>'
            + '</fetch>';

        return parent.Xrm.WebApi.retrieveMultipleRecords("msemr_careplangoal", "?fetchXml=" + encodeURIComponent(query)).then(
            function success(results) {
                for (var i = 0; i < results.entities.length; i++) {
                    var dataSet = results.entities[i];
                    var item = {};

                    if (dataSet.hasOwnProperty('msemr_careplangoalid')) {
                        item.id = dataSet.msemr_careplangoalid;
                    }
                    item.name = dataSet.msemr_name;

                    if (dataSet.hasOwnProperty('createdon')) {
                        item.date = moment(dataSet['createdon@OData.Community.Display.V1.FormattedValue'], userDateFormat).format('MM/DD/YYYY');
                        item.dateTime = moment.utc(dataSet.createdon).format('YYYY-MM-DD HH:mm:ss');
                    }
                    item.type = 10;
                    item.entity = "msemr_careplangoal";
                    list.push(item);
                };
                return Promise.resolve();
            },
            function (error) {
                console.log(error.message);
                return Promise.reject(error.message);
            }
        );
    }

    function getPatientRegistrationDate() {

        var patient = {}

        patient.patientId = pid;
        patient.getDocuments = false;
        patient.getAddresses = false;
        patient.getRelationship = false;

        $.ajax({
            url: "https://mazikcarewebapicrm.azurewebsites.net/api/PatientChart/getPatientDetails",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(patient),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkhsQzBSMTJza3hOWjFXUXdtak9GXzZ0X3RERSIsImtpZCI6IkhsQzBSMTJza3hOWjFXUXdtak9GXzZ0X3RERSJ9.eyJhdWQiOiIwMDAwMDAwMi0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9jYjhkMGY1ZS0yOTVlLTQ0ZjEtOGNhYi0xODRhZTgyN2M4NjQvIiwiaWF0IjoxNTgzOTIwODY3LCJuYmYiOjE1ODM5MjA4NjcsImV4cCI6MTU4MzkyNDc2NywiYWlvIjoiNDJOZ1lOaXdaSG44bHpWL3IvVnd4Szc4L2NKbUdRQT0iLCJhcHBpZCI6IjZmOTBmZDRjLTFhYzItNGE2My1iM2ZiLTRlM2E4YjhlMzY1OCIsImFwcGlkYWNyIjoiMSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2NiOGQwZjVlLTI5NWUtNDRmMS04Y2FiLTE4NGFlODI3Yzg2NC8iLCJvaWQiOiJjNTZhOWVhZi0xNGUxLTRiMjctODVkZS0yYjI3MTBkNGI4OTciLCJzdWIiOiJjNTZhOWVhZi0xNGUxLTRiMjctODVkZS0yYjI3MTBkNGI4OTciLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiJjYjhkMGY1ZS0yOTVlLTQ0ZjEtOGNhYi0xODRhZTgyN2M4NjQiLCJ1dGkiOiJ4ckJINEtqS0hrcThKM0tjUDc4cEFBIiwidmVyIjoiMS4wIn0.OWbdn_1nW4DTU71m8LuJcCvQibO-tCEiSLsfUdphtD-voJ9XxgP81AdH7nXJfWwD97Uwl6XGzooLtMHDJex9uv_ybj6sa_IkRXftgxKmtQrNeRCq_JuWmDkKhdfyj6dcw7J0o9hJEKqxPvGlagjcxtxqDDEPWcFg0BhSttdxflDl6vvyyZmz--Jgj1iVxf60mulwGV_0EKvcJKBCL2pxs4pp44oCgEErooxg6di-mBFSRxVWfr3G6sMpqvXb9T40UAbaKh5t3kmFGjndpv_OoYk10IWYskCFTlZKuIz3InfU70xBhwP1uHUrj09tYpJJsDGksIZ1Lb654s8RMJIu8Q");
            },
            success: function (data) {
                debugger;
                console.log(data);
                var result = data.data.records;

                if (result.hasOwnProperty('ActivityStartDate')) {
                    if (result.ActivityStartDate != null) {
                        regDate = pregDate = moment(result.ActivityStartDate).format('MM/DD/YYYY');
                    }
                }
                var maxDate = moment().format('MM/DD/YYYY');
                $('.startDate').text(pregDate);
                $('.endDate').text(maxDate);

                var minDate = '';
                if (viewType == 1) {
                    var daysdiff = moment().diff(moment(pregDate).format('MM/DD/YYYY'), 'days');
                    if (daysdiff < 6)
                        minDate = moment(pregDate).format('MM/DD/YYYY');
                    else
                        minDate = moment().subtract(6, 'd').format('MM/DD/YYYY');
                }
                else {
                    if (viewType == 3) {
                        var monthsdiff = moment().diff(moment(pregDate).format('MM/DD/YYYY'), 'months');
                        if (monthsdiff < 5)
                            minDate = moment(pregDate).format('MM/DD/YYYY');
                        else
                            minDate = moment(new Date()).subtract(5, 'months').startOf('month').format('MM/DD/YYYY');
                    }
                }
                $("#txtStartDate").datepicker({
                    changeMonth: true,
                    changeYear: true,
                    showOn: "button",
                    minDate: moment(pregDate).format('MM/DD/YYYY'),
                    maxDate: moment().format('MM/DD/YYYY'),
                    showOtherMonths: true
                });

                $("#txtEndDate").datepicker({
                    changeMonth: true,
                    changeYear: true,
                    showOn: "button",
                    minDate: moment(pregDate).format('MM/DD/YYYY'),
                    maxDate: moment().format('MM/DD/YYYY'),
                    showOtherMonths: true
                });

                $('#txtStartDate').val(minDate);
                $('#txtEndDate').val(maxDate);

                var d = new Date();
                d.setDate(d.getDate() - 6);
            },
            error: function () {
                console.log("error");
            }
        });

        //XrmServiceToolkit.Rest.Retrieve(pid, "ContactSet", "msemr_ActivityStartDate", null, function (result) {
        //    if (result) {
        //        if (result.hasOwnProperty('msemr_ActivityStartDate')) {
        //            if (result.msemr_ActivityStartDate != null) {
        //                regDate = pregDate = moment(result.msemr_ActivityStartDate).format('MM/DD/YYYY');
        //            }
        //        }
        //        var maxDate = moment().format('MM/DD/YYYY');
        //        $('.startDate').text(pregDate);
        //        $('.endDate').text(maxDate);

        //        var minDate = '';
        //        if (viewType == 1) {
        //            var daysdiff = moment().diff(moment(pregDate).format('MM/DD/YYYY'), 'days');
        //            if (daysdiff < 6)
        //                minDate = moment(pregDate).format('MM/DD/YYYY');
        //            else
        //                minDate = moment().subtract(6, 'd').format('MM/DD/YYYY');
        //        }
        //        else {
        //            if (viewType == 3) {
        //                var monthsdiff = moment().diff(moment(pregDate).format('MM/DD/YYYY'), 'months');
        //                if (monthsdiff < 5)
        //                    minDate = moment(pregDate).format('MM/DD/YYYY');
        //                else
        //                    minDate = moment(new Date()).subtract(5, 'months').startOf('month').format('MM/DD/YYYY');
        //            }
        //        }
        //        $("#txtStartDate").datepicker({
        //            showOn: "button",
        //            minDate: moment(pregDate).format('MM/DD/YYYY'),
        //            maxDate: moment().format('MM/DD/YYYY'),
        //            showOtherMonths: true
        //        });

        //        $("#txtEndDate").datepicker({
        //            showOn: "button",
        //            minDate: moment(pregDate).format('MM/DD/YYYY'),
        //            maxDate: moment().format('MM/DD/YYYY'),
        //            showOtherMonths: true
        //        });

        //        $('#txtStartDate').val(minDate);
        //        $('#txtEndDate').val(maxDate);

        //        var d = new Date();
        //        d.setDate(d.getDate() - 6);
        //    }
        //}, function (error) {
        //    Xrm.Utility.alertDialog(error.message);
        //}, false);

    }

    function getTypeImageName(a) {
        switch (a) {
            case 1: return "../webresources/msemr_AppointmentsEMRSVG";
            case 2: return "../webresources/msemr_devicesvg";
            case 3: return "../webresources/msemr_medicationrequestSVG";
            case 4: return "../webresources/msemr_NutritionOrdersSVG";
            case 5: return "../webresources/msemr_tc_icon_task_svg";
            case 6: return "../webresources/msemr_ProceduresSVG";
            case 7: return "../webresources/msemr_ReferralRequestsSVG";
            case 8: return "../webresources/msemr_EncountersSVG";
            case 9: return "./src/images/msemr_careplanSVG.svg";
            case 11: return "./src/images/msemr_allergyintolerancesSVG.svg";
            case 12: return "./src/images/msemr_ObservationSVG.svg";
            case 10: return "../webresources/msemr_CarePlanGoalSVG";
            default: return "../webresources/msemr_AppointmentsEMRSVG";
        }
    }

    function getTypeImageAltName(a) {
        switch (a) {
            case 1: return "Appointment";
            case 2: return "Device";
            case 3: return "Medication";
            case 4: return "Nutrition Order";
            case 5: return "Task";
            case 6: return "Procedure";
            case 7: return "Referral";
            case 8: return "Encounter";
            case 9: return "Care Plan";
            case 11: return "Allergy";
            case 12: return "Observation";
            case 10: return "Goal";
            default: return "";
        }
    }

    function getDateRange(startDate, endDate, dateFormat) {
        var dates = [];
        var start = moment(startDate);
        var end = moment(endDate);

        if (viewType == 1) {
            var diff = end.diff(startDate, 'days');
            if (!start.isValid() || !end.isValid() || diff < 0) {
                return;
            }
            else {
                dates.push(end.format(dateFormat));
            }
            for (var i = 0; i < diff; i++) {
                dates.push(end.subtract(1, 'd').format(dateFormat));
            }
            if (diff < 7) {
                for (var i = 0; i < 6 - diff; i++) {
                    dates.push(end.subtract(1, 'd').format(dateFormat));
                }
            }

        }
        else if (viewType == 2) {
            var maxEndDate = end.startOf('week');
            if (!start.isValid() || !end.isValid() || monthdiff < 0) {
                return;
            } else {
                dates.push(maxEndDate.format(dateFormat));
            }
            var weeksdiff = maxEndDate.diff(startDate, 'weeks');
            for (var i = 0; i < weeksdiff; i++) {
                dates.push(maxEndDate.subtract(1, 'w').format(dateFormat))
            }
            if (weeksdiff < 3) {
                for (var i = 0; i < 3 - weeksdiff; i++) {
                    dates.push(maxEndDate.subtract(1, 'w').format(dateFormat))
                }
            }
        }
        else if (viewType == 3) {
            var daysdiff = end.diff(startDate, 'days');
            var monthdiff = end.diff(startDate, 'months');
            var lowerMonDiff = end.diff(regDate, 'months');
            var days = 0;
            if (!start.isValid() || !end.isValid() || monthdiff < 0) {
                return;
            } else {
                dates.push(end.format(dateFormat));
            }
            for (var i = 0; i < monthdiff; i++) {
                dates.push(end.subtract(1, 'months').format(dateFormat));
            }
            if (monthdiff < 5) {
                for (var i = 0; i < 5 - monthdiff; i++) {
                    dates.push(end.subtract(1, 'months').format(dateFormat));
                }
            }
        }
        return dates;
    }

    

    function getMinMaxDates() {
        var MinMaxDates = {
            min: moment($('#txtStartDate').datepicker('getDate')),
            max: moment($('#txtEndDate').datepicker('getDate'))
        };
        return MinMaxDates;
    }    

    function enableDisableBackForward() {
        var showPrev = false;
        var showNext = false;
        switch (viewType) {
            case 1:
                if (moment(currentStartDate).subtract(7, 'days') > moment(pregDate)) {
                    showPrev = true;
                }
                if (moment(currentStartDate).add(7, 'days') < moment()) {
                    showNext = true;
                }
                break;
            case 2:
                if (moment(currentStartDate).subtract(4, 'weeks') > moment(pregDate)) {
                    showPrev = true;
                }
                if (moment(currentStartDate).add(4, 'weeks') < moment()) {
                    showNext = true;
                }
                break;
            case 3:
                if (moment(currentStartDate).subtract(6, 'months') > moment(pregDate)) {
                    showPrev = true;
                }
                if (moment(currentStartDate).add(6, 'months') < moment()) {
                    showNext = true;
                }
                break;
        }

        if (showPrev) {
            $('.timelineFooter a:nth-child(1)').show();
        }
        else {
            $('.timelineFooter a:nth-child(1)').hide();
        }

        if (showNext) {
            $('.timelineFooter a:nth-child(2)').show();
        }
        else {
            $('.timelineFooter a:nth-child(2)').hide();
        }
    }

    function refreshTimeline() {
        var selectedDates = getMinMaxDates();
        var sDate = moment(selectedDates.min).format('MM/DD/YYYY');
        var eDate = moment(selectedDates.max).format('MM/DD/YYYY');

        if (!isChanged) {
            loadData(true, sDate, eDate);
            isChanged = true;
        } else {
            isChanged = false;
        }
    }


    function openWeek(sDate) {
        viewType = 1;

        $("#dayMenu").addClass("active");
        $("#weekMenu").removeClass("active");
        $("#monthMenu").removeClass("active");

        $('.weekly').hide();
        $('.monthly').hide();
        $('.daily').show();

        eDate = moment(sDate).add(6, 'days').format('MM/DD/YYYY');

        loadData(true, sDate, eDate);
        isChanged = true;
    }

    function openMonth(sDate) {
        viewType = 2;

        $("#weekMenu").addClass("active");
        $("#dayMenu").removeClass("active");
        $("#monthMenu").removeClass("active");

        $('.daily').hide();
        $('.monthly').hide();
        $('.weekly').show();

        //eDate = moment(sDate).add(4, 'weeks').format('MM/DD/YYYY');
        eDate = moment(sDate).endOf('month').format('MM/DD/YYYY');

        loadData(true, sDate, eDate);
        isChanged = true;
    }

    function openForm(recordId, entityName) {
        var entityFormOptions = {};
        entityFormOptions["entityName"] = entityName;
        entityFormOptions["entityId"] = recordId;
        entityFormOptions["openInNewWindow"] = true;

        parent.Xrm.Navigation.openForm(entityFormOptions).then(
            function (success) {
            },
            function (error) {
                console.log(error);
            });
    }

    var dateSort = function (m, n) {
        var s = new Date(m.dateTime), e = new Date(n.dateTime);
        if (s > e) return 1;
        if (s < e) return -1;
        return 0;
    };


}