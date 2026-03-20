# WORKNEST MOBILE — COMPLETE SETUP GUIDE
# Follow steps 1 to 9 in order. Do not skip any step.
# Time needed: about 45 minutes
# ─────────────────────────────────────────────────────────────

## WHAT YOU NEED BEFORE STARTING
- A computer with a browser (Chrome recommended)
- Your phone (Android or iPhone) for testing
- Your Supabase project URL and anon key
  (find these at: supabase.com → your project → Settings → API)


## STEP 1 — CREATE REPLIT PROJECT (3 minutes)

1. Open https://replit.com in your browser
2. Sign up or log in (free account is fine)
3. Click the big blue "+ Create Repl" button
4. In the search box, type: Expo
5. Click on the Expo template that appears
6. Click "Use Template"
7. Give it the name: WorkNestMobile
8. Click "Create Repl"

You will see a basic Expo app open. That is your starting point.


## STEP 2 — DELETE DEFAULT FILES (1 minute)

In the left file panel, right-click and delete these files:
- App.js  (we will replace with App.tsx)

Keep everything else for now.


## STEP 3 — CREATE FOLDERS (3 minutes)

In the left file panel, right-click → "New Folder" to create:

  src
  src/lib
  src/context
  src/navigation
  src/screens
  src/screens/auth
  src/screens/home
  src/screens/attendance
  src/screens/leave
  src/screens/payslips
  src/screens/announcements
  src/screens/profile
  src/screens/manager
  src/screens/hr
  assets

TIP: In Replit you can also type a full path like
"src/screens/auth" and it creates all parent folders automatically.


## STEP 4 — CREATE PLACEHOLDER IMAGES (1 minute)

Open the Shell tab at the bottom of Replit.
Copy and paste this single command, then press Enter:

  node -e "const fs=require('fs');const p=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==','base64');fs.mkdirSync('assets',{recursive:true});['icon','splash','adaptive-icon'].forEach(n=>fs.writeFileSync('assets/'+n+'.png',p));console.log('done')"

You should see "done" printed. This creates 3 placeholder
image files that the app needs.


## STEP 5 — COPY THE ROOT FILES (5 minutes)

Open the file: WORKNEST_MOBILE_ROOT_FILES.txt

It contains 6 sections. For each section:
1. Look at the "PATH:" line to know which file to create
2. Create that file in Replit
3. Paste the content between the ### markers

Files to create (all in project root, not inside src/):
  package.json        ← replace the existing one
  app.json            ← replace the existing one
  tsconfig.json       ← replace the existing one
  babel.config.js     ← replace the existing one
  App.tsx             ← new file (you deleted App.js in Step 2)
  .replit             ← new file (important! has the --tunnel flag)


## STEP 6 — COPY ALL 30 SOURCE FILES (25 minutes)

Open the file: WORKNEST_MOBILE_ALL_FILES.txt

It contains 30 sections. Each section looks like this:

  ######################################################################
  # FILE 01 of 30
  # PATH: src/lib/design.ts
  ######################################################################

  [code here]

For each section:
1. Note the PATH (e.g. src/lib/design.ts)
2. Create that file in Replit at that exact path
3. Paste everything between this section's ### and the next ###

Do them in order from FILE 01 to FILE 30.
The order does not technically matter but going in order
helps you track where you are.

THE 30 FILES ARE:
  01  src/lib/design.ts
  02  src/lib/supabase.ts
  03  src/lib/storage.ts              ← AsyncStorage (works in Replit)
  04  src/lib/notifications.ts
  05  src/context/AuthContext.tsx
  06  src/navigation/RootNavigator.tsx
  07  src/navigation/MainNavigator.tsx  ← use only this version
  08  src/screens/auth/LoginScreen.tsx
  09  src/screens/home/HomeScreen.tsx
  10  src/screens/attendance/PunchScreen.tsx
  11  src/screens/attendance/AttendanceScreen.tsx
  12  src/screens/attendance/AttendanceLogScreen.tsx
  13  src/screens/leave/LeaveScreen.tsx
  14  src/screens/leave/ApplyLeaveScreen.tsx
  15  src/screens/leave/ApprovalsScreen.tsx
  16  src/screens/leave/LeaveDetailScreen.tsx
  17  src/screens/payslips/PayslipsScreen.tsx
  18  src/screens/payslips/PayslipDetailScreen.tsx
  19  src/screens/announcements/AnnouncementsScreen.tsx
  20  src/screens/announcements/AnnouncementDetailScreen.tsx
  21  src/screens/profile/ProfileScreen.tsx
  22  src/screens/profile/EditProfileScreen.tsx
  23  src/screens/profile/NotificationsScreen.tsx
  24  src/screens/manager/TeamScreen.tsx
  25  src/screens/manager/TeamMemberScreen.tsx
  26  src/screens/hr/HRDashboardScreen.tsx
  27  src/screens/hr/HRAttendanceScreen.tsx
  28  src/screens/hr/HRLeaveScreen.tsx
  29  src/screens/hr/HREmployeesScreen.tsx
  30  src/screens/hr/HRReportsScreen.tsx


