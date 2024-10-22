**Preconditions:**

Ensure the user has a valid account in the system (username and password).
The system's URL is accessible on a desktop browser.
https://bookingtest.internal.hippodigital.cloud/signin?returnUrl=/

**Test Steps:**

1.Open Browser:
Launch any desktop web browser (e.g., Google Chrome, Mozilla Firefox, Microsoft Edge).

2.Navigate to System URL:
Enter the url of the Office Booking app in the browser’s address bar and hit Enter. (check pre req)

3.Verify Homepage Loading:
Confirm that the system’s homepage loads properly without any errors.
Check for the correct display of UI elements like, Sign in button, and system branding.

4.Login to the System:
Click on the Sign in button.
Enter valid login credentials (username and password).
Click the "Login" button.

5.Verify Successful Login:
Confirm that the user is redirected to the home page of the system after login.
Check the url: https://bookingtest.internal.hippodigital.cloud
Check for a welcome message with login user name,  Make a new booking button and Menu items 1) Make a new booking 2) My bookings

6.Access Desk Booking Feature:
Navigate to the Make a new booking section via the menu or homepage.
Verify that the desk booking interface loads correctly on the desktop, showing available Locations and Book at this location button
Verify that clicking on Book at this location button navigates to next page ie: What would you like to book? showing avialable areas and Book in this area button
Verify that clicking on Book in this area button will navigate to Pick a space page displaying an interactive floorplan and an option to Choose a date (Day/calendar)

7.Check Responsive Design:
Resize the browser window to different sizes to ensure that the system maintains usability and proper layout on various screen resolutions.

8.Check the success pop up:
Select a location, space and book an area
In the booking interface, choose a valid date for booking from the date picker.
Once the date and location are selected, click the"Confirm", to proceed with the booking.
A confirmation pop-up should appear with the booking details (selected date, location, and other relevant info). would you like to place this booking? title should be dispalyed on this pop up
Review the details, then click "Yes. Book it" to confirm the booking.
After clicking "Yes", a success notification should appear.(Booking confirmed with green tick)
The pop-up should include a success message (e.g., "Booking Confirmed!"
Check if the booking details (such as date and location) are displayed within the "Your booking details" section
After the success message is displayed, verify that the user can navigate to the system's homepage or the home page.
Confirm that the homepage now shows the booking details (e.g., next desk/parking reservation, date, and location).
Ensure no errors occur during the booking process.

9.Log Out:
Log out from the system by clicking the "Logout" button or link.
Confirm that the user is successfully logged out and redirected to the login or homepage.

**Expected Results:**
The desk booking should be fully accessible on a desktop browser.
All pages and features (login, desk booking) should load and function without issues.
The system should maintain a responsive design on different desktop resolutions.

