-- A reviewed downgrade must retain existing records above the new cap.
-- New allocations remain atomically guarded by used+reserved+quantity<=hard_limit.
ALTER TABLE usage_counter DROP CONSTRAINT usage_counter_check;
ALTER TABLE usage_counter ADD CONSTRAINT usage_counter_nonnegative CHECK (used>=0 AND reserved>=0 AND hard_limit>=0);
