CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  schedule_json TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Istanbul',
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS subscriptions_enabled_idx
  ON subscriptions(enabled);

CREATE TABLE IF NOT EXISTS notification_log (
  subscription_id TEXT NOT NULL,
  notification_key TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  PRIMARY KEY (subscription_id, notification_key)
);

CREATE INDEX IF NOT EXISTS notification_log_sent_at_idx
  ON notification_log(sent_at);
