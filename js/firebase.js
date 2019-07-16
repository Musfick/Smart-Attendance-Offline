var app_firebase = {};
(function () {
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyAKDuLaR4yygek6MS1DRMEr5vJFSB046Ec",
		authDomain: "smart-attendace-d23ec.firebaseapp.com",
		databaseURL: "https://smart-attendace-d23ec.firebaseio.com",
		projectId: "smart-attendace-d23ec",
		storageBucket: "smart-attendace-d23ec.appspot.com",
		messagingSenderId: "684029797621"
	};
	firebase.initializeApp(config);

	app_firebase = firebase;
})();
