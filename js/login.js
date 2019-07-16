var loginApp = {};
(function () {
	$(document).ready(function () {
		// LodaingBar
		NProgress.configure({ showSpinner: false });
		NProgress.start();

		//Variable list
		var uniqueid = '';
		var instancdatabase = app_firebase.database().ref('instance');
		var defaultimage = 'https://www.inreportcard.in/images/profile/user.png';

		var firebase = app_firebase;
		//Firebase Auth Listener
		firebase.auth().onAuthStateChanged(function (user) {
			if (user) {
				// User is signed in.
				check_user_existORnot();
			} else {
				//User is not Loged in.
				$('#loginui').show();
				showloginui();
			}
		});

		function showloginui() {
			makeid();
			var ui = new firebaseui.auth.AuthUI(firebase.auth());
			var uiConfig = {
				callbacks: {
					signInSuccessWithAuthResult: function (authResult, redirectUrl) {
						// User successfully signed in.
						// Return type determines whether we continue the redirect automatically
						// or whether we leave that to developer to handle.
						return false;
					},
					uiShown: function () {
						// The widget is rendered.
						// Hide the loader.
						document.getElementById('loader').style.display = 'none';
					}
				},
				// Will use popup for IDP Providers sign-in flow instead of the default, redirect.
				signInFlow: 'popup',

				signInOptions: [
					// Leave the lines as is for the providers you want to offer your users.
					firebase.auth.GoogleAuthProvider.PROVIDER_ID
					//   firebase.auth.FacebookAuthProvider.PROVIDER_ID,
					//   firebase.auth.TwitterAuthProvider.PROVIDER_ID,
					//   firebase.auth.GithubAuthProvider.PROVIDER_ID,
					// firebase.auth.PhoneAuthProvider.PROVIDER_ID

					// firebase.auth.EmailAuthProvider.PROVIDER_ID,
				],
				// Terms of service url.
				tosUrl: 'main.html',
				// Privacy policy url.
				privacyPolicyUrl: '<your-privacy-policy-url>'
			};

			// The start method will wait until the DOM is loaded.
			ui.start('#firebaseui-auth-container', uiConfig);
		}

		function check_user_existORnot() {
			$('#loginui').hide();
			NProgress.start();
			var user = app_firebase.auth().currentUser;
			var uid = user.uid;
			var path = 'users/' + uid;
			var sliceuid = user.uid.slice(0, 8);

			var teachers_database = app_firebase.database().ref(path);
			teachers_database.once('value', function (snapshot) {
				if (snapshot.exists()) {
					mainfunction(uid);
				} else {
					teachers_database.set(
						{
							name: user.displayName,
							email: user.email,
							uid: user.uid,
							imageurl: user.photoURL
						},
						function (error) {
							if (error) {
								// The write failed...
							} else {
								// Data saved successfully!
								mainfunction(uid);
							}
						}
					);
				}
			});
		}

		function mainfunction(uid) {
			$.toast({
				heading: 'Log in successful',
				icon: 'success',
				loader: false, // Change it to false to disable loader
				bgColor: '#28a745', // To change the background
				position: 'top-right',
				textColor: 'white',
				showHideTransition: 'slide'
			});

			$('#togglebtnui').show();
			$('#logbtnui').show();
			$('#datesectionui').show();
			$('#conatinerid').show();
			$('#loginui').hide();
			// $("#studenttableui").show();

			//Variable Define
			var mAfterslice = uid.slice(0, 8);
			var rootdatabase = null;
			var rootpath = 'classes/' + mAfterslice + '/';
			var initialname = '';
			rootdatabase = app_firebase.database().ref(rootpath);
			var adddatabase = null;
			var deletedatabase = null;
			var changedatabase = null;
			var dataaddlistner = null;
			var deletelistner = null;
			var changelistener = null;
			var initialFetch = false;
			var changeFetch = false;
			var attend = 0;
			var absent = 0;
			var tempsec = '';
			var tempdate = '';
			var trigar = false;

			var teacherdatabase = app_firebase.database().ref('users');
			teacherdatabase.child(uid).on('value', function (snapshot) {
				if (snapshot.exists()) {
					var value = snapshot.val();
					initialname = value.name;

					//Set name on dp
					$('#teachername').text(value.name);
					$('#avater').attr('src', value.imageurl);
					NProgress.done();
					NProgress.remove();
				}
			});

			// Datepicker code here
			var date_input = $('input[name="date"]'); //our date input has the name "date"
			var container = $('.bootstrap-iso form').length > 0 ? $('.bootstrap-iso form').parent() : 'body';
			date_input.datepicker({
				format: 'dd-mm-yyyy',
				container: container,
				todayHighlight: true,
				autoclose: true
			});

			//Datepicker Set Today date
			$('#get-dateinput').datepicker('setDate', new Date());

			//Generate qr code btn and show student list
			$('#qr-code-generate-btn').click(function () {
				var section = $('#section-input').val();
				var date = $('#get-dateinput').val();
				if (date != '' && section != null && section != 'Choose...') {
					tempdate = date;
					tempsec = section;
					NProgress.start();
					$('#atttable > tbody').html('');
					$('#qr-code-generate-btn').prop('disabled', true);
					$('#delete-btn').prop('disabled', false);
					$('#qr-view-btn').prop('disabled', false);
					$('#studenttableui').hide();

					changeFetch = false;
					initialFetch = false;
					createinitial();
					setdefaultAttenden(section, date);

					setTimeout(function () {
						if (trigar == true) {
							$('#studenttableui').show();
							dataadd(section);
							loadstudentlist(section, date);
							datesecurity(section, date);
						}
					}, 3000);
				}
			});
			//View Qr code
			$('#qr-view-btn').click(function () {
				createqrcode(tempsec, tempdate);
			});

			//Save Attendnce
			$('#save-btn').click(function () {
				NProgress.start();
				savetodayattendance(tempsec, tempdate);
			});
			//Delete Section
			$('#delete-btn').click(function () {
				NProgress.start();
				deletesection(tempsec);
			});
			//Page Attendnce
			$('#attendancepageid').click(function () {
				$('#setreportui').hide();
				$('#studentreportui').hide();
				$('#datesectionui').show();
				$('#reporttable > tbody').html('');
				$(document).off('click', '.btn_view');
			});
			//Page Report
			$('#reportpageid').click(function () {
				$('#datesectionui').hide();
				$('#studenttableui').hide();
				$('#atttable > tbody').html('');
				$('#Tstudent-counter').text('0');
				$('#Astudent-counter').text('0');
				$('#Abstudent-counter').text('0');
				$('#setreportui').show();
				// $("#studentreportui").show();
			});
			//Report button
			$('#report-btn').click(function () {
				var section = $('#report-section-input').val();

				if (section != null && section != 'Choose...') {
					loaddata(section);
				}
			});

			//Load Report
			function loaddata(section) {
				$('#report-btn').prop('disabled', true);
				NProgress.start();
				$(document).off('click', '.btn_view');
				var content = '';
				var name = '';
				var i = 0;
				var datebeta = '';
				var classes = 0;
				$('#reporttable > tbody').html('');
				rootdatabase.child(section).child('dates').once('value', function (snapshot) {
					if (snapshot.exists()) {
						$('#studentreportui').show();

						snapshot.forEach(function (data) {
							var val = data.val();
							var key = data.key;
							classes++;
						});

						rootdatabase.child(section).child('students').once('value', function (snapshot) {
							snapshot.forEach(function (data) {
								var absent = 0;
								var attend = 0;

								var val = data.val();
								var key = data.key;
								i++;

								rootdatabase
									.child(section)
									.child('students')
									.child(key)
									.once('value', function (snapshot) {
										snapshot.forEach(function (data) {
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

								content +=
									'<tr id="row_' +
									key +
									'">' +
									'<td>' +
									i +
									'</td>' +
									'<td><span id="sku_' +
									key +
									'">' +
									key +
									'</span></td>' +
									'<td><span id="descrip' +
									key +
									'">' +
									val.name +
									'</span></td>' +
									'<td><button class="btn btn-outline-secondary btn-sm btn_view" key="' +
									key +
									'" ><span class="glyphicon glyphicon-eye-open"></span></button> ' +
									'<td><span id="descri' +
									key +
									'" style="color:#28a745">' +
									attend +
									'</span></td>' +
									'<td><span id="descrip' +
									key +
									'"style="color:#dc3545">' +
									absent +
									'</span></td>' +
									'<td><span id="totalclass' +
									key +
									'">' +
									classes +
									'</span></td>' +
									'</td>' +
									'</tr>';
							});
							var view = function (e) {
								$('.table-view > tbody').html('');
								var key = $(this).attr('key');
								$('#pop_up_report').modal('show');
								var content = '';
								var i = 0;

								rootdatabase
									.child(section)
									.child('students')
									.child(key)
									.once('value', function (snapshot) {
										var val = snapshot.val();
										var key = snapshot.key;
										$('.student-name_report').text(val.name);
										snapshot.forEach(function (data) {
											var val = data.val();
											var key = data.key;
											i++;

											switch (val.status) {
												case true:
													content +=
														'<tr id="row_' +
														key +
														'">' +
														'<td>' +
														i +
														'</td>' +
														'<td><span id="sku_' +
														key +
														'">' +
														key +
														'</span></td>' +
														'<td><span class="glyphicon glyphicon-ok" style="color:#28a745"></span></td>' +
														'</td>' +
														'</tr>';
													break;
												case false:
													content +=
														'<tr id="row_' +
														key +
														'">' +
														'<td>' +
														i +
														'</td>' +
														'<td><span id="sku_' +
														key +
														'">' +
														key +
														'</span></td>' +
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
							};

							$('#reporttable').append(content);
							$(document).on('click', '.btn_view', view);
							$('#report-btn').prop('disabled', false);
							NProgress.done();
							NProgress.remove();
						});
					} else {
						$('#report-btn').prop('disabled', false);
						$.toast({
							heading: 'No student found',
							text: 'Please add student',
							icon: 'warning',
							loader: false, // Change it to false to disable loader
							bgColor: '#ffc107', // To change the background
							position: 'top-right',
							textColor: 'white',
							showHideTransition: 'slide'
						});
						NProgress.done();
						NProgress.remove();
					}
				});

				//Data delete listner
				rootdatabase.once('child_removed', (data) => {
					// if (!changeFatch) return;
					var val = data.val();
					var key = data.key;
				});
			}

			//Delete Section
			function deletesection(section) {
				if (confirm('Are you sure?')) {
					rootdatabase
						.child(section)
						.remove()
						.then(function () {
							$('#Tstudent-counter').text('0');
							$('#Astudent-counter').text('0');
							$('#Abstudent-counter').text('0');
							$('#studenttableui').hide();
							$('#atttable > tbody').html('');
							NProgress.done();
							NProgress.remove();
						})
						.catch(function (error) {
							console.log('Remove failed: ' + error.message);
							NProgress.done();
							NProgress.remove();
						});
				}
			}

			// DateSave
			function datesecurity(section, date) {
				rootdatabase.child(section).child('students').once('value', function (snapshot) {
					if (snapshot.exists()) {
						rootdatabase.child(section).child('dates').child(date).once('value', function (snapshot) {
							if (!snapshot.exists()) {
								rootdatabase.child(section).child('dates').child(date).update({
									date: true
								});
							} else {
								rootdatabase.child(section).child('dates').child(date).update({
									date: true
								});
							}
						});
					} else {
					}
				});
			}

			//Save Attendance
			function savetodayattendance(section, date) {
				rootdatabase.child(section).child('students').once('value', function (snapshot) {
					if (snapshot.exists()) {
						rootdatabase.child(section).child('dates').child(date).update({
							date: false
						}, function (error) {
							if (error) {
								NProgress.done();
								NProgress.remove();
							} else {
								NProgress.done();
								NProgress.remove();
							}
						});
					} else {
						NProgress.done();
						NProgress.remove();
					}
				});
			}

			//Create QR Code
			function createqrcode(section, date) {
				var data = date + '/' + mAfterslice + '/' + section;
				var size = 400;
				// Get the modal
				var modal = document.getElementById('myModal');
				var img = document.getElementById('myImg');
				var modalImg = document.getElementById('img01');
				modal.style.display = 'block';
				modalImg.src = 'http://chart.apis.google.com/chart?cht=qr&chl=' + data + '&chs=' + size + '';

				// Get the <span> element that closes the modal
				var span = document.getElementsByClassName('image-close')[0];

				// When the user clicks on <span> (x), close the modal
				span.onclick = function () {
					modal.style.display = 'none';
				};
			}

			//Get Student Data

			function loadstudentlist(section, date) {
				$(document).off('click', '.btn_edit');
				$(document).off('click', '.btn_delete');
				var content = '';
				attend = 0;
				absent = 0;
				var i = 0;

				//Listener Clear
				if (changelistener != null || deletelistner != null) {
					changedatabase.off('child_changed', changelistener);
					deletedatabase.off('child_removed', deletelistner);
				}

				var rootpath = 'classes/' + mAfterslice + '/' + section + '/' + 'students/';
				deletedatabase = app_firebase.database().ref(rootpath);
				changedatabase = app_firebase.database().ref(rootpath);

				rootdatabase.child(section).child('students').once('value', function (snapshot) {
					if (snapshot.exists()) {
						snapshot.forEach(function (data) {
							var val = data.val();
							var key = data.key;
							if (data.hasChild(date)) {
								//do ur stuff

								rootdatabase
									.child(section)
									.child('students')
									.child(key)
									.child(date)
									.once('value', function (snapshot) {
										var data = snapshot.val();
										i++;

										switch (data.status) {
											case true:
												attend++;
												content +=
													'<tr id="row_' +
													key +
													'">' +
													'<td><button id="att_btn-color' +
													key +
													'"  class="btn btn-primary btn-sm btn_edit" key="' +
													key +
													'" ><span id="att_btn' +
													key +
													'"  class="glyphicon glyphicon-ok"></span></button> ' +
													'<td><span id="sku_' +
													key +
													'">' +
													key +
													'</span></td>' +
													'<td><span class = "p-1" id="name_' + key + '">' + val.name + '</span></td>' +
													'<td><span id="location_' +
													key +
													'">' +
													data.location.substring(0, 70) +
													'...' +
													'</span></td>' +
													'<td><button class="btn btn-outline-danger btn-sm btn_delete" key="' +
													key +
													'" ><span class="glyphicon glyphicon-trash"></span></button> ' +
													'</td>' +
													'</tr>';
												break;
											case false:
												absent++;
												content +=
													'<tr id="row_' +
													key +
													'">' +
													'<td><button id="att_btn-color' +
													key +
													'" class="btn btn-dark btn-sm btn_edit" key="' +
													key +
													'" ><span id="att_btn' +
													key +
													'" class="glyphicon glyphicon-remove"></span></button> ' +
													'<td><span id="sku_' +
													key +
													'">' +
													key +
													'</span></td>' +
													'<td><span class = "p-1" id="name_' + key + '">' + val.name + '</span></td>' +
													'<td><span id="location_' +
													key +
													'">' +
													data.location.substring(0, 70) +
													'...' +
													'</span></td>' +
													'<td><button class="btn btn-outline-danger btn-sm btn_delete" key="' +
													key +
													'" ><span class="glyphicon glyphicon-trash"></span></button> ' +
													'</td>' +
													'</tr>';
												break;

											default:
											// code block
										}
									});
							} else {
							}
						});
						$('#total_count').val(i);
						$('#Tstudent-counter').text(i);
						$('#Astudent-counter').text(attend);
						$('#Abstudent-counter').text(absent);
						$('#Tstudent-counter').counterUp();
						$('#Astudent-counter').counterUp();
						$('#Abstudent-counter').counterUp();
						$('#atttable').append(content);
						initialFetch = true;
						changeFetch = true;
						$('#qr-code-generate-btn').prop('disabled', false);
						NProgress.done();
						NProgress.remove();
					} else {
						$('#spinner-id-qr').hide();
						$('#qr-code-generate-btn').prop('disabled', false);
						NProgress.done();
						NProgress.remove();
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
					rootdatabase
						.child(section)
						.child('students')
						.child(key)
						.child(date)
						.once('value', function (snapshot) {
							var data = snapshot.val();
							if (data.status == true) {
								$('#att_btn' + key).toggleClass('glyphicon glyphicon-remove glyphicon glyphicon-ok');
								$('#att_btn-color' + key).toggleClass(
									'btn btn-primary btn-sm btn_edit btn btn-dark btn-sm btn_edit'
								);
								$('#location_' + key).text(data.location.substring(0, 70) + '...');
								attend++;
								absent--;
								$('#Astudent-counter').text(attend);
								$('#Abstudent-counter').text(absent);
								$.toast({
									heading: 'Attendance',
									text: val.name + ' is attend.',
									icon: 'success',
									loader: false, // Change it to false to disable loader
									bgColor: '#28a745', // To change the background
									position: 'top-right',
									textColor: 'white',
									showHideTransition: 'slide'
								});
							} else {
								$('#att_btn' + key).toggleClass('glyphicon glyphicon-ok glyphicon glyphicon-remove');
								$('#att_btn-color' + key).toggleClass(
									'btn btn-dark btn-sm btn_edit btn btn-primary btn-sm btn_edit'
								);
								$('#location_' + key).text(data.location.substring(0, 70) + '...');
								absent++;
								attend--;
								$('#Astudent-counter').text(attend);
								$('#Abstudent-counter').text(absent);
							}
						});
				});

				//Student delete Function
				var remove = function (e) {
					changeFatch = false;
					e.preventDefault();
					var key = $(this).attr('key');
					console.log(key);
					if (confirm('Are you sure?')) {
						deletedatabase
							.child(key)
							.remove()
							.then(function () {
								$('#row_' + key).remove();
							})
							.catch(function (error) {
								console.log('Remove failed: ' + error.message);
							});
					}
				};

				//Attendance Click Function
				var edit = function (e) {
					e.preventDefault();
					var key = $(this).attr('key');
					changedatabase.child(key).child(date).once('value', function (snapshot) {
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
				};

				//Declare List click
				$(document).on('click', '.btn_edit', edit);
				$(document).on('click', '.btn_delete', remove);
			}

			//Data ADD Function
			function dataadd(section) {
				if (dataaddlistner != null) {
					adddatabase.off('child_added', dataaddlistner);
				}

				var addpath = 'classes/' + mAfterslice + '/' + section + '/' + 'students/';
				adddatabase = app_firebase.database().ref(addpath);

				dataaddlistner = adddatabase.on('child_added', (data) => {
					if (!initialFetch) return;

					var val = data.val();
					var key = data.key;
					var app = '';
					var count = $('#total_count').val();
					count++;
					$('#total_count').val(count);
					$('#Tstudent-counter').text(count);
					app +=
						'<tr id="row_' +
						key +
						'">' +
						'<td><button id="att_btn-color' +
						key +
						'" class="btn btn-dark btn-sm btn_edit" key="' +
						key +
						'" ><span id="att_btn' +
						key +
						'" class="glyphicon glyphicon-remove"></span></button> ' +
						'<td><span id="sku_' +
						key +
						'">' +
						key +
						'</span></td>' +
						'<td><span class = "p-1" id="name_' + key + '">' + val.name + '</span></td>' + +
						'<td><span id="location_' +
						key +
						'">' +
						'Not in class' +
						'</span></td>' +
						'<td><button class="btn btn-outline-danger btn-sm btn_delete" key="' +
						key +
						'" ><span class="glyphicon glyphicon-trash"></span></button> ' +
						'</td>' +
						'</tr>';
					$('#atttable').append(app);
					$.toast({
						heading: 'New Student Added',
						text: val.name + ' is new student of this class.',
						icon: 'success',
						loader: false, // Change it to false to disable loader
						bgColor: '#28a745', // To change the background
						position: 'top-right',
						textColor: 'white',
						showHideTransition: 'slide'
					});
				});
			}

			//Set Default attendance
			function setdefaultAttenden(section, date) {
				trigar = false;
				rootdatabase.child(section).child('students').once('value', function (snapshot) {
					if (snapshot.exists()) {
						snapshot.forEach(function (childSnapshot) {
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
						trigar = true;
					} else {
						$('#qr-code-generate-btn').prop('disabled', false);
						$.toast({
							heading: 'No student found',
							text: 'Please add student',
							icon: 'warning',
							loader: false, // Change it to false to disable loader
							bgColor: '#ffc107', // To change the background
							position: 'top-right',
							textColor: 'white',
							showHideTransition: 'slide'
						});
						trigar = false;
						NProgress.done();
						NProgress.remove();
					}
				});
			}
			//Initial Create

			function createinitial() {
				var rowinitial = initialname.replace(/[^A-Z]/g, '');
				rootdatabase.once('value', function (snapshot) {
					if (!snapshot.hasChild('initial')) {
						rootdatabase.update({
							initial: rowinitial
						});
					}
				});
			}

			//Add Student Save Btn Click
			$('#model-save-btn').click(function () {
				var id = $('#input-student-id').val();
				var name = $('#input-student-name').val();
				var section = $('#input-student-section').val();
				var date = $('#get-dateinput').val();

				//check imput empty or not
				if (!id == '' && !name == '' && !section == '' && section != 'Choose...') {
					changeFetch = false;
					$('#model-save-btn').hide();
					$('#spinner-id').show();

					rootdatabase.child(section).child('students').child(id).update({
						name: name
					}, function (error) {
						if (error) {
							// The write failed...
							$('#spinner-id').hide();
							$('#model-save-btn').show();
						} else {
							// Data saved successfully!
							// Set Today Date
							rootdatabase.child(section).child('students').child(id).child(date).update({
								status: false,
								location: 'Not in class'
							});
							$('#spinner-id').hide();
							$('#model-save-btn').show();
							$('#form-model')[0].reset();
							changeFetch = true;
						}
					});
				}
			});

			//Show Student pop model
			$('#add-student-btn').click(function () {
				$('#spinner-id').hide();
				$('form')[0].reset();
				$('#pop_up').modal('show');
			});

			// Model Reset
			$('#model-reset-btn').click(function () {
				$('#form-model')[0].reset();
			});
		}

		// GenarateuniqueId
		function makeid() {
			uniqueid = '';
			var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

			for (var i = 0; i < 9; i++) {
				uniqueid += possible.charAt(Math.floor(Math.random() * possible.length));
			}

			createqrcode();
			console.log(uniqueid);
		}

		function createqrcode() {
			//QR Code Image
			$('#image').append(
				"<img id='image-fullscreen' src='http://chart.apis.google.com/chart?cht=qr&chl=" +
				uniqueid +
				'&chs=' +
				300 +
				"' alt='qr' />"
			);
			createinstance();
		}

		function createinstance() {
			var instance = true;
			instancdatabase.child(uniqueid).on('value', function (snapshot) {
				if (snapshot.exists()) {
					var val = snapshot.val();
					var key = snapshot.key;

					if (val.value == true && val.uid != '') {
						mainfunction(val.uid);
						NProgress.start();
					} else if (val.value != true && val.uid != '') {
						console.log(val.value);
						logout();
					}
				} else {
					if (!instance) return;
					instancdatabase.child(uniqueid).set({
						value: false,
						uid: ''
					}, function (error) {
						if (error) {
							// The write failed...
						} else {
							// Data saved successfully!
							instance = true;
						}
					});
				}
			});

			$(window).bind('beforeunload', function () {
				instance = false;
				instancdatabase.child(uniqueid).remove();
				return;
			});
		}

		window.onload = function () {
			NProgress.done();
			NProgress.remove();
		};

		//Logout Function
		function logout() {
			$('#conatinerid').hide();
			firebase.auth().signOut();
			location.reload();
		}
		loginApp.logout = logout;
	});
})();
