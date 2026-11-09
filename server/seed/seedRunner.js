require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Models
const User = require('../models/User');
const Staff = require('../models/Staff');
const Patient = require('../models/Patient');
const Department = require('../models/Department');
const TestCategory = require('../models/TestCategory');
const Test = require('../models/Test');
const HealthPackage = require('../models/HealthPackage');
const Branch = require('../models/Branch');
const Booking = require('../models/Booking');
const Sample = require('../models/Sample');
const LaboratoryReport = require('../models/LaboratoryReport');
const Invoice = require('../models/Invoice');
const Coupon = require('../models/Coupon');
const Blog = require('../models/Blog');
const FAQ = require('../models/FAQ');
const Review = require('../models/Review');
const SystemSettings = require('../models/SystemSettings');

const getSeedPasswords = () => {
  const passwordNames = [
    'SEED_ADMIN_PASSWORD',
    'SEED_REVIEWER_PASSWORD',
    'SEED_TECHNICIAN_PASSWORD',
    'SEED_RECEPTION_PASSWORD',
  ];

  if (process.env.SEED_DEMO_DATA === 'true') {
    passwordNames.push('SEED_DEMO_PATIENT_PASSWORD');
  }

  const missingOrWeak = passwordNames.filter((name) => {
    const password = process.env[name];
    return typeof password !== 'string' || password.length < 12;
  });

  if (missingOrWeak.length > 0) {
    throw new Error(`Set unique seed passwords of at least 12 characters in server/.env: ${missingOrWeak.join(', ')}`);
  }

  return Object.fromEntries(passwordNames.map((name) => [name, process.env[name]]));
};

