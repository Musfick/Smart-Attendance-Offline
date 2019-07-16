var reportApp = {};
(function()
{
    $(document).ready(function(){
        //Variable Declare
        var mCurrent_user = null;
        var firebase = app_firebase;
        var mUid = null;
        var mAfterslice = null;

        //Firebase Auth Listener
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
    
              // User is signed in.
              mCurrent_user = user;
              mUid = mCurrent_user.uid;
              mAfterslice = mUid.slice(0,8);
              teachername = user.displayName;

              //Set name on title
            $('#teacher-name').text(teachername);
            $("#avater-id").attr("src", user.photoURL);
            mainfunction();   
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
            var rootdatabase = null;
            var rootpath = 'classes/' + mAfterslice + '/';
            rootdatabase = app_firebase.database().ref(rootpath);

            $("#report-btn").click(function() {

                var section = $('#section-input').val();

                if(section != null && section != 'Choose...')
                {
                    loaddata(section);
                }

                
            });


            function loaddata(section)
            {

            var content = '';
            var name ='';
            var i = 0;
            var datebeta = '';
            var classes = 0;
            $(document).off();
            $(".table > tbody").html("");

            var rootpath = 'classes/' + mAfterslice + '/' + section + '/';
            deletedatabase = app_firebase.database().ref(rootpath);
            changedatabase = app_firebase.database().ref(rootpath);

            rootdatabase.child(section).child('dates').once('value', function(snapshot) {
                if (snapshot.exists()) {

                  snapshot.forEach(function(data) {
                    var val = data.val();
                    var key = data.key;
                    classes++;
                    
                });

                rootdatabase.child(section).child('students').once('value', function(snapshot)
                    {
                        
                        snapshot.forEach(function(data) {

                            var absent =0;
                            var attend =0;
                            
                            var val = data.val();
                            var key = data.key;
                            i++;
                            
                            rootdatabase.child(section).child('students').child(key).once('value',function(snapshot)
                            {
                                snapshot.forEach(function(data) {

                                    var val = data.val();
                                    var key = data.key;
                                    switch (val.status) {
                                        case true:
                                        attend++;
                                            break;
                                        case false:
                                        absent++;
                                            break;
            
                                        default:
                                            // code block
                                         }

                                });

                            });

                            content += '<tr id="row_' + key + '">' +
                                        '<td>' + i + '</td>' +
                                        '<td><span id="sku_' + key + '">' + key + '</span></td>' +
                                        '<td><span id="descrip' + key + '">' + val.name + '</span></td>' +
                                        '<td><button class="btn btn-outline-secondary btn-sm btn_view" key="' + key + '" ><span class="glyphicon glyphicon-eye-open"></span></button> ' +
                                        '<td><span id="descri' + key + '" style="color:#28a745">' + attend + '</span></td>' +
                                        '<td><span id="descrip' + key + '"style="color:#dc3545">' + absent + '</span></td>' +
                                        '<td><span id="totalclass' + key + '">' + classes + '</span></td>' +
                                        '</td>' +
                                        '</tr>';

                            
                            

                        });
                        var view = function(e) {
                            $(".table-view > tbody").html("");
                            var key = $(this).attr('key');
                            $('#pop_up').modal('show');
                            var content = '';
                            var i =0;
                            
                            rootdatabase.child(section).child('students').child(key).once('value',function(snapshot)
                            {
                                var val = snapshot.val();
                                var key = snapshot.key;
                                $('.student-name').text(val.name);
                                snapshot.forEach(function(data) {

                                    var val = data.val();
                                    var key = data.key;
                                    i++;

                                    switch (val.status) {
                                        case true:
                                        content += '<tr id="row_' + key + '">' +
                                                    '<td>' + i + '</td>' +
                                                    '<td><span id="sku_' + key + '">' + key + '</span></td>' +
                                                    '<td><span class="glyphicon glyphicon-ok" style="color:#28a745"></span></td>' +
                                                    '<td></td>' +
                                                    '</td>' +
                                                    '</tr>';
                                            break;
                                        case false:
                                        content += '<tr id="row_' + key + '">' +
                                                    '<td>' + i + '</td>' +
                                                    '<td><span id="sku_' + key + '">' + key + '</span></td>' +
                                                    '<td></td>' +
                                                    '<td><span class="glyphicon glyphicon-remove" style="color:#dc3545"></span></td>' +
                                                    '</td>' +
                                                    '</tr>';
                                            break;
            
                                        default:
                                            // code block
                                         }

                                });
                                $('.table-view').append(content);
                            });

                        }
                    

                        $('.table').append(content);
                        $(document).on('click', '.btn_view', view);
                        

                });
                

                
             
                  
                }
                });

                //Data delete listner
        rootdatabase.on('child_removed', (data) => {
                // if (!changeFatch) return;
                var val = data.val();
                var key = data.key;


                });
        

        
       

    

    }





          }








        //Logout Function
        function logout()
        {
            firebase.auth().signOut();
        }
        reportApp.logout = logout;
    })

})()