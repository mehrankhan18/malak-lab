const Counter = require('../models/Counter');

const nextSequence = async ({ key, Model, field, prefix = '', padding = 6 }) => {
  let counter = await Counter.findById(key);
  if (!counter) {
    const filter = prefix
      ? { [field]: { $regex: `^${prefix}\\d+$` } }
      : { [field]: { $regex: '^\\d+$' } };
    const latest = await Model.findOne(filter).select(field).sort({ [field]: -1 }).lean();
    const latestValue = Number(String(latest?.[field] || '').slice(prefix.length)) || 0;

    try {
      counter = await Counter.create({ _id: key, value: latestValue + 1 });
      return String(counter.value).padStart(padding, '0');
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
  }

  counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { value: 1 } },
    { new: true, runValidators: true }
  );
  return String(counter.value).padStart(padding, '0');
};

module.exports = { nextSequence };
