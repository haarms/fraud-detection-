// mongodb-db.js - Mongoose Database Connection & Schemas
// Ready for Node.js / Express / Next.js backend connection to MongoDB Atlas

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:NigeriaRental2026!@cluster0.mongodb.net/rental_db?retryWrites=true&w=majority';

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

// User Schema
const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Landlord', 'Tenant', 'Admin', 'EstateManager'], required: true },
  nin: { type: String, required: true, length: 11 },
  profilePic: { type: String, default: '' },
  isEmailVerified: { type: Boolean, default: false },
  isNinVerified: { type: Boolean, default: false },
  activePropertyId: { type: String, default: null }
}, { timestamps: true });

// Property Schema with Normalized Address Index
const PropertySchema = new mongoose.Schema({
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  landlordName: { type: String, required: true },
  title: { type: String, required: true },
  address: { type: String, required: true },
  normalizedAddress: { type: String, required: true, unique: true },
  rentAmount: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  currentTenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

// Rental Agreement Schema
const RentalAgreementSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  propertyTitle: { type: String, required: true },
  landlordName: { type: String, required: true },
  tenantName: { type: String, required: true },
  tenantNin: { type: String, required: true },
  rentAmount: { type: Number, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  sha256Hash: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Expired', 'Terminated'], default: 'Active' }
}, { timestamps: true });

// Fraud Alert Log Schema
const FraudAlertSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  offendingUser: { type: String, default: 'Unknown' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = {
  connectDB,
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  Property: mongoose.models.Property || mongoose.model('Property', PropertySchema),
  RentalAgreement: mongoose.models.RentalAgreement || mongoose.model('RentalAgreement', RentalAgreementSchema),
  FraudAlert: mongoose.models.FraudAlert || mongoose.model('FraudAlert', FraudAlertSchema)
};
