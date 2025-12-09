#!/usr/bin/env node

/**
 * Migration Script: Add due_date to all existing bills
 * Sets due_date to 7 days after created_at for bills that don't have a due_date
 * 
 * Usage: node migrateAddDueDates.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb+srv://user:password@cluster.mongodb.net/home_cleaning_service?retryWrites=true&w=majority";

// Define the Bill Schema
const BillSchema = new mongoose.Schema({
  order_id: mongoose.Schema.Types.ObjectId,
  amount: Number,
  status: { type: String, enum: ['UNPAID', 'PAID', 'DISPUTED'], default: 'UNPAID' },
  dispute_note: String,
  created_at: { type: Date, default: Date.now },
  paid_at: Date,
  due_date: { type: Date }
});

async function migrateAddDueDates() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✓ Connected to MongoDB");

    const Bill = mongoose.model('Bill', BillSchema, 'bills');

    // Find all bills without a due_date
    const billsWithoutDueDate = await Bill.find({ due_date: null });
    
    console.log(`\nFound ${billsWithoutDueDate.length} bills without due_date`);

    if (billsWithoutDueDate.length === 0) {
      console.log("✓ All bills already have due_date set");
      await mongoose.connection.close();
      return;
    }

    // Update each bill
    let updatedCount = 0;
    for (const bill of billsWithoutDueDate) {
      const dueDate = new Date(bill.created_at.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      await Bill.findByIdAndUpdate(
        bill._id,
        { due_date: dueDate },
        { new: true }
      );
      
      updatedCount++;
      console.log(`✓ Bill ${bill._id}: due_date set to ${dueDate.toISOString()}`);
    }

    console.log(`\n✓ Successfully updated ${updatedCount} bills with due dates`);

    // Verify the update
    const allBills = await Bill.find({});
    const billsWithDueDate = allBills.filter(b => b.due_date !== null && b.due_date !== undefined);
    
    console.log(`\nVerification: ${billsWithDueDate.length}/${allBills.length} bills now have due_date`);

    await mongoose.connection.close();
    console.log("✓ Migration complete");
    
  } catch (err) {
    console.error("✗ Migration error:", err.message);
    process.exit(1);
  }
}

// Run the migration
migrateAddDueDates();