const seedDatabase = async () => {
  try {
    const seedPasswords = getSeedPasswords();
    await connectDB();
    console.log('[Seeder] Clearing old records...');

    await Promise.all([
      User.deleteMany({}),
      Staff.deleteMany({}),
      Patient.deleteMany({}),
      Department.deleteMany({}),
      TestCategory.deleteMany({}),
      Test.deleteMany({}),
      HealthPackage.deleteMany({}),
      Branch.deleteMany({}),
      Booking.deleteMany({}),
      Sample.deleteMany({}),
      LaboratoryReport.deleteMany({}),
      Invoice.deleteMany({}),
      Coupon.deleteMany({}),
      Blog.deleteMany({}),
      FAQ.deleteMany({}),
      Review.deleteMany({}),
      SystemSettings.deleteMany({}),
    ]);

    console.log('[Seeder] Seeding System Settings...');
    await SystemSettings.create({
      labName: 'MALAK Lab Science Hub',
      tagline: 'Laboratory testing in Timergara, Lower Dir',
      contactEmail: '',
      contactPhone: '0328 5027351',
      emergencyPhone: '',
      headquarters: {
        address: 'Opposite DHQ Hospital, Main GT Road',
        city: 'Timergara',
        state: 'Lower Dir',
        zipCode: '',
        country: 'Pakistan',
      },
      currency: 'PKR',
      homeCollectionFee: null,
      freeCollectionThreshold: null,
    });

    console.log('[Seeder] Seeding Branches...');
    const branches = await Branch.create([
      {
        name: 'MALAK Lab Science Hub',
        code: 'MALAK-TIM-01',
        address: {
          street: 'Main GT Road',
          area: 'Opposite DHQ Hospital',
          city: 'Timergara',
          state: 'Lower Dir',
          zipCode: '',
        },
        phone: '0328 5027351',
        emergencyPhone: '0328 5027351',
        email: '',
        services: ['HbA1c by HPLC (GH900 Plus)', 'Hormones by CLIA (CL900i)', 'ABG analysis (Siemens analyzer)', 'Quality control'],
        isNablAccredited: false,
      }
    ]);

    console.log('[Seeder] Seeding Departments & Categories...');
    const departments = await Department.create([
      { name: 'Hematology', code: 'HEM', description: 'Complete Blood Cell Counts, Coagulation Profiles & Blood Smears', icon: 'Droplets' },
      { name: 'Biochemistry', code: 'BIO', description: 'Metabolic Profiles, Liver, Kidney & Cardiac Enzymes', icon: 'Activity' },
      { name: 'Endocrinology & Immunology', code: 'END', description: 'Hormones, Thyroid, Vitamin and Antibody Assays', icon: 'ShieldCheck' },
      { name: 'Microbiology & Serology', code: 'MIC', description: 'Cultures, Bacterial Identification, Antimicrobial Susceptibility', icon: 'Microscope' },
      { name: 'Clinical Pathology & Urinalysis', code: 'PAT', description: 'Urine, Stool, Body Fluids and Microscopic Examination', icon: 'FlaskConical' },
    ]);

    const categories = await TestCategory.create([
      { name: 'Blood Tests', slug: 'blood-tests', description: 'Complete hemograms, blood cell morphologies and coagulation panels', displayOrder: 1 },
      { name: 'Diabetes Tests', slug: 'diabetes-tests', description: 'Fasting glucose, Post-prandial blood sugar, HbA1c glycated hemoglobin', displayOrder: 2 },
      { name: 'Thyroid Tests', slug: 'thyroid-tests', description: 'Total T3, Total T4, and Ultra-sensitive TSH assays', displayOrder: 3 },
      { name: 'Liver Function Tests', slug: 'liver-function-tests', description: 'Bilirubin, SGOT/AST, SGPT/ALT, Alkaline Phosphatase, Protein Albumin', displayOrder: 4 },
      { name: 'Kidney Function Tests', slug: 'kidney-function-tests', description: 'Serum Creatinine, Blood Urea Nitrogen, Uric Acid, eGFR', displayOrder: 5 },
      { name: 'Cardiac Tests', slug: 'cardiac-tests', description: 'Lipid profile, High-sensitivity Troponin, hs-CRP, Homocysteine', displayOrder: 6 },
      { name: 'Vitamin Tests', slug: 'vitamin-tests', description: 'Vitamin D 25-Hydroxy, Vitamin B12 Cyanocobalamin, Folic Acid', displayOrder: 7 },
      { name: 'Urine Tests', slug: 'urine-tests', description: 'Routine Urinalysis, Urine Microalbumin, 24-hr urinary protein', displayOrder: 8 },
      { name: 'Microbiology', slug: 'microbiology', description: 'Bacterial and Fungal culture, Rapid Antigen screens', displayOrder: 9 },
      { name: 'Pathology', slug: 'pathology', description: 'Cytopathology, Histopathological biopsic examinations', displayOrder: 10 },
    ]);

    console.log('[Seeder] Seeding Medical Tests...');
    const testCBC = await Test.create({
      name: 'Complete Blood Count (CBC) with Differential',
      code: 'CBC-001',
      slug: 'complete-blood-count-cbc',
      description: 'Comprehensive quantitative analysis of red blood cells, white blood cells, platelets, and automated 5-part differential.',
      category: 'Blood Tests',
      department: 'Hematology',
      price: 35,
      discountedPrice: 28,
      sampleType: 'Blood (Whole/EDTA)',
      requiredQuantity: '3 mL',
      preparation: 'No fasting required. Maintain hydration.',
      fastingRequired: false,
      turnaroundHours: 12,
      popular: true,
      featured: true,
      availableBranches: [branches[0]._id],
      parameters: [
        { parameterName: 'Hemoglobin (Hb)', unit: 'g/dL', referenceRange: '13.0 - 17.0', maleRange: '13.8 - 17.2', femaleRange: '12.1 - 15.1' },
        { parameterName: 'Total Leukocyte Count (WBC)', unit: 'x10^3/uL', referenceRange: '4.5 - 11.0' },
        { parameterName: 'RBC Count', unit: 'mil/uL', referenceRange: '4.5 - 5.9', maleRange: '4.7 - 6.1', femaleRange: '4.2 - 5.4' },
        { parameterName: 'Packed Cell Volume (PCV / Hematocrit)', unit: '%', referenceRange: '40.0 - 50.0' },
        { parameterName: 'Mean Corpuscular Volume (MCV)', unit: 'fL', referenceRange: '80.0 - 100.0' },
        { parameterName: 'Platelet Count', unit: 'x10^3/uL', referenceRange: '150 - 450' },
        { parameterName: 'Neutrophils', unit: '%', referenceRange: '40 - 75' },
        { parameterName: 'Lymphocytes', unit: '%', referenceRange: '20 - 45' },
        { parameterName: 'Monocytes', unit: '%', referenceRange: '2 - 10' },
        { parameterName: 'Eosinophils', unit: '%', referenceRange: '1 - 6' },
      ],
    });

    const testLipid = await Test.create({
      name: 'Comprehensive Lipid Profile',
      code: 'LIP-002',
      slug: 'comprehensive-lipid-profile',
      description: 'Cardiovascular risk evaluation measuring circulating cholesterol, triglycerides, HDL (good cholesterol), and calculated LDL/VLDL fractions.',
      category: 'Cardiac Tests',
      department: 'Biochemistry',
      price: 45,
      discountedPrice: 36,
      sampleType: 'Blood (Serum)',
      requiredQuantity: '4 mL',
      preparation: 'Requires 10 to 12 hours overnight fasting. Water permitted.',
      fastingRequired: true,
      fastingHours: 12,
      turnaroundHours: 18,
      popular: true,
      featured: true,
      availableBranches: [branches[0]._id],
      parameters: [
        { parameterName: 'Total Cholesterol', unit: 'mg/dL', referenceRange: '< 200 (Desirable)' },
        { parameterName: 'Triglycerides', unit: 'mg/dL', referenceRange: '< 150 (Normal)' },
        { parameterName: 'HDL Cholesterol (High-Density)', unit: 'mg/dL', referenceRange: '> 40 (Optimal: > 60)' },
        { parameterName: 'LDL Cholesterol (Calculated)', unit: 'mg/dL', referenceRange: '< 100 (Optimal)' },
        { parameterName: 'VLDL Cholesterol', unit: 'mg/dL', referenceRange: '5 - 30' },
        { parameterName: 'Total Chol / HDL Ratio', unit: 'ratio', referenceRange: '< 4.5' },
      ],
    });

    const testLFT = await Test.create({
      name: 'Liver Function Test (LFT) Comprehensive',
      code: 'LFT-003',
      slug: 'liver-function-test-lft',
      description: 'Biochemical assessment of hepatic enzymes, protein synthesis, and biliary excretory functions.',
      category: 'Liver Function Tests',
      department: 'Biochemistry',
      price: 50,
      discountedPrice: 40,
      sampleType: 'Blood (Serum)',
      requiredQuantity: '4 mL',
      preparation: '8 hours fasting recommended. Avoid alcohol 24 hours prior.',
      fastingRequired: true,
      fastingHours: 8,
      turnaroundHours: 18,
      popular: true,
      featured: true,
      availableBranches: [branches[0]._id],
      parameters: [
        { parameterName: 'Bilirubin Total', unit: 'mg/dL', referenceRange: '0.2 - 1.2' },
        { parameterName: 'Bilirubin Direct (Conjugated)', unit: 'mg/dL', referenceRange: '0.0 - 0.3' },
        { parameterName: 'SGOT / AST (Aspartate Aminotransferase)', unit: 'U/L', referenceRange: '10 - 40' },
        { parameterName: 'SGPT / ALT (Alanine Aminotransferase)', unit: 'U/L', referenceRange: '7 - 56' },
        { parameterName: 'Alkaline Phosphatase (ALP)', unit: 'U/L', referenceRange: '44 - 147' },
        { parameterName: 'Total Protein', unit: 'g/dL', referenceRange: '6.4 - 8.3' },
        { parameterName: 'Albumin', unit: 'g/dL', referenceRange: '3.5 - 5.0' },
        { parameterName: 'A/G Ratio', unit: 'ratio', referenceRange: '1.2 - 2.2' },
      ],
    });

    const testKFT = await Test.create({
      name: 'Kidney Function Test (KFT / RFT) with eGFR',
      code: 'KFT-004',
      slug: 'kidney-function-test-kft',
      description: 'Measures nitrogenous waste clearance, electrolytes, and estimated glomerular filtration rate.',
      category: 'Kidney Function Tests',
      department: 'Biochemistry',
      price: 48,
      discountedPrice: 38,
      sampleType: 'Blood (Serum)',
      requiredQuantity: '4 mL',
      preparation: 'Stay normally hydrated. Avoid intense muscular exertion on day of test.',
      fastingRequired: false,
      turnaroundHours: 16,
      popular: true,
      featured: false,
      availableBranches: [branches[0]._id],
      parameters: [
        { parameterName: 'Blood Urea Nitrogen (BUN)', unit: 'mg/dL', referenceRange: '7 - 20' },
        { parameterName: 'Serum Creatinine', unit: 'mg/dL', referenceRange: '0.7 - 1.3', maleRange: '0.7 - 1.3', femaleRange: '0.6 - 1.1' },
        { parameterName: 'eGFR (CKD-EPI Formula)', unit: 'mL/min/1.73m2', referenceRange: '> 90 (Normal Kidney Function)' },
        { parameterName: 'Serum Uric Acid', unit: 'mg/dL', referenceRange: '3.5 - 7.2' },
        { parameterName: 'Serum Electrolytes - Sodium', unit: 'mEq/L', referenceRange: '136 - 145' },
        { parameterName: 'Serum Electrolytes - Potassium', unit: 'mEq/L', referenceRange: '3.5 - 5.1' },
      ],
    });

    const testThyroid = await Test.create({
      name: 'Thyroid Profile Comprehensive (T3, T4, TSH)',
      code: 'THY-005',
      slug: 'thyroid-profile-t3-t4-tsh',
      description: 'Chemiluminescent immunoassay for diagnosing hypothyroidism, hyperthyroidism, and metabolic endocrine status.',
      category: 'Thyroid Tests',
      department: 'Endocrinology & Immunology',
      price: 42,
      discountedPrice: 32,
      sampleType: 'Blood (Serum)',
      requiredQuantity: '3 mL',
      preparation: 'Early morning fasting collection recommended before any thyroid hormone replacement dose.',
      fastingRequired: true,
      fastingHours: 8,
      turnaroundHours: 24,
      popular: true,
      featured: true,
      availableBranches: [branches[0]._id],
      parameters: [
        { parameterName: 'Total Triiodothyronine (T3)', unit: 'ng/dL', referenceRange: '80 - 200' },
        { parameterName: 'Total Thyroxine (T4)', unit: 'ug/dL', referenceRange: '5.1 - 14.1' },
        { parameterName: 'Thyroid Stimulating Hormone (TSH 3rd Gen)', unit: 'uIU/mL', referenceRange: '0.45 - 4.50' },
      ],
    });

    const testHbA1c = await Test.create({
      name: 'HbA1c Glycated Hemoglobin with Average Blood Glucose',
      code: 'DIA-006',
      slug: 'hba1c-glycated-hemoglobin',
      description: 'Gold-standard monitoring index representing mean glycemic regulation over preceding 90 days via HPLC methodology.',
      category: 'Diabetes Tests',
      department: 'Biochemistry',
      price: 38,
      discountedPrice: 30,
      sampleType: 'Blood (Whole/EDTA)',
      requiredQuantity: '2 mL',
      preparation: 'Fasting not strictly required. Can be combined with Fasting Blood Glucose.',
      fastingRequired: false,
      turnaroundHours: 12,
      popular: true,
      featured: true,
      availableBranches: [branches[0]._id],
      parameters: [
        { parameterName: 'HbA1c Glycated Hemoglobin', unit: '%', referenceRange: '< 5.7 (Normal), 5.7-6.4 (Prediabetes), >= 6.5 (Diabetes)' },
        { parameterName: 'Estimated Average Glucose (eAG)', unit: 'mg/dL', referenceRange: '70 - 126' },
      ],
    });

    const testVitaminD = await Test.create({
      name: 'Vitamin D 25-Hydroxy (Total D2 + D3)',
      code: 'VIT-007',
      slug: 'vitamin-d-25-hydroxy',
      description: 'Quantitative measurement of 25-OH Vitamin D for bone density evaluation, calcium absorption, and immune competence.',
      category: 'Vitamin Tests',
      department: 'Endocrinology & Immunology',
      price: 55,
      discountedPrice: 44,
      sampleType: 'Blood (Serum)',
      requiredQuantity: '3 mL',
      preparation: 'No fasting required. Maintain regular medication.',
      fastingRequired: false,
      turnaroundHours: 24,
      popular: true,
      featured: false,
      availableBranches: [branches[0]._id],
      parameters: [
        { parameterName: '25-Hydroxy Vitamin D', unit: 'ng/mL', referenceRange: '< 20 (Deficient), 20-29 (Insufficient), 30-100 (Optimal)' },
      ],
    });

    const testUrine = await Test.create({
      name: 'Complete Urinalysis (Physical, Chemical & Microscopic)',
      code: 'URN-008',
      slug: 'complete-urinalysis',
      description: 'Standard clinical screening for urinary tract infections, renal parenchymal diseases, hematuria, and metabolic disorders.',
      category: 'Urine Tests',
      department: 'Clinical Pathology & Urinalysis',
      price: 25,
      discountedPrice: 20,
      sampleType: 'Urine',
      requiredQuantity: '15-20 mL Mid-stream clean catch',
      preparation: 'Collect early morning first-void clean catch urine in sterile container provided.',
      fastingRequired: false,
      turnaroundHours: 8,
      popular: true,
      featured: false,
      availableBranches: [branches[0]._id],
      parameters: [
        { parameterName: 'Color & Appearance', unit: 'visual', referenceRange: 'Pale Yellow / Clear' },
        { parameterName: 'Specific Gravity', unit: 'ratio', referenceRange: '1.005 - 1.030' },
        { parameterName: 'pH', unit: 'pH units', referenceRange: '5.0 - 7.5' },
        { parameterName: 'Protein / Albumin', unit: 'dipstick', referenceRange: 'Negative' },
        { parameterName: 'Glucose', unit: 'dipstick', referenceRange: 'Negative' },
        { parameterName: 'Ketones', unit: 'dipstick', referenceRange: 'Negative' },
        { parameterName: 'Pus Cells (Leukocytes)', unit: '/HPF', referenceRange: '0 - 5' },
        { parameterName: 'RBCs (Erythrocytes)', unit: '/HPF', referenceRange: '0 - 2' },
        { parameterName: 'Epithelial Cells', unit: '/HPF', referenceRange: 'Occasional (1 - 4)' },
        { parameterName: 'Bacteria / Casts', unit: 'microscopic', referenceRange: 'Nil seen' },
      ],
    });

    console.log('[Seeder] Seeding Health Packages...');
    await HealthPackage.create([
      {
        name: 'Apex Master Executive Health Package',
        slug: 'apex-master-executive-health-package',
        code: 'PKG-MST-101',
        tagline: '85 Vital Parameters across 8 Major Body Systems',
        description: 'Our most comprehensive preventive health assessment including complete hemogram, liver, kidney, cardiac lipid profile, thyroid panel, diabetes screening, and urinalysis.',
        testsIncluded: [testCBC._id, testLipid._id, testLFT._id, testKFT._id, testThyroid._id, testHbA1c._id, testVitaminD._id, testUrine._id],
        testCount: 8,
        originalPrice: 340,
        packagePrice: 169,
        discountPercentage: 50,
        sampleTypes: ['Blood (Serum & Whole EDTA)', 'Urine (Clean-Catch)'],
        fastingRequirements: '10-12 hours overnight fasting mandatory. Water intake encouraged.',
        targetDemographic: 'All Adults (Ages 25 to 70)',
        popular: true,
        featured: true,
      },
      {
        name: 'Advanced Diabetes & Cardiac Wellness Panel',
        slug: 'advanced-diabetes-cardiac-wellness-panel',
        code: 'PKG-DIA-102',
        tagline: 'Focused Cardiometabolic & Endocrine Screening',
        description: 'Engineered specifically for individuals managing diabetes, prediabetes, or family history of cardiovascular disease.',
        testsIncluded: [testHbA1c._id, testLipid._id, testKFT._id, testCBC._id, testUrine._id],
        testCount: 5,
        originalPrice: 191,
        packagePrice: 99,
        discountPercentage: 48,
        sampleTypes: ['Blood (Serum & EDTA)', 'Urine'],
        fastingRequirements: '10 hours overnight fasting required.',
        targetDemographic: 'Individuals with Diabetes or Heart Disease Risk',
        popular: true,
        featured: true,
      },
      {
        name: 'Essential Vital Checkup Package',
        slug: 'essential-vital-checkup-package',
        code: 'PKG-ESS-103',
        tagline: 'Routine Wellness Check for Active Lifestyles',
        description: 'Core blood metrics and biochemical function screen to evaluate stamina, immune defense, and general physiological equilibrium.',
        testsIncluded: [testCBC._id, testLipid._id, testKFT._id, testThyroid._id],
        testCount: 4,
        originalPrice: 170,
        packagePrice: 85,
        discountPercentage: 50,
        sampleTypes: ['Blood (Serum & EDTA)'],
        fastingRequirements: 'Overnight fasting of 8-10 hours.',
        targetDemographic: 'Young Professionals & Students',
        popular: false,
        featured: true,
      }
    ]);

    console.log('[Seeder] Seeding Users & Staff Accounts...');
    // 1. Admin
    const adminUser = await User.create({
      name: 'MALAK Lab Administrator',
      email: 'admin@malaklab.test',
      password: seedPasswords.SEED_ADMIN_PASSWORD,
      role: 'admin',
      phone: '0328 5027351',
    });
    await Staff.create({
      userId: adminUser._id,
      employeeId: 'EMP-ADM-001',
      department: 'Laboratory Administration',
      designation: 'Laboratory Administrator',
      assignedBranch: branches[0]._id,
    });

    // 2. Pathologist
    const pathUser = await User.create({
      name: 'MALAK Lab Reviewer',
      email: 'reviewer@malaklab.test',
      password: seedPasswords.SEED_REVIEWER_PASSWORD,
      role: 'pathologist',
      phone: '0328 5027351',
    });
    await Staff.create({
      userId: pathUser._id,
      employeeId: 'EMP-PAT-002',
      department: 'Biochemistry',
      designation: 'Laboratory Reviewer',
      assignedBranch: branches[0]._id,
    });

    // 3. Technician
    const techUser = await User.create({
      name: 'MALAK Lab Technician',
      email: 'technician@malaklab.test',
      password: seedPasswords.SEED_TECHNICIAN_PASSWORD,
      role: 'technician',
      phone: '0328 5027351',
    });
    await Staff.create({
      userId: techUser._id,
      employeeId: 'EMP-TCH-003',
      department: 'Hematology',
      designation: 'Laboratory Technician',
      assignedBranch: branches[0]._id,
    });

    // 4. Receptionist
    const recepUser = await User.create({
      name: 'MALAK Lab Front Desk',
      email: 'reception@malaklab.test',
      password: seedPasswords.SEED_RECEPTION_PASSWORD,
      role: 'receptionist',
      phone: '0328 5027351',
    });
    await Staff.create({
      userId: recepUser._id,
      employeeId: 'EMP-REC-004',
      department: 'Patient Services',
      designation: 'Patient Care & Appointment Coordinator',
      assignedBranch: branches[0]._id,
    });

    if (process.env.SEED_DEMO_DATA === 'true') {
      console.log('[Seeder] Seeding optional demo patient, booking, sample and report data...');
      // 5. Demo customer / patient
      const customerUser = await User.create({
      name: 'Johnathan Doe',
      email: 'patient@apexlab.com',
      password: seedPasswords.SEED_DEMO_PATIENT_PASSWORD,
      role: 'customer',
      phone: '+1 (555) 234-5678',
      addresses: [{
        label: 'Home Residence',
        street: '742 Evergreen Terrace, Apt 4B',
        city: 'Metropolis',
        state: 'NY',
        zipCode: '10021',
        isDefault: true,
      }],
    });

    const patientRecord = await Patient.create({
      userId: customerUser._id,
      fullName: 'Johnathan Doe',
      age: 38,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+1 (555) 234-5678',
      email: 'patient@apexlab.com',
      address: {
        street: '742 Evergreen Terrace, Apt 4B',
        city: 'Metropolis',
        state: 'NY',
        zipCode: '10021',
      },
      medicalHistory: ['Mild Hypertension', 'Occasional Seasonal Allergies'],
      allergies: ['Penicillin'],
    });

      const demoBooking = await Booking.create({
      bookingId: 'LMS-2026-88124',
      customerId: customerUser._id,
      patientDetails: {
        fullName: 'Johnathan Doe',
        age: 38,
        gender: 'Male',
        phone: '+1 (555) 234-5678',
        email: 'patient@apexlab.com',
        address: {
          street: '742 Evergreen Terrace, Apt 4B',
          city: 'Metropolis',
          state: 'NY',
          zipCode: '10021',
        }
      },
      collectionType: 'home_collection',
      branchId: branches[0]._id,
      appointmentDate: new Date(),
      timeSlot: '07:30 AM - 08:30 AM (Fasting)',
      items: [
        {
          itemType: 'test',
          itemId: testCBC._id,
          itemName: testCBC.name,
          itemCode: testCBC.code,
          price: testCBC.discountedPrice || testCBC.price,
        },
        {
          itemType: 'test',
          itemId: testLipid._id,
          itemName: testLipid.name,
          itemCode: testLipid.code,
          price: testLipid.discountedPrice || testLipid.price,
        }
      ],
      subtotal: 64,
      homeCollectionFee: 0,
      discountAmount: 10,
      couponCode: 'WELCOME20',
      totalAmount: 69,
      paymentStatus: 'paid',
      paymentMethod: 'online',
      transactionId: 'TXN_DEMO_2026_9941',
      bookingStatus: 'completed',
      specialInstructions: 'Ring doorbell twice. Patient will be ready with morning fasting.',
    });

    // Create Sample for Demo Booking
    const demoSample = await Sample.create({
      sampleId: 'SMP-841920',
      barcode: 'BC990218412',
      bookingId: demoBooking._id,
      bookingCode: demoBooking.bookingId,
      testIds: [testCBC._id, testLipid._id],
      sampleType: 'Blood (Whole EDTA & Serum)',
      tubeColor: 'Lavender (EDTA) & Gold (SST)',
      currentStage: 'Report Published',
      collectedAt: new Date(Date.now() - 3600000 * 24),
      collectorName: 'David Miller',
      receivedAtLab: new Date(Date.now() - 3600000 * 22),
      statusHistory: [
        { stage: 'Booking Confirmed', timestamp: new Date(Date.now() - 3600000 * 26), location: 'Appointment Portal', remarks: 'Booking scheduled & pre-paid' },
        { stage: 'Sample Collection Scheduled', timestamp: new Date(Date.now() - 3600000 * 25), location: 'Dispatch Logistics', remarks: 'Assigned to Phlebotomist David Miller' },
        { stage: 'Sample Collected', timestamp: new Date(Date.now() - 3600000 * 24), location: 'Patient Residence', remarks: 'Blood drawn with 21G vacutainer needle' },
        { stage: 'Sample Received', timestamp: new Date(Date.now() - 3600000 * 22), location: 'MALAK Lab Science Hub, Timergara', remarks: 'Sample received for processing' },
        { stage: 'Testing in Progress', timestamp: new Date(Date.now() - 3600000 * 18), location: 'Automated Hematology Analyzer Sysmex XN-1000', remarks: 'Assays run in duplicate with QC verified' },
        { stage: 'Report Under Review', timestamp: new Date(Date.now() - 3600000 * 10), location: 'Clinical Pathology Desk', remarks: 'Technologist submitted values for pathologist sign-off' },
        { stage: 'Report Approved', timestamp: new Date(Date.now() - 3600000 * 4), location: 'Central Laboratory Office', remarks: 'Certified by Dr. Eleanor Vance, MD Pathology' },
        { stage: 'Report Published', timestamp: new Date(Date.now() - 3600000 * 2), location: 'Secure Patient Cloud', remarks: 'Published and delivered electronically to patient account' },
      ],
    });

    // Create Published Laboratory Report
    await LaboratoryReport.create({
      reportId: 'REP-2026-94021',
      bookingId: demoBooking._id,
      bookingCode: demoBooking.bookingId,
      patientId: patientRecord._id,
      patientInfo: {
        fullName: 'Johnathan Doe',
        age: 38,
        gender: 'Male',
        phone: '+1 (555) 234-5678',
        email: 'patient@apexlab.com',
        address: '742 Evergreen Terrace, Apt 4B, Metropolis, NY',
      },
      testId: testCBC._id,
      testName: testCBC.name,
      testCategory: testCBC.category,
      department: testCBC.department,
      sampleId: demoSample._id,
      sampleCode: demoSample.sampleId,
      sampleType: 'Blood (Whole/EDTA)',
      collectedAt: new Date(Date.now() - 3600000 * 24),
      receivedAt: new Date(Date.now() - 3600000 * 22),
      reportedAt: new Date(),
      technicianName: 'David Miller, MLS (ASCP)',
      pathologistName: 'Dr. Eleanor Vance, MD, FCAP',
      pathologistQualifications: 'Consultant Clinical Pathologist, License #NMC-PAT-77291',
      results: [
        { parameterName: 'Hemoglobin (Hb)', resultValue: '14.8', unit: 'g/dL', referenceRange: '13.0 - 17.0', flag: 'Normal' },
        { parameterName: 'Total Leukocyte Count (WBC)', resultValue: '6.4', unit: 'x10^3/uL', referenceRange: '4.5 - 11.0', flag: 'Normal' },
        { parameterName: 'RBC Count', resultValue: '4.95', unit: 'mil/uL', referenceRange: '4.5 - 5.9', flag: 'Normal' },
        { parameterName: 'Packed Cell Volume (PCV)', resultValue: '44.2', unit: '%', referenceRange: '40.0 - 50.0', flag: 'Normal' },
        { parameterName: 'Mean Corpuscular Volume (MCV)', resultValue: '89.3', unit: 'fL', referenceRange: '80.0 - 100.0', flag: 'Normal' },
        { parameterName: 'Platelet Count', resultValue: '280', unit: 'x10^3/uL', referenceRange: '150 - 450', flag: 'Normal' },
        { parameterName: 'Neutrophils', resultValue: '58', unit: '%', referenceRange: '40 - 75', flag: 'Normal' },
        { parameterName: 'Lymphocytes', resultValue: '32', unit: '%', referenceRange: '20 - 45', flag: 'Normal' },
        { parameterName: 'Monocytes', resultValue: '6', unit: '%', referenceRange: '2 - 10', flag: 'Normal' },
        { parameterName: 'Eosinophils', resultValue: '4', unit: '%', referenceRange: '1 - 6', flag: 'Normal' },
      ],
      clinicalImpression: 'Complete blood count indices are within biological reference limits. Normal peripheral erythrocyte morphology and normocytic normochromic red cells.',
      overallRemarks: 'Kindly correlate with clinical status. Repeat testing recommended annually for preventive evaluation.',
      status: 'published',
      approvedAt: new Date(Date.now() - 3600000 * 4),
      publishedAt: new Date(Date.now() - 3600000 * 2),
      auditHistory: [
        { action: 'REPORT_INITIALIZED', modifierName: 'David Miller', modifierRole: 'technician', changesSummary: 'Accessioned specimen' },
        { action: 'RESULTS_ENTERED', modifierName: 'David Miller', modifierRole: 'technician', changesSummary: 'Recorded Sysmex automated hemogram parameters' },
        { action: 'SUBMITTED_FOR_REVIEW', modifierName: 'David Miller', modifierRole: 'technician', changesSummary: 'Dispatched to Pathologist for verification' },
        { action: 'REPORT_APPROVED', modifierName: 'Dr. Eleanor Vance', modifierRole: 'pathologist', changesSummary: 'Verified against calibration standards and signed' },
        { action: 'REPORT_PUBLISHED', modifierName: 'Dr. Eleanor Vance', modifierRole: 'pathologist', changesSummary: 'Electronic certificate generated & published' },
      ],
    });

    // Create Demo Invoice
    await Invoice.create({
      invoiceNumber: 'INV-2026-77892',
      bookingId: demoBooking._id,
      bookingCode: demoBooking.bookingId,
      customerId: customerUser._id,
      customerName: 'Johnathan Doe',
      customerEmail: 'patient@apexlab.com',
      customerPhone: '+1 (555) 234-5678',
      items: [
        { description: testCBC.name, unitPrice: 28, quantity: 1, total: 28 },
        { description: testLipid.name, unitPrice: 36, quantity: 1, total: 36 },
      ],
      subtotal: 64,
      homeCollectionFee: 0,
      discount: 10,
      grandTotal: 69,
      paymentStatus: 'paid',
      paymentMethod: 'online',
      transactionId: 'TXN_DEMO_2026_9941',
    });

      console.log('[Seeder] Seeding demo coupons...');
      await Coupon.create([
      { code: 'WELCOME20', title: 'Welcome New Patient - $20 Off', discountType: 'flat', discountValue: 20, minBookingAmount: 50, validUntil: new Date('2027-12-31') },
      { code: 'HEALTH50', title: 'Executive Health Check - 50% Off Packages', discountType: 'percentage', discountValue: 50, minBookingAmount: 100, maxDiscount: 80, validUntil: new Date('2027-12-31') },
      { code: 'APEX10', title: 'Instant 10% Discount on All Blood Tests', discountType: 'percentage', discountValue: 10, minBookingAmount: 30, maxDiscount: 25, validUntil: new Date('2027-12-31') },
      ]);
    }

    console.log('[Seeder] Seeding Blogs...');
    await Blog.create([
      {
        title: 'Decoding Your Lipid Panel: Understanding HDL, LDL and Triglyceride Ratios',
        slug: 'decoding-your-lipid-panel-hdl-ldl-triglycerides',
        excerpt: 'Learn what your cholesterol numbers really indicate about cardiovascular arterial health and how fasting impacts test accuracy.',
        content: `Cholesterol is a lipid substance synthesized by the liver and absorbed from dietary sources. While lipid molecules are essential for cell membranes and steroid hormone production, disproportionate circulating low-density lipoproteins (LDL) oxidize and lead to atherosclerotic plaque accumulation.

When evaluating a standard lipid panel, clinicians look closely at:
1. **Total Cholesterol**: The cumulative measure of cholesterol circulating in your bloodstream. Optimal level is below 200 mg/dL.
2. **High-Density Lipoprotein (HDL)**: Known colloquially as 'good cholesterol', HDL scavenges excess cholesterol from peripheral vasculature and transports it back to the liver for metabolic excretion.
3. **Low-Density Lipoprotein (LDL)**: Often termed 'bad cholesterol', optimal levels should remain under 100 mg/dL, or under 70 mg/dL for individuals with diabetes or established cardiovascular risk.
4. **Triglycerides**: The chemical form in which most fat exists in food as well as in the body. Excess carbohydrates and sugars are swiftly converted to triglycerides. Levels exceeding 150 mg/dL signal metabolic strain.

Preparing for your test: 10 to 12 hours of overnight water-only fasting is critical to allow chylomicron clearance and prevent postprandial triglyceride spikes.`,
        category: 'Cardiovascular Health',
        tags: ['Cholesterol', 'Heart Health', 'Lipid Panel', 'Fasting Instructions'],
        readTime: '6 min read',
        author: { name: 'Dr. Eleanor Vance, MD', role: 'Consultant Clinical Pathologist' },
      },
      {
        title: 'The Vital Role of Annual Complete Blood Count (CBC) in Preventive Medicine',
        slug: 'vital-role-of-annual-complete-blood-count-cbc',
        excerpt: 'How a simple, routine blood draw can detect occult anemia, chronic inflammation, immune dysfunction, and platelet abnormalities early.',
        content: `A Complete Blood Count (CBC) remains the single most informative and versatile laboratory test in modern diagnostic medicine. Within a few cubic millimeters of whole blood, automated laser flow cytometry analyzes millions of cellular elements across three essential hematopoietic lineages: erythrocytes (red cells), leukocytes (white cells), and thrombocytes (platelets).

Subtle shifts in mean corpuscular volume (MCV) can indicate early Vitamin B12 or folate deficiency before overt anemia manifests. Similarly, mild lymphopenia or neutrophilic leukocytosis offers critical diagnostic clues during unexplained fatigue or recurrent infections.`,
        category: 'Preventive Healthcare',
        tags: ['CBC', 'Hematology', 'Immunity', 'Anemia'],
        readTime: '4 min read',
        author: { name: 'David Miller, MLS', role: 'Senior Laboratory Technologist' },
      },
      {
        title: 'Fasting vs Non-Fasting Blood Tests: Essential Patient Preparation Guidelines',
        slug: 'fasting-vs-non-fasting-blood-tests-guidelines',
        excerpt: 'Avoid incorrect readings or cancelled appointments by knowing exactly when to fast, what you can drink, and medication rules.',
        content: `Accurate laboratory findings depend heavily on pre-analytical fidelity. Consuming a breakfast rich in simple carbohydrates prior to a Fasting Blood Glucose (FBG) test can lead to false-positive diabetes diagnoses.

Key guidelines:
- Water is not only permitted during fasting; it is actively recommended. Dehydration hemoconcentrates serum proteins and makes venipuncture significantly more difficult.
- Black coffee, teas, juices, and smoking alter hepatic enzyme induction and should be strictly avoided during fasting windows.
- Always disclose chronic prescription medications such as thyroid hormone or insulin to your phlebotomist before collection.`,
        category: 'Laboratory Guidance',
        tags: ['Fasting', 'Patient Guide', 'Phlebotomy', 'Accuracy'],
        readTime: '5 min read',
        author: { name: 'Dr. Gregory Sterling, MD', role: 'Laboratory Director' },
      }
    ]);

    console.log('[Seeder] Seeding FAQs...');
    await FAQ.create([
      {
        question: 'How do I book a Home Sample Collection appointment?',
        answer: 'You can book home collection directly online via our "Book a Test" wizard or "Home Sample Collection" page. Simply select your required tests, choose "Home Collection", specify your address, and pick a preferred 1-hour morning or afternoon slot. A certified, vaccinated phlebotomist will arrive equipped with sterile single-use vacuum collection tubes.',
        category: 'Sample Collection',
        order: 1,
      },
      {
        question: 'How quickly will my laboratory reports be available?',
        answer: 'Most routine blood tests (such as CBC, Blood Glucose, and Urinalysis) are completed within 8 to 12 hours. Comprehensive panels (like Lipid Profile, Thyroid, Liver & Kidney Function) are reported within 18 to 24 hours. You will receive an instant email and SMS alert with a secure portal download link the moment our pathologist signs off your report.',
        category: 'Reports & Results',
        order: 2,
      },
      {
        question: 'How do I track the live status of my collected sample?',
        answer: 'Every appointment generates a unique Booking ID (e.g., LMS-2026-88124) and Sample Barcode. You can enter this code in the "Track Report" tab at the top of the website or visit your Customer Portal to watch your sample progress across all 8 stages—from collection and accessioning to pathologist review and final certification.',
        category: 'Reports & Results',
        order: 3,
      },
      {
        question: 'What are the rules for fasting tests?',
        answer: 'For tests requiring fasting (such as Fasting Blood Sugar, Lipid Profiles, and Master Health Packages), you should fast for 10 to 12 hours prior to collection. Plain water is allowed and encouraged to ensure comfortable blood collection. Do not drink milk, tea, coffee, sodas, or juices.',
        category: 'Booking & Appointments',
        order: 4,
      },
      {
        question: 'Which analyzer systems are used at MALAK Lab?',
        answer: 'The laboratory offers HbA1c testing by HPLC on a GH900 Plus, hormone testing by CLIA on a CL900i, and ABG analysis using a Siemens analyzer. Tests are run with quality control.',
        category: 'General',
        order: 5,
      },
      {
        question: 'Can I reschedule or cancel my booking?',
        answer: 'Yes, you can easily reschedule your appointment date and time or cancel an eligible booking through your Customer Dashboard up to 4 hours before the scheduled appointment slot without any cancellation penalty.',
        category: 'Booking & Appointments',
        order: 6,
      }
    ]);

    console.log('[Seeder] Seeding Patient Reviews...');
    await Review.create([]);

    console.log('===========================================================');
    console.log('  MALAK Lab Science Hub database seeded successfully.       ');
    console.log('===========================================================');
    console.log('  Admin User:       admin@malaklab.test');
    console.log('  Reviewer:         reviewer@malaklab.test');
    console.log('  Technician:       technician@malaklab.test');
    console.log('  Reception:        reception@malaklab.test');
    console.log('  Use the passwords configured in server/.env. Passwords are not printed.');
    if (process.env.SEED_DEMO_DATA === 'true') {
      console.log('  Optional demo data was enabled through SEED_DEMO_DATA.');
    }
    console.log('===========================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Failed]:', error);
    process.exit(1);
  }
};

seedDatabase();
