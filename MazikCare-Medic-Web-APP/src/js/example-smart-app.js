(function (window) {
    window.extractData = function () {
        var ret = $.Deferred();

        function onError() {
            console.log('Loading error', arguments);
            ret.reject();
        }

        function onReady(smart) {
            if (smart.hasOwnProperty('patient')) {
                var patient = smart.patient;
                var pt = patient.read();
                var obv = smart.patient.api.fetchAll({
                    type: 'Observation',
                    query: {
                        code: {
                            $or: ['http://loinc.org|8302-2', 'http://loinc.org|8462-4',
                                'http://loinc.org|8480-6', 'http://loinc.org|2085-9',
                                'http://loinc.org|2089-1', 'http://loinc.org|55284-4']
                        }
                    }
                });

                $.when(pt, obv).fail(onError);

                $.when(pt, obv).done(function (patient, obv) {

                    $("#patietid").val(patient.id);
                    
                    var byCodes = smart.byCodes(obv, 'code');
                    var gender = patient.gender;

                    var fname = '';
                    var lname = '';
                    var phone = '';
                    var email = '';

                    if (typeof patient.name[0] !== 'undefined') {
                        fname = patient.name[0].given.join(' ');
                        lname = patient.name[0].family.join(' ');
                    }

                    if (typeof patient.telecom[0] !== 'undefined') {
                        phone = patient.telecom[0].value;
                    }
                    if (typeof patient.telecom[1] !== 'undefined') {
                        email = patient.telecom[1].value;
                    }

                    var height = byCodes('8302-2');
                    var systolicbp = getBloodPressureValue(byCodes('55284-4'), '8480-6');
                    var diastolicbp = getBloodPressureValue(byCodes('55284-4'), '8462-4');
                    var hdl = byCodes('2085-9');
                    var ldl = byCodes('2089-1');

                    var p = defaultPatient();
                    p.birthdate = patient.birthDate;
                    p.gender = gender;
                    p.fname = fname;
                    p.lname = lname;
                    p.phone = phone;
                    p.email = email;
                    p.height = getQuantityValueAndUnit(height[0]);

                    if (typeof systolicbp != 'undefined') {
                        p.systolicbp = systolicbp;
                    }

                    if (typeof diastolicbp != 'undefined') {
                        p.diastolicbp = diastolicbp;
                    }

                    p.hdl = getQuantityValueAndUnit(hdl[0]);
                    p.ldl = getQuantityValueAndUnit(ldl[0]);

                    ret.resolve(p);

                    CreatePatient(patient.id);

                    if (obv != null) {
                        if (obv.length > 0) {
                            for (var i = 0; i <= 10; i++) {
                                if (obv[i] != null) {
                                    if (obv[i] != undefined) {
                                        var title = obv[i].code.coding[0].display;
                                        var recordeddate = obv[i].issued;
                                        CreateObservation(obv[i].id, $("#CRMpatietid").val(), "Observation - " + title, recordeddate);
                                    }
                                }
                            }
                        }
                    }


                    var alrgy = smart.patient.api.fetchAll({
                        type: 'AllergyIntolerance',
                        query: {
                            patient: patient.id
                        }
                    });

                    $.when(alrgy).done(function (Allergy) {
                        if (Allergy != null) {
                            if (Allergy.length > 0) {
                                for (var i = 0; i <= Allergy.length; i++) {
                                    if (Allergy[i] != null) {
                                        if (Allergy[i] != undefined) {
                                            var title = Allergy[i].substance.coding[0].display;
                                            var recordeddate = Allergy[i].recordedDate;
                                            CreateAllergy(Allergy[i].id, $("#CRMpatietid").val(), "Allergy - " + title, recordeddate);
                                        }
                                    }
                                }
                            }
                        }                        
                    });



                    var cp = smart.patient.api.fetchAll({
                        type: 'CarePlan',
                        query: {
                            patient: patient.id
                            //,category: 'assess-plan'
                        }
                    });

                    $.when(cp).done(function (careplan) {
                        if (careplan != null) {
                            if (careplan.length > 0) {
                                for (var i = 0; i <= 10; i++) {
                                    if (careplan[i] != null) {
                                        if (careplan[i] != undefined) {
                                            CreateCarePlan(careplan[i].id, $("#CRMpatietid").val(), fname + " " + lname + " Care Plan", fname + " " + lname + " Care Plan", careplan[i].period.start, careplan[i].period.start);
                                        }
                                    }
                                }
                            }
                        }
                    });


                    setTimeout(function () {
                        $("#timeline").show();
                        timeline();
                    }, 7000);                   

                });
            } else {
                onError();
            }
        }

        FHIR.oauth2.ready(onReady, onError);
        return ret.promise();

    };

    function defaultPatient() {
        return {
            fname: { value: '' },
            lname: { value: '' },
            phone: { value: '' },
            email: { value: '' },
            gender: { value: '' },
            birthdate: { value: '' },
            height: { value: '' },
            systolicbp: { value: '' },
            diastolicbp: { value: '' },
            ldl: { value: '' },
            hdl: { value: '' },
        };
    }

    function getBloodPressureValue(BPObservations, typeOfPressure) {
        var formattedBPObservations = [];
        BPObservations.forEach(function (observation) {
            var BP = observation.component.find(function (component) {
                return component.code.coding.find(function (coding) {
                    return coding.code == typeOfPressure;
                });
            });
            if (BP) {
                observation.valueQuantity = BP.valueQuantity;
                formattedBPObservations.push(observation);
            }
        });

        return getQuantityValueAndUnit(formattedBPObservations[0]);
    }

    function getQuantityValueAndUnit(ob) {
        if (typeof ob != 'undefined' &&
            typeof ob.valueQuantity != 'undefined' &&
            typeof ob.valueQuantity.value != 'undefined' &&
            typeof ob.valueQuantity.unit != 'undefined') {
            return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
        } else {
            return undefined;
        }
    }

    window.drawVisualization = function (p) {
        $('#holder').show();
        $('#loading').hide();
        $('#fname').html(p.fname);
        $('#lname').html(p.lname);
        $('#phone').html(p.phone);
        $('#email').html(p.email);
        $('#gender').html(p.gender);
        $('#birthdate').html(p.birthdate);
        $('#height').html(p.height);
        $('#systolicbp').html(p.systolicbp);
        $('#diastolicbp').html(p.diastolicbp);
        $('#ldl').html(p.ldl);
        $('#hdl').html(p.hdl);
    };


    function CreatePatient(patientid) {

        //var patientID = $("#txtPatientID").val();
        debugger;
        var data = {}
        var patient = {}

        patient.Externalemrid = patientid;
        patient.firstName = $("#fname").text();
        patient.lastName = $("#lname").text();
        patient.phone = $("#phone").text();
        patient.email = $("#email").text();

        data.patient = patient;

        console.log(data);

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "CreatePatientCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(data),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            },
            success: function (data) {
                if (data.data.records != null) {

                    $("#CRMpatietid").val(data.data.records.patientId);                    

                }

            },
            error: function () {
                console.log("error");
            }
        });


    }

    function CreateCarePlan(id, patientid, title, desc, startdate, enddate) {
        debugger;
        var data = {}
        var patientCarePlan = {}
        patientCarePlan.Externalemrid = id;
        patientCarePlan.Title = title;
        patientCarePlan.Description = desc;
        patientCarePlan.STartDate = startdate;
        patientCarePlan.EndDate = enddate;
        patientCarePlan.PatientID = patientid;

        data.patientCarePlan = patientCarePlan;

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "CreatePatientCarePlanCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(data),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            },
            success: function (data) {
                if (data.data.records != null) {

                    //$("#timeline").show();

                    //timeline();
                }

            },
            error: function () {
                console.log("error");
            }
        });
    }

    function CreateAllergy(id, patientid, title, startdate) {
        debugger;
        var data = {}
        var patientAllergy = {}
        patientAllergy.Externalemrid = id;
        patientAllergy.name = title;
        patientAllergy.patientId = patientid;
        patientAllergy.RecordedDate = startdate;

        data.patientAllergy = patientAllergy;

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "CreatePatientAllergyCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(data),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            },
            success: function (data) {
                if (data.data.records != null) {

                    //$("#timeline").show();

                    //timeline();
                }

            },
            error: function () {
                console.log("error");
            }
        });
    }

    function CreateObservation(id, patientid, title, IssuedDate) {
        debugger;
        var data = {}
        var patientObservation = {}
        patientObservation.Externalemrid = id;
        patientObservation.description = title;
        patientObservation.patientId = patientid;
        patientObservation.IssuedDate = IssuedDate;

        data.patientObservation = patientObservation;

        $.ajax({
            url: $("#hdnPatientChartAPIURL").val() + "CreatePatientObservationCRM",
            method: "POST",
            async: false,
            dataType: "json",
            data: JSON.stringify(data),
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            cache: false,
            beforeSend: function (xhr) {
                /* Authorization header */
                xhr.setRequestHeader("Authorization", $("#AuthorizationToken").val());
            },
            success: function (data) {
                if (data.data.records != null) {

                    //$("#timeline").show();

                    //timeline();
                }

            },
            error: function () {
                console.log("error");
            }
        });
    }

})(window);
