require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Department = require('../models/Department');
const Test = require('../models/Test');
const departments = require('./laboratoryCatalog');

const slugify = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const legacyCodes = ['LFT-003', 'LIP-002', 'THY-005', 'VIT-007', 'CBC-001', 'DIA-006', 'KFT-004', 'URN-008'];
const duplicateCatalogueEntries = [
  ['Urine Tests', 'Urine Albumin-to-Creatinine Ratio'],
  ['Urine Tests', '24-Hour Urine Protein'],
  ['Urine Tests', 'Urine Pregnancy Test (hCG)'],
  ['Stool Tests', 'Stool Culture'],
  ['Pregnancy and Fertility Tests', 'Follicle-Stimulating Hormone (FSH)'],
  ['Pregnancy and Fertility Tests', 'Luteinizing Hormone (LH)'],
  ['Pregnancy and Fertility Tests', 'Prolactin'],
  ['Pregnancy and Fertility Tests', 'Progesterone'],
  ['Pregnancy and Fertility Tests', 'Anti-Müllerian Hormone (AMH)'],
  ['Molecular Diagnostics (PCR)', 'Mycobacterium tuberculosis PCR'],
];

const unverifiedFields = {
  description: '',
  price: null,
  discountedPrice: null,
  sampleType: null,
  requiredQuantity: '',
  preparation: '',
  fastingRequired: null,
  fastingHours: null,
  turnaroundHours: null,
  availabilityStatus: 'pending_verification',
  isActive: true,
  popular: false,
  featured: false,
  parameters: [],
};

async function seedCatalog() {
  const testNames = departments.flatMap((department) => department.tests);
  if (new Set(testNames.map((name) => name.toLowerCase())).size !== testNames.length) {
    throw new Error('Catalogue source contains duplicate test names.');
  }

  await connectDB();

  const archivedLegacy = await Test.updateMany(
    { code: { $in: legacyCodes }, isActive: true },
    { $set: { ...unverifiedFields, isActive: false, availabilityStatus: 'unavailable' } }
  );
  const archivedDuplicates = await Test.updateMany(
    {
      isActive: true,
      $or: duplicateCatalogueEntries.map(([department, name]) => ({ department, name })),
    },
    { $set: { ...unverifiedFields, isActive: false, availabilityStatus: 'unavailable' } }
  );

  const entries = departments.flatMap((department) => department.tests.map((name) => {
    const slug = `${department.code.toLowerCase()}-${slugify(name)}`;
    return {
      department,
      name,
      code: `${department.code}-${slugify(name).toUpperCase()}`,
      slug,
    };
  }));
  const codes = entries.map(({ code }) => code);
  const slugs = entries.map(({ slug }) => slug);
  if (new Set(codes).size !== codes.length || new Set(slugs).size !== slugs.length) {
    throw new Error('Catalogue source produces duplicate test codes or slugs.');
  }

  const departmentCodes = departments.map(({ code }) => code);
  const existingDepartments = await Department.find({ code: { $in: departmentCodes } })
    .select('name code description icon').lean();
  const departmentsByCode = new Map(existingDepartments.map((department) => [department.code, department]));
  for (const department of departments) {
    const existing = departmentsByCode.get(department.code);
    const fields = {
      name: department.name,
      description: department.description,
      icon: department.icon,
    };
    if (!existing) {
      await Department.create({ ...fields, code: department.code });
    } else if (
      existing.name !== fields.name
      || existing.description !== fields.description
      || existing.icon !== fields.icon
    ) {
      await Department.updateOne({ _id: existing._id }, { $set: fields });
    }
  }

  const names = entries.map(({ name }) => name);
  const departmentNames = departments.map(({ name }) => name);
  const existingTests = await Test.find({
    name: { $in: names },
    department: { $in: departmentNames },
  }).select('_id name department code slug category').lean();
  const existingByName = new Map(
    existingTests.map((test) => [`${test.department}\u0000${test.name}`, test])
  );

  const existingByCode = await Test.find({ code: { $in: codes } })
    .select('_id name department code').lean();
  const existingIds = new Set(existingTests.map((test) => String(test._id)));
  const codeConflicts = existingByCode.filter((test) => !existingIds.has(String(test._id)));
  if (codeConflicts.length) {
    throw new Error(`Catalogue test code conflicts with existing records: ${codeConflicts.map(({ code }) => code).join(', ')}`);
  }

  let insertedTests = 0;
  const updates = [];
  const inserts = [];
  for (const entry of entries) {
    const existing = existingByName.get(`${entry.department.name}\u0000${entry.name}`);
    const fields = {
      name: entry.name,
      code: entry.code,
      slug: entry.slug,
      category: entry.department.name,
      department: entry.department.name,
    };
    if (existing) {
      if (existing.code !== entry.code || existing.slug !== entry.slug || existing.category !== entry.department.name) {
        updates.push({
          updateOne: {
            filter: { _id: existing._id },
            update: { $set: fields },
          },
        });
      }
    } else {
      inserts.push({
        updateOne: {
          filter: { code: entry.code },
          update: { $setOnInsert: { ...fields, ...unverifiedFields } },
          upsert: true,
        },
      });
    }
  }

  if (updates.length) await Test.bulkWrite(updates, { ordered: false });
  if (inserts.length) {
    const result = await Test.bulkWrite(inserts, { ordered: false });
    insertedTests = result.upsertedCount;
  }

  const [actualDepartments, actualTests, distinctCodeCount] = await Promise.all([
    Department.find({ code: { $in: departmentCodes } }).select('name code').lean(),
    Test.find({ code: { $in: codes } }).select('name code department').lean(),
    Test.distinct('code', { code: { $in: codes } }),
  ]);
  const catalogTestCount = actualTests.length;
  const expectedByCode = new Map(entries.map(({ code, name, department }) => [code, { name, department: department.name }]));
  const incorrectTests = actualTests.filter((test) => {
    const expected = expectedByCode.get(test.code);
    return !expected || expected.name !== test.name || expected.department !== test.department;
  });
  const incorrectDepartments = actualDepartments.filter((department) =>
    departments.find((expected) => expected.code === department.code)?.name !== department.name
  );

  if (
    actualDepartments.length !== departments.length
    || catalogTestCount !== entries.length
    || distinctCodeCount.length !== entries.length
    || incorrectTests.length
    || incorrectDepartments.length
  ) {
    throw new Error('Catalogue verification failed: department/test count, identity, or uniqueness mismatch.');
  }

  console.log(
    `[Catalog seed] Verified ${actualDepartments.length} departments and ${catalogTestCount} unique tests; `
    + `inserted ${insertedTests}, archived ${archivedLegacy.modifiedCount + archivedDuplicates.modifiedCount} legacy duplicates.`
  );
}

seedCatalog()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error(`[Catalog seed] Failed: ${error.message}`);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
