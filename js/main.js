var mainApp = {};
(function()
{
    $(document).ready(function(){
        $("#save-btn").hide();
        $("#spinner-id-qr").hide();
        $("#spinner-id-sv").hide();
        //Variable Declare
        var mCurrent_user = null;
        var firebase = app_firebase;
        var mUid = null;
        var mAfterslice = null;
        var temp = null;
        var teachername =null;

        //Firebase Auth Listener
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
    
              // User is signed in.
              mCurrent_user = user;
              mUid = mCurrent_user.uid;
              mAfterslice = mUid.slice(0,8);
              teachername = user.displayName;
              mainfunction()
    
              //Set name on title
            $('#teacher-name').text(teachername);
            $("#avater-id").attr("src", user.photoURL);
            
    
    
            }
            else
            {
                //User is not Loged in.
                mCurrent_user = null;
                window.location.replace("login.html");
            }
          });

        function mainfunction()
        {
            
            //Counter plugIn
            $('#qr-counter').counterUp();

            //Variable Define

            var rootdatabase = null;
            var rootpath = 'classes/' + mAfterslice + '/';
            rootdatabase = app_firebase.database().ref(rootpath);
            var adddatabase = null;
            var deletedatabase = null;
            var changedatabase = null;
            var dataaddlistner = null;
            var deletelistner = null;
            var changelistener = null;
            var initialFetch = false;
            var changeFetch = false;
            var attend =0;
            var absent =0;

            // Datepicker code here
            var date_input = $('input[name="date"]'); //our date input has the name "date"
            var container = $('.bootstrap-iso form').length > 0 ? $('.bootstrap-iso form').parent() : "body";
            date_input.datepicker({
                format: 'mm-dd-yyyy',
                container: container,
                todayHighlight: true,
                autoclose: true,
        
            })
    
            //Datepicker Set Today date
            $("#get-dateinput").datepicker("setDate", new Date());
        

            //Generate qr code btn and show student list
            $("#qr-code-generate-btn").click(function() {

                var section = $('#section-input').val();
                var date = $('#get-dateinput').val();

                

                if(date != '' && section != null && section != 'Choose...')
                {
                    changeFetch = false;
                    $(".table > tbody").html("");
                    $("#spinner-id-qr").show();
                    $("#qr-code-generate-btn").prop('disabled',true);
                    $("#save-btn").hide();
                    
                    setdefaultAttenden(section,date)
                    setTimeout(function() {
                        initialFetch = false;
                        dataadd(section);
                        loadstudentlist(section,date);
                        createqrcode(section,date);
                        createsection(date);
                        datesecurity(section,date);
                    }, 3000);
            

                }
                else
                {

                }
    
    
        });


        //Section Create

        function createsection(date)
        {
            var rowinitial = teachername.replace( /[^A-Z]/g, '' );
            rootdatabase.once('value', function(snapshot)
            {

                if (!snapshot.hasChild("initial")) {

                    rootdatabase.update({
                        initial: rowinitial,
                        secur: date
                    });

                }

            });
            
            
        }

        //Get Student Data

        function loadstudentlist(section,date) {

            $(document).off();
            var content = '';
            var i = 0;
            attend =0;
            absent =0;
            $("#save-btn").show();
            //Listener Clear
            if(changelistener!=null||deletelistner!=null)
            {
                changedatabase.off('child_changed', changelistener);
                deletedatabase.off('child_removed', deletelistner);
                console.log('Working')
            }

            var rootpath = 'classes/' + mAfterslice + '/' + section + '/'+'students/';
            deletedatabase = app_firebase.database().ref(rootpath);
            changedatabase = app_firebase.database().ref(rootpath);

            //Save Attendnce
            $("#save-btn").click(function(){

                $("#spinner-id-sv").show();
                $("#save-btn").prop('disabled',true);
                savetodayattendance(section,date);

            });


            rootdatabase.child(section).child('students').once('value', function(snapshot) {
                if (snapshot.exists()) {

                  snapshot.forEach(function(data) {
                    var val = data.val();
                    var key = data.key;
                    if (data.hasChild(date)) {
                        //do ur stuff

                    rootdatabase.child(section).child('students').child(key).child(date).once('value', function(snapshot)
                    {
                        var data = snapshot.val();
                            i++;
    
                            switch (data.status) {
                                case true:
                                attend++;
                                    content += '<tr id="row_' + key + '">' +
                                        '<td>' + i + '</td>' +
                                        '<td><button id="att_btn-color' + key + '"  class="btn btn-primary btn-sm btn_edit" key="' + key + '" ><span id="att_btn' + key + '"  class="glyphicon glyphicon-ok"></span></button> ' +
                                        '<td><span id="sku_' + key + '">' + key + '</span></td>' +
                                        '<td><span id="description_' + key + '">' + val.name + '</span></td>' +
                                        '<td><span id="location_' + key + '">' + data.location + '</span></td>' +
                                        '<td><button class="btn btn-outline-danger btn-sm btn_delete" key="' + key + '" ><span class="glyphicon glyphicon-trash"></span></button> ' +
                                        // '<button class="btn btn-danger btn-xs btn_delete" key="'+key+'">Delete</button>' +
                                        '</td>' +
                                        '</tr>';
                                    break;
                                case false:
                                absent++;
                                    content += '<tr id="row_' + key + '">' +
                                        '<td>' + i + '</td>' +
                                        '<td><button id="att_btn-color' + key + '" class="btn btn-dark btn-sm btn_edit" key="' + key + '" ><span id="att_btn' + key + '" class="glyphicon glyphicon-remove"></span></button> ' +
                                        '<td><span id="sku_' + key + '">' + key + '</span></td>' +
                                        '<td><span id="description_' + key + '">' + val.name + '</span></td>' +
                                        '<td><span id="location_' + key + '">' + data.location + '</span></td>' +
                                        // '<td><button class="btn btn-primary btn-xs btn_edit" key="'+key+'" >Edit</button> ' +
                                        '<td><button class="btn btn-outline-danger btn-sm btn_delete" key="' + key + '" ><span class="glyphicon glyphicon-trash"></span></button> ' +
                                        '</td>' +
                                        '</tr>';
                                    break;
    
                                default:
                                    // code block
                    }
                });


                    }
                else
                    {

                    }
                    
                });

                $('#total_count').val(i);
                $("#Tstudent-counter").text(i);
                $("#Astudent-counter").text(attend);
                $("#Abstudent-counter").text(absent);
                $('#Tstudent-counter').counterUp();
                $('#Astudent-counter').counterUp();
                $('#Abstudent-counter').counterUp();
                $('.table').append(content);
                initialFetch = true;
                changeFetch = true;
                $("#spinner-id-qr").hide();
                $("#qr-code-generate-btn").prop('disabled',false);
             
                  
                }
                else
                {
                $("#spinner-id-qr").hide();
                $("#qr-code-generate-btn").prop('disabled',false);
                }
                });

                //Data delete listner
        deletelistner = deletedatabase.on('child_removed', (data) => {
                // if (!changeFatch) return;
                var val = data.val();
                var key = data.key;
                $('#row_' + key).remove();

                });
        

        //Attendance Chnage Listner
        changelistener = changedatabase.on('child_changed', (data) => {
                    var val = data.val();
                    var key = data.key;
                    if (!changeFetch) return;
                    rootdatabase.child(section).child('students').child(key).child(date).once('value', function(snapshot) {
                        var data = snapshot.val();
                        if (data.status == true) {
                            $('#att_btn' + key).toggleClass('glyphicon glyphicon-remove glyphicon glyphicon-ok');
                            $('#att_btn-color' + key).toggleClass('btn btn-primary btn-sm btn_edit btn btn-dark btn-sm btn_edit');
                            $('#location_' + key).text(data.location);
                            attend++;
                            absent--;
                            $("#Astudent-counter").text(attend);
                            $("#Abstudent-counter").text(absent);
                            $.toast({
                                heading: 'Attendance',
                                text: val.name+' is attend.',
                                icon: 'success',
                                loader: false,        // Change it to false to disable loader
                                bgColor: '#28a745',  // To change the background
                                position: 'top-right',
                                textColor: 'white',
                                showHideTransition: 'slide'
                            })
                        } else {
                            $('#att_btn' + key).toggleClass('glyphicon glyphicon-ok glyphicon glyphicon-remove');
                            $('#att_btn-color' + key).toggleClass('btn btn-dark btn-sm btn_edit btn btn-primary btn-sm btn_edit');
                            $('#location_' + key).text(data.location);
                            absent++;
                            attend--;
                            $("#Astudent-counter").text(attend);
                            $("#Abstudent-counter").text(absent);
                        }
        
                    });
                });

        //Student delete Function
        var remove = function(e) {
                    changeFatch = false;
                    e.preventDefault();
                    var key = $(this).attr('key');
                    console.log(key);
                    if (confirm('Are you sure?')) {
                        deletedatabase.child(key).remove().then(function() {
                            $('#row_' + key).remove();
                            var count = $('#total_count').val();
                            count--;
                            if(absent!=0)
                            {
                                absent--;
                            $("#Abstudent-counter").text(absent);
                            }
                            else if(attend!=0)
                            {
                                attend--;
                                $("#Astudent-counter").text(attend);
                            }

                            $('#total_count').val(count);
                            $("#Tstudent-counter").text(count);
                            snackbar('Student deleted Successfully');
                            
                            
                            
        
                          })
                          .catch(function(error) {
                            console.log("Remove failed: " + error.message)
                          });
                        
                    }
                }


        //Attendance Click Function
        var edit = function(e) {
                    e.preventDefault();
                    var key = $(this).attr('key');
                    changedatabase.child(key).child(date).once('value', function(snapshot) {
                        var data = snapshot.val();
                        switch (data.status) {
                            case true:
                            changedatabase.child(key).child(date).update({
                                    status: false,
                                    location: 'Not in class'
                                });
                                break;
                            case false:
                            changedatabase.child(key).child(date).update({
                                    status: true,
                                    location: 'In class'
                                });
                                break;
        
                            default:
                                // code block
                        }
                    });
        
            }
                
                
                
                
            //Declare List click
        $(document).on('click', '.btn_edit', edit);
        $(document).on('click', '.btn_delete', remove);
    }

            //Data ADD Function
        function dataadd(section) {


            if(dataaddlistner!=null)
                {
                    adddatabase.off('child_added', dataaddlistner)
                }
                
            var addpath = 'classes/' + mAfterslice + '/' + section + '/'+'students/';
            adddatabase = app_firebase.database().ref(addpath);

            dataaddlistner = adddatabase.on('child_added', (data) => {
                if (!initialFetch) return;
                    var val = data.val();
                    var key = data.key;
                    var app = '';
                    var count = $('#total_count').val();
                    count++;
                    $('#total_count').val(count);
                    $("#Tstudent-counter").text(count);
                    app += '<tr id="row_' + key + '">' +
                        '<td>' + count + '</td>' +
                        '<td><button id="att_btn-color' + key + '" class="btn btn-dark btn-sm btn_edit" key="' + key + '" ><span id="att_btn' + key + '" class="glyphicon glyphicon-remove"></span></button> ' +
                        '<td><span id="sku_' + key + '">' + key + '</span></td>' +
                        '<td><span id="description_' + key + '">' + val.name + '</span></td>' +
                        '<td><span id="location_' + key + '">' + 'Not in class' + '</span></td>' +
                        '<td><button class="btn btn-outline-danger btn-sm btn_delete" key="' + key + '" ><span class="glyphicon glyphicon-trash"></span></button> ' +
                        // '<button class="btn btn-danger btn-xs btn_delete" key="'+key+'">Delete</button>' +
                        '</td>' +
                        '</tr>';
                    $('.table').append(app);
                    $.toast({
                        heading: 'New Student Added',
                        text: val.name+' is new student of this class.',
                        icon: 'success',
                        loader: false,        // Change it to false to disable loader
                        bgColor: '#28a745',  // To change the background
                        position: 'top-right',
                        textColor: 'white',
                        showHideTransition: 'slide'
                    })
        
        
                });
        
            }


        //Create QR Code
        function createqrcode(section,date)
            {

                var data = date + '/' + mAfterslice + '/' + section;
                var size = 400;

                var fullscreen = function() {
                    // Get the modal
                    var modal = document.getElementById('myModal');
                    var img = document.getElementById('myImg');
                    var modalImg = document.getElementById("img01");
                    modal.style.display = "block";
                    modalImg.src = "http://chart.apis.google.com/chart?cht=qr&chl=" + data + "&chs=" + size + "";
    
                    // Get the <span> element that closes the modal
                    var span = document.getElementsByClassName("image-close")[0];
    
                    // When the user clicks on <span> (x), close the modal
                    span.onclick = function() {
                        modal.style.display = "none";
                    }
                }
    
                if ($("#image").is(':empty')) {
    
                    $("#deafult-qr").hide();
                    //QR Code Image
                    $("#image").append("<a  href='#'><img id='image-fullscreen' src='http://chart.apis.google.com/chart?cht=qr&chl=" + data + "&chs=" + size + "' alt='qr' /></a>");

                    console.log('Working1')
    
                } else {
                    $("#deafult-qr").hide();
                    $("#image").html("");
    
                    
    
                    $("#image").append("<a  href='#'><img id='image-fullscreen' src='http://chart.apis.google.com/chart?cht=qr&chl=" + data + "&chs=" + size + "' alt='qr' /></a>");
                    console.log('Working2')
                }

                $(document).on('click', '#image-fullscreen', fullscreen);
            }

            //Set Default attendance
            function setdefaultAttenden(section,date) {

            rootdatabase.child(section).child('students').once('value', function(snapshot) {
                if(snapshot.exists())
                {
                    snapshot.forEach(function(childSnapshot) {
                        var key = childSnapshot.key;
        
        
                        if (childSnapshot.hasChild(date)) {
                            //do ur stuff
        
                        } else {
     
                            //do something if not exists
                            rootdatabase.child(section).child('students').child(key).child(date).update({
                                status: false,
                                location: 'Not in class'
                            });
        
        
                        }
                    });
                }
                else
                {
                    snackbar('Student Not Found');
                }
    
                
    
    
            });
    
    
    
        }

        function datesecurity(section,date)
        {
            rootdatabase.child(section).child('dates').child(date).once('value',function(snapshot)
                    {
                        if(!snapshot.exists())
                        {
                            rootdatabase.child(section).child('dates').child(date).update({

                                date: true
                            });
                        }
                        else
                        {
                            rootdatabase.child(section).child('dates').child(date).update({

                                date: true
                            });
                        }

                    });
        }

        function savetodayattendance(section,date)
        {
            rootdatabase.child(section).child("dates").child(date).update({

                date: false
            }, function(error)
            {
                if(error)
                {
                    $("#spinner-id-sv").hide();
                    $("#save-btn").prop('disabled',false);
                }
                else
                {
                    $("#spinner-id-sv").hide();
                    $("#save-btn").prop('disabled',false);
                }
            });

            

        }

        //Add Student Save Btn Click
        $('#model-save-btn').click(function() {
            changeFetch = false;
            var id = $('#input-student-id').val();
            var name = $('#input-student-name').val();
            var section = $('#input-student-section').val();
            var date = $('#get-dateinput').val();

            //check imput empty or not
            if (!id == '' && !name == '' && !section == '' && section != "Choose...") {

                $("#model-save-btn").hide();
                $("#spinner-id").show();

                rootdatabase.child(section).child('students').child(id).update({

                        name: name

                    }, function(error) {
                        if (error) {
                            // The write failed...
                            $("#spinner-id").hide();
                            $("#model-save-btn").show();
                        } else {
                            // Data saved successfully!
                            // Set Today Date
                            rootdatabase.child(section).child('students').child(id).child(date).update({
                                status: false,
                                location: 'Not in class'
                            });
                            snackbar('New Student Added');
                            $("#spinner-id").hide();
                            $("#model-save-btn").show();
                            $('form')[0].reset();
                            changeFetch = true;
                        }
                    });
            }
    
    
    
        })


        }



        //Logout Function
        function logout()
        {
            firebase.auth().signOut();
        }
        mainApp.logout = logout;

        //Show Student pop model
        $('#add-student-btn').click(function() {
            $("#spinner-id").hide();
            $('form')[0].reset();
            $('#pop_up').modal('show');
          });

        // Model Reset
        $('#model-reset-btn').click(function() {

        $('form')[0].reset();

        });

        //Snackbar Function
        function snackbar(message)
        {
        var x = document.getElementById("snackbar");
            $("#snackbar").text(message);
            x.className = "show";
            setTimeout(function() {
                x.className = x.className.replace("show", "");
            }, 3000);
        }

    })

})()