## STEP 7 — ADD YOUR KEYS (2 minutes)

In Replit, click the padlock icon (🔒) in the left sidebar.
It is called "Secrets". Add these 3 entries:

  Key: EXPO_PUBLIC_SUPABASE_URL
  Value: https://xxxxxxxxxxxx.supabase.co
  (replace xxxxxxxxxxxx with your actual project reference)

  Key: EXPO_PUBLIC_SUPABASE_ANON_KEY
  Value: eyJhbGc...  (your anon key — long string starting with eyJ)

  Key: EXPO_PUBLIC_OLA_MAPS_KEY
  Value: your-ola-maps-key
  (or type "skip" here for now — the app will work without it,
   GPS map thumbnails just won't show)

Where to find your Supabase keys:
  supabase.com → your project → Settings → API
  Copy "Project URL" and "anon public" key


## STEP 8 — INSTALL AND RUN (5 minutes)

In the Shell tab at the bottom of Replit, type:

  npm install

Press Enter. Wait 3 to 5 minutes. You will see many lines
of output — this is normal.

When it finishes, click the big green ▶ Run button at the top.

Wait about 30 seconds. You will see a QR code appear
in the Console panel.


## STEP 9 — OPEN ON YOUR PHONE (2 minutes)

1. On your phone, go to the app store:
   Android → Play Store → search "Expo Go" → Install
   iPhone  → App Store → search "Expo Go" → Install

2. Open Expo Go

3. Android: tap "Scan QR Code" → scan the QR from Replit
   iPhone: open the Camera app → point at the QR → tap the link

4. Wait 10-15 seconds for the app to load

5. You should see the WorkNest login screen!

Use an employee's email and password from your Supabase
auth users table to log in.


## THE APP IS NOW RUNNING!

Every time you save a file in Replit, the phone updates
automatically. This is called "hot reload".

You do not need an Expo account for this.
You do not need Android Studio.
You do not need a Mac for iOS testing (just use Expo Go).


## IF SOMETHING GOES WRONG

PROBLEM: "Cannot find module '@/lib/...'"
FIX: babel.config.js is wrong or missing.
Check it has module-resolver with alias '@': './src'

PROBLEM: Phone says "Could not connect"
FIX: The .replit file is missing --tunnel in the run command.
Open .replit and make sure it says: npx expo start --tunnel

PROBLEM: Login screen shows but login fails
FIX: Your Supabase keys in Secrets are wrong.
Double-check the URL has no trailing slash.

PROBLEM: Blank white screen after login
FIX: The user you logged in with does not have a row
in the org_users table in Supabase.
Go to Supabase → Table Editor → org_users → add a row.

PROBLEM: Metro bundler stops / "Connection lost"
FIX: Free Replit plan goes to sleep. Click Run again.
Keep the browser tab open to prevent sleep.

PROBLEM: Red error "MMKV is not available"
FIX: You used the old storage.ts. Use FILE 03 from
WORKNEST_MOBILE_ALL_FILES.txt — the AsyncStorage version.

PROBLEM: npm install fails
FIX: Run this instead:
  npm install --legacy-peer-deps


## NEXT STEP AFTER TESTING: BUILD AN APK

Once the app works on your phone via Expo Go, you can
build a real APK file to install on any Android phone:

  npm install -g eas-cli
  eas login         ← create free account at expo.dev first
  eas init          ← one-time setup
  eas build --platform android --profile preview

This runs in Expo's cloud and takes about 15 minutes.
You get a download link for the APK file.
No Mac, no Android Studio, no local build needed.

