// scripts/setup-admin.js
// Node.js script to set up Palletteo admin system

const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

// Firebase Admin configuration using your project details
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "palletteo",
  // You'll need to add a service account key for admin operations
  // Download from Firebase Console > Project Settings > Service Accounts
};

// Admin user configuration
const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "james.gibbens@gmail.com";
const ADMIN_NAME = "James Gibbens";

async function initializeFirebaseAdmin() {
  try {
    // Check if already initialized
    if (admin.apps.length === 0) {
      // Option 1: Using service account key file (recommended)
      const serviceAccountPath = path.join(
        process.cwd(),
        "serviceAccountKey.json"
      );

      try {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: firebaseConfig.projectId,
        });
        console.log("✅ Firebase Admin initialized with service account");
      } catch (error) {
        // Option 2: Using environment variables (fallback)
        console.log(
          "📝 Service account file not found, trying environment variables..."
        );

        if (process.env.FIREBASE_PRIVATE_KEY) {
          const serviceAccount = {
            projectId:
              process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          };

          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: firebaseConfig.projectId,
          });
          console.log(
            "✅ Firebase Admin initialized with environment variables"
          );
        } else {
          throw new Error("No Firebase Admin credentials found");
        }
      }
    }

    return admin.firestore();
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin:", error.message);
    console.log("\n🔧 Setup Instructions:");
    console.log(
      "1. Go to Firebase Console > Project Settings > Service Accounts"
    );
    console.log('2. Click "Generate new private key"');
    console.log(
      '3. Save the file as "serviceAccountKey.json" in your project root'
    );
    console.log(
      "4. Or set environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
    );
    process.exit(1);
  }
}

async function checkExistingAdmin(db) {
  try {
    const usersSnapshot = await db.collection("users").get();
    const admins = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.isAdmin) {
        admins.push({
          email: doc.id,
          name: userData.name,
          role: userData.role || "admin",
        });
      }
    });

    return admins;
  } catch (error) {
    console.error("Error checking existing admins:", error);
    return [];
  }
}

async function createFirstAdmin(db) {
  try {
    console.log(`📝 Creating Super Admin account...`);
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`👤 Name: ${ADMIN_NAME}`);
    console.log(`🔥 Project: ${firebaseConfig.projectId}`);

    const userRecord = {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      isAdmin: true,
      role: "super_admin",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("users").doc(ADMIN_EMAIL).set(userRecord);

    console.log("✅ Super Admin account created successfully!");
    return true;
  } catch (error) {
    console.error("❌ Failed to create admin:", error);
    return false;
  }
}

async function setupPalletteoAdmin() {
  console.log("🎨 Palletteo Admin Setup");
  console.log("========================");
  console.log(`🚀 Setting up admin for project: ${firebaseConfig.projectId}`);
  console.log("");

  try {
    // Initialize Firebase Admin
    const db = await initializeFirebaseAdmin();

    // Check for existing admins
    console.log("🔍 Checking for existing admins...");
    const existingAdmins = await checkExistingAdmin(db);

    if (existingAdmins.length > 0) {
      console.log("⚠️  Admin accounts already exist:");
      existingAdmins.forEach((admin) => {
        console.log(`   📧 ${admin.email} (${admin.role})`);
      });
      console.log("");

      const hasTargetAdmin = existingAdmins.some(
        (admin) => admin.email === ADMIN_EMAIL
      );
      if (hasTargetAdmin) {
        console.log(`✅ ${ADMIN_EMAIL} is already set up as an admin`);
      } else {
        console.log(`ℹ️  ${ADMIN_EMAIL} not found in existing admins`);
        console.log("🔄 Creating admin account anyway...");
        await createFirstAdmin(db);
      }
    } else {
      console.log("📝 No existing admins found. Creating first Super Admin...");
      await createFirstAdmin(db);
    }

    console.log("");
    console.log("🎉 Setup Complete!");
    console.log("==================");
    console.log("✅ Your Palletteo admin system is ready");
    console.log(`📧 Admin Email: ${ADMIN_EMAIL}`);
    console.log("👑 Role: Super Admin");
    console.log("");
    console.log("🚀 Next Steps:");
    console.log("1. Start your Next.js app: npm run dev");
    console.log("2. Go to: http://localhost:3000/admin");
    console.log(`3. Sign up/Sign in with: ${ADMIN_EMAIL}`);
    console.log('4. Access the "Users" tab to manage team members');
    console.log("5. Start managing your Palletteo system!");
    console.log("");
    console.log("🔐 Security: Only you have Super Admin access");
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Helper function to setup Firebase environment variables
function showEnvironmentSetup() {
  console.log("🔧 Environment Variable Setup");
  console.log("=============================");
  console.log("Add these to your .env.local file:");
  console.log("");
  console.log("# Firebase Admin SDK");
  console.log("FIREBASE_PROJECT_ID=palletteo");
  console.log(
    "FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@palletteo.iam.gserviceaccount.com"
  );
  console.log(
    'FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n"'
  );
  console.log("");
  console.log("Get these values from your Firebase service account key file.");
}

// Run setup if called directly
if (require.main === module) {
  // Check if help flag is passed
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    showEnvironmentSetup();
  } else {
    setupPalletteoAdmin();
  }
}

module.exports = {
  setupPalletteoAdmin,
  showEnvironmentSetup,
};

// package.json additions
// Add this to your package.json scripts section:
/*
{
  "scripts": {
    "setup:admin": "node scripts/setup-admin.js",
    "setup:help": "node scripts/setup-admin.js --help"
  },
  "devDependencies": {
    "firebase-admin": "^12.0.0",
    "dotenv": "^16.0.0"
  }
}
*/
